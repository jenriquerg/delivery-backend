const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const locationRoutes = require('./src/routes/location.routes');
const packageRoutes = require('./src/routes/package.routes');
const { initSocket } = require('./src/sockets/location.socket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:4200', // En dev, Angular local
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// CORS para el backend REST (solo si no es producción)
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: 'http://localhost:4200',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }));
}

app.use(express.json());

// Rutas API
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/packages', packageRoutes);

// Inicializa socket.io
initSocket(io);

// ---------- Servir Angular en producción ----------
if (process.env.NODE_ENV === 'production') {
  const angularPath = path.join(__dirname, 'dist', 'app-tracker', 'browser');
  app.use(express.static(angularPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(angularPath, 'index.html'));
  });
}


// ---------------------------------------------------

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});