import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3001;
const JWT_SECRET = 'your-secret-key-here';

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database(':memory:');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Products table
  db.run(`CREATE TABLE products (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT,
    price REAL,
    category TEXT,
    image_url TEXT,
    stock INTEGER,
    rating REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Chat sessions table
  db.run(`CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Chat messages table
  db.run(`CREATE TABLE chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT,
    user_id TEXT,
    message TEXT,
    sender TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions (id),
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);

  // Insert mock product data
  const products = [
    // Electronics
    { id: uuidv4(), name: 'iPhone 15 Pro', description: 'Latest iPhone with A17 Pro chip', price: 999.99, category: 'Electronics', image_url: 'https://images.pexels.com/photos/788946/pexels-photo-788946.jpeg', stock: 50, rating: 4.8 },
    { id: uuidv4(), name: 'MacBook Air M2', description: 'Lightweight laptop with M2 chip', price: 1199.99, category: 'Electronics', image_url: 'https://images.pexels.com/photos/205421/pexels-photo-205421.jpeg', stock: 30, rating: 4.9 },
    { id: uuidv4(), name: 'AirPods Pro', description: 'Wireless earbuds with noise cancellation', price: 249.99, category: 'Electronics', image_url: 'https://images.pexels.com/photos/3780681/pexels-photo-3780681.jpeg', stock: 100, rating: 4.7 },
    { id: uuidv4(), name: 'iPad Pro 12.9"', description: 'Professional tablet with M2 chip', price: 1099.99, category: 'Electronics', image_url: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg', stock: 25, rating: 4.8 },
    { id: uuidv4(), name: 'Samsung Galaxy S24', description: 'Android flagship with AI features', price: 799.99, category: 'Electronics', image_url: 'https://images.pexels.com/photos/2643698/pexels-photo-2643698.jpeg', stock: 40, rating: 4.6 },
    
    // Fashion
    { id: uuidv4(), name: 'Premium Leather Jacket', description: 'Genuine leather jacket for all seasons', price: 299.99, category: 'Fashion', image_url: 'https://images.pexels.com/photos/1183266/pexels-photo-1183266.jpeg', stock: 20, rating: 4.5 },
    { id: uuidv4(), name: 'Designer Sneakers', description: 'Comfortable and stylish sneakers', price: 159.99, category: 'Fashion', image_url: 'https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg', stock: 60, rating: 4.4 },
    { id: uuidv4(), name: 'Casual T-Shirt', description: '100% cotton casual wear', price: 29.99, category: 'Fashion', image_url: 'https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg', stock: 150, rating: 4.2 },
    { id: uuidv4(), name: 'Denim Jeans', description: 'Classic blue jeans with perfect fit', price: 79.99, category: 'Fashion', image_url: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg', stock: 80, rating: 4.3 },
    { id: uuidv4(), name: 'Winter Coat', description: 'Warm and waterproof winter coat', price: 199.99, category: 'Fashion', image_url: 'https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg', stock: 30, rating: 4.6 },
    
    // Home & Kitchen
    { id: uuidv4(), name: 'Coffee Maker', description: 'Automatic drip coffee maker', price: 89.99, category: 'Home & Kitchen', image_url: 'https://images.pexels.com/photos/302899/pexels-photo-302899.jpeg', stock: 45, rating: 4.3 },
    { id: uuidv4(), name: 'Air Fryer', description: 'Healthy cooking with less oil', price: 129.99, category: 'Home & Kitchen', image_url: 'https://images.pexels.com/photos/4226796/pexels-photo-4226796.jpeg', stock: 35, rating: 4.5 },
    { id: uuidv4(), name: 'Throw Pillow Set', description: 'Decorative pillows for couch', price: 39.99, category: 'Home & Kitchen', image_url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', stock: 70, rating: 4.1 },
    { id: uuidv4(), name: 'Kitchen Knife Set', description: 'Professional chef knives', price: 149.99, category: 'Home & Kitchen', image_url: 'https://images.pexels.com/photos/2291367/pexels-photo-2291367.jpeg', stock: 25, rating: 4.7 },
    { id: uuidv4(), name: 'LED Desk Lamp', description: 'Adjustable LED lamp for work', price: 59.99, category: 'Home & Kitchen', image_url: 'https://images.pexels.com/photos/1107717/pexels-photo-1107717.jpeg', stock: 55, rating: 4.4 },
    
    // Books
    { id: uuidv4(), name: 'JavaScript Guide', description: 'Complete guide to modern JavaScript', price: 49.99, category: 'Books', image_url: 'https://images.pexels.com/photos/159740/library-la-trobe-study-students-159740.jpeg', stock: 100, rating: 4.8 },
    { id: uuidv4(), name: 'Python Programming', description: 'Learn Python from scratch', price: 44.99, category: 'Books', image_url: 'https://images.pexels.com/photos/256541/pexels-photo-256541.jpeg', stock: 85, rating: 4.6 },
    { id: uuidv4(), name: 'Design Patterns', description: 'Software design patterns explained', price: 54.99, category: 'Books', image_url: 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg', stock: 40, rating: 4.7 },
    { id: uuidv4(), name: 'Machine Learning', description: 'Introduction to ML concepts', price: 59.99, category: 'Books', image_url: 'https://images.pexels.com/photos/1319854/pexels-photo-1319854.jpeg', stock: 30, rating: 4.5 },
    { id: uuidv4(), name: 'Web Development', description: 'Full-stack web development guide', price: 52.99, category: 'Books', image_url: 'https://images.pexels.com/photos/267669/pexels-photo-267669.jpeg', stock: 60, rating: 4.4 },
    
    // Sports & Outdoors
    { id: uuidv4(), name: 'Yoga Mat', description: 'Non-slip exercise mat', price: 34.99, category: 'Sports & Outdoors', image_url: 'https://images.pexels.com/photos/4056723/pexels-photo-4056723.jpeg', stock: 90, rating: 4.3 },
    { id: uuidv4(), name: 'Hiking Backpack', description: 'Durable backpack for outdoor adventures', price: 89.99, category: 'Sports & Outdoors', image_url: 'https://images.pexels.com/photos/1365425/pexels-photo-1365425.jpeg', stock: 40, rating: 4.6 },
    { id: uuidv4(), name: 'Running Shoes', description: 'Lightweight running shoes', price: 119.99, category: 'Sports & Outdoors', image_url: 'https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg', stock: 75, rating: 4.5 },
    { id: uuidv4(), name: 'Tennis Racket', description: 'Professional tennis racket', price: 149.99, category: 'Sports & Outdoors', image_url: 'https://images.pexels.com/photos/209977/pexels-photo-209977.jpeg', stock: 20, rating: 4.4 },
    { id: uuidv4(), name: 'Water Bottle', description: 'Insulated stainless steel bottle', price: 24.99, category: 'Sports & Outdoors', image_url: 'https://images.pexels.com/photos/3766253/pexels-photo-3766253.jpeg', stock: 120, rating: 4.2 }
  ];

  // Add more products to reach 100+
  const additionalProducts = [];
  const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports & Outdoors'];
  const baseNames = ['Premium', 'Professional', 'Deluxe', 'Advanced', 'Classic', 'Modern', 'Compact', 'Wireless', 'Smart', 'Eco-Friendly'];
  const items = ['Gadget', 'Device', 'Tool', 'Accessory', 'Kit', 'Set', 'Bundle', 'Collection', 'Series', 'Edition'];

  for (let i = 0; i < 80; i++) {
    const category = categories[i % categories.length];
    const baseName = baseNames[i % baseNames.length];
    const item = items[i % items.length];
    
    additionalProducts.push({
      id: uuidv4(),
      name: `${baseName} ${item} ${i + 1}`,
      description: `High-quality ${item.toLowerCase()} for ${category.toLowerCase()}`,
      price: Math.round((Math.random() * 500 + 20) * 100) / 100,
      category,
      image_url: 'https://images.pexels.com/photos/1029757/pexels-photo-1029757.jpeg',
      stock: Math.floor(Math.random() * 100) + 10,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10
    });
  }

  const allProducts = [...products, ...additionalProducts];

  const stmt = db.prepare('INSERT INTO products VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  allProducts.forEach(product => {
    stmt.run(product.id, product.name, product.description, product.price, product.category, product.image_url, product.stock, product.rating);
  });
  stmt.finalize();

  console.log(`Inserted ${allProducts.length} products into database`);
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes

// Authentication routes
app.post('/api/register', async (req, res) => {
  console.log('Register body:', req.body);
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    db.run(
      'INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
      [userId, username, email, hashedPassword],
      function(err) {
        if (err) {
          return res.status(400).json({ error: 'User already exists' });
        }
        
        const token = jwt.sign({ id: userId, username, email }, JWT_SECRET);
        res.json({ token, user: { id: userId, username, email } });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.get(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, username],
    async (err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }

      try {
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
          return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, username: user.username, email: user.email },
          JWT_SECRET
        );
        res.json({
          token,
          user: { id: user.id, username: user.username, email: user.email }
        });
      } catch (error) {
        res.status(500).json({ error: 'Server error' });
      }
    }
  );
});

// Product routes
app.get('/api/products', (req, res) => {
  const { category, search, min_price, max_price, limit = 20, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }

  if (search) {
    query += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  if (min_price) {
    query += ' AND price >= ?';
    params.push(parseFloat(min_price));
  }

  if (max_price) {
    query += ' AND price <= ?';
    params.push(parseFloat(max_price));
  }

  query += ' ORDER BY rating DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  db.all(query, params, (err, products) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    res.json(products);
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  db.get('SELECT * FROM products WHERE id = ?', [id], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });
});

app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM products', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Server error' });
    }
    const categories = rows.map(row => row.category);
    res.json(categories);
  });
});

// Chat routes
app.post('/api/chat/session', authenticateToken, (req, res) => {
  const sessionId = uuidv4();
  
  db.run(
    'INSERT INTO chat_sessions (id, user_id) VALUES (?, ?)',
    [sessionId, req.user.id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json({ sessionId });
    }
  );
});

app.post('/api/chat/message', authenticateToken, (req, res) => {
  const { sessionId, message } = req.body;
  const messageId = uuidv4();
  
  // Store user message
  db.run(
    'INSERT INTO chat_messages (id, session_id, user_id, message, sender) VALUES (?, ?, ?, ?, ?)',
    [messageId, sessionId, req.user.id, message, 'user'],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      
      // Generate bot response
      generateBotResponse(message, req.user.id, sessionId, (botMessage) => {
        res.json({ 
          userMessage: { id: messageId, message, sender: 'user', timestamp: new Date() },
          botMessage 
        });
      });
    }
  );
});

app.get('/api/chat/history/:sessionId', authenticateToken, (req, res) => {
  const { sessionId } = req.params;
  
  db.all(
    'SELECT * FROM chat_messages WHERE session_id = ? AND user_id = ? ORDER BY timestamp ASC',
    [sessionId, req.user.id],
    (err, messages) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(messages);
    }
  );
});

app.get('/api/chat/sessions', authenticateToken, (req, res) => {
  db.all(
    'SELECT * FROM chat_sessions WHERE user_id = ? ORDER BY created_at DESC',
    [req.user.id],
    (err, sessions) => {
      if (err) {
        return res.status(500).json({ error: 'Server error' });
      }
      res.json(sessions);
    }
  );
});

// Bot response generation
function generateBotResponse(userMessage, userId, sessionId, callback) {
  const message = userMessage.toLowerCase();
  const botMessageId = uuidv4();
  
  let response = '';
  
  // Simple keyword-based responses
  if (message.includes('hello') || message.includes('hi') || message.includes('hey')) {
    response = "Hello! Welcome to our store! I'm here to help you find the perfect products. What are you looking for today?";
  } else if (message.includes('search') || message.includes('find') || message.includes('looking for')) {
    // Extract search terms
    const searchTerms = extractSearchTerms(message);
    searchProducts(searchTerms, (products) => {
      if (products.length > 0) {
        response = `I found ${products.length} products matching your search. Here are the top results: ${products.slice(0, 3).map(p => `${p.name} ($${p.price})`).join(', ')}. Would you like to see more details about any of these?`;
      } else {
        response = "I couldn't find any products matching your search. Could you try different keywords or browse our categories: Electronics, Fashion, Home & Kitchen, Books, Sports & Outdoors?";
      }
      
      saveAndSendResponse(response, botMessageId, sessionId, userId, callback);
    });
    return;
  } else if (message.includes('category') || message.includes('categories')) {
    response = "We have products in these categories: Electronics, Fashion, Home & Kitchen, Books, and Sports & Outdoors. Which category interests you most?";
  } else if (message.includes('price') || message.includes('cheap') || message.includes('expensive') || message.includes('budget')) {
    response = "I can help you find products within your budget! What's your price range? You can say something like 'under $50' or 'between $100 and $500'.";
  } else if (message.includes('recommend') || message.includes('suggest') || message.includes('popular')) {
    getPopularProducts((products) => {
      response = `Here are our most popular products: ${products.slice(0, 3).map(p => `${p.name} ($${p.price}, ${p.rating}⭐)`).join(', ')}. Would you like more information about any of these?`;
      saveAndSendResponse(response, botMessageId, sessionId, userId, callback);
    });
    return;
  } else if (message.includes('thank') || message.includes('thanks')) {
    response = "You're welcome! Is there anything else I can help you find today?";
  } else {
    // Try to extract product names or categories from the message
    const searchTerms = extractSearchTerms(message);
    if (searchTerms.length > 0) {
      searchProducts(searchTerms, (products) => {
        if (products.length > 0) {
          response = `I found some products related to "${searchTerms.join(', ')}": ${products.slice(0, 3).map(p => `${p.name} ($${p.price})`).join(', ')}. Would you like more details?`;
        } else {
          response = "I'm not sure I understand. You can ask me to search for products, show categories, recommend popular items, or help with your budget. What would you like to do?";
        }
        saveAndSendResponse(response, botMessageId, sessionId, userId, callback);
      });
      return;
    } else {
      response = "I'm here to help you shop! You can ask me to search for products, show categories, recommend popular items, or help find something within your budget. What would you like to do?";
    }
  }
  
  saveAndSendResponse(response, botMessageId, sessionId, userId, callback);
}

function extractSearchTerms(message) {
  const words = message.toLowerCase().split(' ');
  const stopWords = ['i', 'am', 'looking', 'for', 'want', 'need', 'search', 'find', 'show', 'me', 'can', 'you', 'a', 'an', 'the', 'and', 'or', 'but'];
  return words.filter(word => word.length > 2 && !stopWords.includes(word));
}

function searchProducts(terms, callback) {
  const searchQuery = `%${terms.join('%')}%`;
  db.all(
    'SELECT * FROM products WHERE name LIKE ? OR description LIKE ? OR category LIKE ? ORDER BY rating DESC LIMIT 10',
    [searchQuery, searchQuery, searchQuery],
    (err, products) => {
      if (err) {
        callback([]);
      } else {
        callback(products);
      }
    }
  );
}

function getPopularProducts(callback) {
  db.all(
    'SELECT * FROM products ORDER BY rating DESC, stock DESC LIMIT 5',
    [],
    (err, products) => {
      if (err) {
        callback([]);
      } else {
        callback(products);
      }
    }
  );
}

function saveAndSendResponse(response, messageId, sessionId, userId, callback) {
  db.run(
    'INSERT INTO chat_messages (id, session_id, user_id, message, sender) VALUES (?, ?, ?, ?, ?)',
    [messageId, sessionId, userId, response, 'bot'],
    function(err) {
      if (err) {
        console.error('Error saving bot message:', err);
      }
      callback({
        id: messageId,
        message: response,
        sender: 'bot',
        timestamp: new Date()
      });
    }
  );
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});