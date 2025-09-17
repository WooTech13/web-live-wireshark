const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');

const Database = require('./models/database');
const TsharkManager = require('./services/tsharkManager');
const authRoutes = require('./routes/auth');
const captureRoutes = require('./routes/capture');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const db = new Database();
const tsharkManager = new TsharkManager(io);

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/capture', captureRoutes);

// WebSocket Authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (token) {
    jwt.verify(token, 'your-secret-key', (err, decoded) => {
      if (err) return next(new Error('Authentication error'));
      socket.userId = decoded.id;
      next();
    });
  } else {
    next(new Error('Authentication error'));
  }
});

// WebSocket Connections
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected`);

  // Obtenir les interfaces réseau
  socket.on('get-interfaces', async () => {
    const interfaces = await tsharkManager.getNetworkInterfaces();
    socket.emit('interfaces-list', interfaces);
  });

  // Démarrer capture
  socket.on('start-capture', (data) => {
    const { interface: iface, filter } = data;
    tsharkManager.startCapture(socket.id, iface, filter, socket);
  });

  // Arrêter capture
  socket.on('stop-capture', () => {
    tsharkManager.stopCapture(socket.id);
  });

  // Pause/Resume capture
  socket.on('pause-capture', () => {
    tsharkManager.pauseCapture(socket.id);
  });

  socket.on('resume-capture', () => {
    tsharkManager.resumeCapture(socket.id);
  });

  // Export capture
  socket.on('export-capture', (format) => {
    tsharkManager.exportCapture(socket.id, format, socket);
  });

  socket.on('disconnect', () => {
    tsharkManager.stopCapture(socket.id);
    console.log(`User ${socket.userId} disconnected`);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});