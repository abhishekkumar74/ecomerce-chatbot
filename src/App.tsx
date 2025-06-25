import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, LogOut, MessageCircle, RotateCcw, Search } from 'lucide-react';
import LoginForm from './components/LoginForm';
import ChatInterface from './components/ChatInterface';
import ProductGrid from './components/ProductGrid';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function AppContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('chat');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {!user ? (
        <LoginForm />
      ) : (
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <ShoppingBag className="h-8 w-8 text-blue-600" />
                    <h1 className="text-xl font-bold text-gray-900">ShopBot</h1>
                  </div>
                  
                  {/* Tab Navigation */}
                  <nav className="hidden md:flex space-x-4">
                    <button
                      onClick={() => setActiveTab('chat')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'chat'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <MessageCircle className="h-4 w-4 inline mr-2" />
                      Chat Assistant
                    </button>
                    <button
                      onClick={() => setActiveTab('products')}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === 'products'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <Search className="h-4 w-4 inline mr-2" />
                      Browse Products
                    </button>
                  </nav>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span className="hidden sm:inline">{user.username}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {/* Mobile Tab Navigation */}
              <div className="md:hidden pb-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'chat'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <MessageCircle className="h-4 w-4 inline mr-2" />
                    Chat
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`flex-1 px-3 py-2 rounded-lg font-medium transition-colors ${
                      activeTab === 'products'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    <Search className="h-4 w-4 inline mr-2" />
                    Products
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-hidden">
            {activeTab === 'chat' ? (
              <ChatInterface />
            ) : (
              <ProductGrid />
            )}
          </main>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;