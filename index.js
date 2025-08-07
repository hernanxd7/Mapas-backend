require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/auth.routes');
const deliveryRoutes = require('./src/routes/delivery.routes');
const packageRoutes = require('./src/routes/package.routes');
const { verifyToken } = require('./src/middlewares/auth.middleware');
const db = require('./src/config/db'); // Importar la configuración de la base de datos

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/delivery', verifyToken, deliveryRoutes);
app.use('/api/packages', verifyToken, packageRoutes);

// Socket.io para actualizaciones en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  socket.on('updateLocation', (data) => {
    // Emitir la ubicación actualizada a todos los clientes (admin)
    io.emit('locationUpdated', data);
  });

  socket.on('packageStatusUpdate', (data) => {
    // Emitir actualización de estado del paquete
    io.emit('packageUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Puerto del servidor
const PORT = process.env.PORT || 3000;

// Iniciar el servidor después de probar la conexión a la base de datos
async function startServer() {
  console.log('🔄 Probando conexión a Supabase...');
  
  // Probar la conexión a la base de datos
  const connected = await db.testConnection();
  
  if (connected) {
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
      console.log(`📡 API disponible en http://localhost:${PORT}/api`);
    });
  } else {
    console.error('❌ No se pudo iniciar el servidor debido a problemas de conexión con la base de datos');
    process.exit(1); // Salir con código de error
  }
}

startServer();