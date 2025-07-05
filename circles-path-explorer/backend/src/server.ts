import express from 'express';
import cors from 'cors';
import { Server } from 'socket.io';
import { createServer } from 'http';
import dotenv from 'dotenv';
import { ChatSession } from './services/chat-session';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    sessions: sessions.size
  });
});

// Session management
const sessions = new Map<string, ChatSession>();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Create new chat session
  const session = new ChatSession(
    socket.id,
    process.env.GRAPH_API_KEY || '',
    process.env.OPENAI_API_KEY || '',
    process.env.OPENAI_MODEL
  );
  sessions.set(socket.id, session);

  // Initialize session
  session.initialize()
    .then(() => {
      console.log(`Session initialized: ${socket.id}`);
      socket.emit('ready', {
        sessionId: socket.id,
        model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'
      });
    })
    .catch(error => {
      console.error(`Failed to initialize session ${socket.id}:`, error);
      socket.emit('error', { 
        message: 'Failed to initialize chat session',
        details: error.message 
      });
    });

  // Handle incoming messages
  socket.on('message', async (data: { message: string }) => {
    try {
      console.log(`Message from ${socket.id}: ${data.message}`);
      const response = await session.processMessage(data.message);
      socket.emit('message', response);
    } catch (error: any) {
      console.error(`Error processing message from ${socket.id}:`, error);
      socket.emit('error', { 
        message: 'Failed to process message',
        details: error.message 
      });
    }
  });

  // Handle message history request
  socket.on('get_history', () => {
    const messages = session.getMessages();
    socket.emit('history', { messages });
  });

  // Handle typing indicator
  socket.on('typing', (data: { isTyping: boolean }) => {
    socket.broadcast.emit('user_typing', { 
      sessionId: socket.id, 
      isTyping: data.isTyping 
    });
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    const session = sessions.get(socket.id);
    if (session) {
      session.disconnect();
      sessions.delete(socket.id);
    }
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Express error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Chat backend server running on port ${PORT}`);
  console.log(`📡 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`🤖 OpenAI Model: ${process.env.OPENAI_MODEL || 'gpt-4-turbo-preview'}`);
  console.log(`🔌 WebSocket endpoint: ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  sessions.forEach(session => session.disconnect());
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  sessions.forEach(session => session.disconnect());
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});