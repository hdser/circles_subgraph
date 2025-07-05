import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, Send, X, Loader2, Bot, User, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    results?: any;
    action?: string;
    error?: boolean;
  };
}

interface ChatBotProps {
  className?: string;
}

export default function ChatBot({ className }: ChatBotProps) {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ sessionId: string; model: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize socket connection
  useEffect(() => {
    const socketUrl = import.meta.env.VITE_CHAT_SERVER_URL || 'http://localhost:3001';
    console.log('Connecting to chat server:', socketUrl);
    
    const socketInstance = io(socketUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketInstance.on('connect', () => {
      console.log('Connected to chat server');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from chat server');
      setIsConnected(false);
    });

    socketInstance.on('ready', (data: { sessionId: string; model: string }) => {
      console.log('Chat session ready:', data);
      setSessionInfo(data);
      // Welcome message is now sent from the backend
    });

    socketInstance.on('message', (message: ChatMessage) => {
      console.log('Received message:', message);
      setMessages(prev => [...prev, message]);
      setIsTyping(false);
    });

    socketInstance.on('history', (data: { messages: ChatMessage[] }) => {
      console.log('Received history:', data);
      setMessages(data.messages);
    });

    socketInstance.on('error', (error: { message: string; details?: string }) => {
      console.error('Chat error:', error);
      toast.error(error.message);
      setIsTyping(false);
    });

    setSocket(socketInstance);

    // Request history if reconnecting
    socketInstance.emit('get_history');

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(() => {
    if (!inputValue.trim() || !socket || !isConnected || isTyping) return;

    const userMessage: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    socket.emit('message', { message: inputValue });
  }, [inputValue, socket, isConnected, isTyping]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href);
      setIsOpen(false);
    } else {
      window.open(href, '_blank');
    }
  };

  const renderMessageContent = (message: ChatMessage) => {
    if (message.role !== 'assistant') {
      return <p className="whitespace-pre-wrap">{message.content}</p>;
    }

    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
            li: ({ children }) => <li className="mb-0">{children}</li>,
            strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
            code: ({ inline, children }) => 
              inline ? (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>
              ) : (
                <pre className="bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                  <code className="font-mono">{children}</code>
                </pre>
              ),
            a: ({ href, children }) => (
              <button
                onClick={() => handleLinkClick(href || '#')}
                className="text-circles-purple hover:underline cursor-pointer"
              >
                {children}
              </button>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-gray-300 pl-4 italic text-gray-700">
                {children}
              </blockquote>
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={toggleChat}
        className={clsx(
          'fixed bottom-6 right-6 p-4 bg-circles-purple text-white rounded-full shadow-lg hover:bg-purple-700 transition-all duration-200 z-40',
          'hover:scale-110 active:scale-95',
          isOpen && 'scale-0 opacity-0',
          className
        )}
        aria-label="Open chat"
      >
        <MessageCircle className="h-6 w-6" />
        {!isConnected && (
          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      <div
        className={clsx(
          'fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-xl shadow-2xl flex flex-col transition-all duration-300 z-50',
          'border border-gray-200',
          isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-circles-purple to-purple-700 text-white rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <Bot className="h-6 w-6" />
              <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300" />
            </div>
            <div>
              <h3 className="font-semibold">Circles Assistant</h3>
              <p className="text-xs text-purple-200">
                {isConnected ? `Connected${sessionInfo ? ` • ${sessionInfo.model}` : ''}` : 'Connecting...'}
              </p>
            </div>
          </div>
          <button
            onClick={toggleChat}
            className="p-1 hover:bg-purple-600 rounded transition-colors"
            aria-label="Close chat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((message) => (
            <div
              key={message.id}
              className={clsx(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={clsx(
                  'flex items-start space-x-2 max-w-[85%]',
                  message.role === 'user' && 'flex-row-reverse space-x-reverse'
                )}
              >
                <div
                  className={clsx(
                    'flex-shrink-0 p-2 rounded-full',
                    message.role === 'user'
                      ? 'bg-circles-purple text-white'
                      : message.role === 'assistant'
                      ? 'bg-white text-gray-700 border border-gray-200'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col space-y-1">
                  <div
                    className={clsx(
                      'px-4 py-2 rounded-lg shadow-sm',
                      message.role === 'user'
                        ? 'bg-circles-purple text-white'
                        : message.role === 'assistant'
                        ? 'bg-white text-gray-900 border border-gray-100'
                        : 'bg-red-50 text-red-900 border border-red-200'
                    )}
                  >
                    {renderMessageContent(message)}
                  </div>
                  <p className={clsx(
                    'text-xs text-gray-500',
                    message.role === 'user' ? 'text-right' : 'text-left'
                  )}>
                    {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex items-start space-x-2">
              <div className="p-2 rounded-full bg-white text-gray-700 border border-gray-200">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl">
          <div className="flex items-end space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Ask about transactions or addresses..." : "Connecting..."}
              disabled={!isConnected || isTyping}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-circles-purple focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none"
              aria-label="Chat input"
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || !isConnected || isTyping}
              className="p-2 bg-circles-purple text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex-shrink-0"
              aria-label="Send message"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setInputValue("Show me recent circular transfers")}
              disabled={!isConnected || isTyping}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            >
              🔄 Circular transfers
            </button>
            <button
              onClick={() => setInputValue("Help")}
              disabled={!isConnected || isTyping}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            >
              💡 Help
            </button>
            <button
              onClick={() => setInputValue("What are trust networks?")}
              disabled={!isConnected || isTyping}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
            >
              🤝 Trust networks
            </button>
          </div>
        </div>
      </div>
    </>
  );
}