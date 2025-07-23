import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Client } from 'pg';

// Import routes
import authRoutes from './routes/auth';
import gameRoutes from './routes/games';
import chatRoutes from './routes/chat';
// import steamRoutes from './routes/steam';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Database connection
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

// Test database connection
async function testConnection() {
  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL database');
    
    // Test query
    const result = await client.query('SELECT NOW()');
    console.log('✅ Database query test successful:', result.rows[0]);
    
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/chat', chatRoutes);
// app.use('/api/steam', steamRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Chat functionality
  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    console.log(`User ${socket.id} left room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    socket.to(data.roomId).emit('receive_message', data);
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 3001;

// Start server only after database connection is established
async function startServer() {
  const dbConnected = await testConnection();
  
  if (dbConnected) {
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } else {
    console.error('❌ Failed to start server due to database connection issues');
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await client.end();
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await client.end();
  server.close(() => {
    console.log('Process terminated');
  });
}); 