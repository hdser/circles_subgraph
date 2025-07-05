import React, { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Send, Loader2, Bot, User, Sparkles } from 'lucide-react';
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

export default function Chat() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [sessionInfo, setSessionInfo] = useState<{ sessionId: string; model: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
    
    // Reset textarea height
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }, [inputValue, socket, isConnected, isTyping]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
  };

  const handleLinkClick = (href: string) => {
    if (href.startsWith('/')) {
      navigate(href);
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
    <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="bg-white rounded-t-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Bot className="h-8 w-8 text-circles-purple" />
            <Sparkles className="h-4 w-4 absolute -top-1 -right-1 text-yellow-300" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Circles Assistant</h1>
            <p className="text-sm text-gray-600">
              {isConnected ? `Connected${sessionInfo ? ` • ${sessionInfo.model}` : ''}` : 'Connecting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-white border-x border-gray-200 p-6">
        <div className="space-y-6">
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
                  'flex items-start space-x-3 max-w-3xl',
                  message.role === 'user' && 'flex-row-reverse space-x-reverse'
                )}
              >
                <div
                  className={clsx(
                    'flex-shrink-0 p-2 rounded-full',
                    message.role === 'user'
                      ? 'bg-circles-purple text-white'
                      : message.role === 'assistant'
                      ? 'bg-gray-100 text-gray-700'
                      : 'bg-red-100 text-red-700'
                  )}
                >
                  {message.role === 'user' ? (
                    <User className="h-5 w-5" />
                  ) : (
                    <Bot className="h-5 w-5" />
                  )}
                </div>
                <div className="flex flex-col space-y-1">
                  <div
                    className={clsx(
                      'px-4 py-3 rounded-lg',
                      message.role === 'user'
                        ? 'bg-circles-purple text-white'
                        : message.role === 'assistant'
                        ? 'bg-gray-100 text-gray-900'
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
            <div className="flex items-start space-x-3">
              <div className="p-2 rounded-full bg-gray-100 text-gray-700">
                <Bot className="h-5 w-5" />
              </div>
              <div className="bg-gray-100 px-4 py-3 rounded-lg">
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
      </div>

      {/* Input */}
      <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-end space-x-4">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isConnected ? "Ask about transactions, addresses, or how Circles works..." : "Connecting..."}
            disabled={!isConnected || isTyping}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-circles-purple focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed resize-none min-h-[52px] max-h-[200px]"
            rows={1}
          />
          <button
            onClick={sendMessage}
            disabled={!inputValue.trim() || !isConnected || isTyping}
            className="px-6 py-3 bg-circles-purple text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isTyping ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
        
        {/* Quick Actions */}
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">Quick actions:</span>
          <button
            onClick={() => setInputValue("Show me recent circular transfers")}
            disabled={!isConnected || isTyping}
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
          >
            🔄 Circular transfers
          </button>
          <button
            onClick={() => setInputValue("What are trust networks in Circles?")}
            disabled={!isConnected || isTyping}
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
          >
            🤝 Trust networks
          </button>
          <button
            onClick={() => setInputValue("How do multi-hop transfers work?")}
            disabled={!isConnected || isTyping}
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
          >
            🔀 Multi-hop transfers
          </button>
          <button
            onClick={() => setInputValue("Help")}
            disabled={!isConnected || isTyping}
            className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors disabled:opacity-50"
          >
            💡 Help
          </button>
        </div>
      </div>
    </div>
  );
}