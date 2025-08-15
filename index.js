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
    origin: process.env.NODE_ENV === 'production' 
      ? 'https://tu-dominio-de-produccion.com' 
      : 'http://localhost:4200',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://tu-dominio-de-produccion.com' 
    : 'http://localhost:4200',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Almacenar sesiones activas de deliveries (MOVER AQUÍ)
const activeSessions = new Map(); // userId -> { socketId, username, lastActivity }

// Endpoint público para obtener deliveries activos
app.get('/api/delivery/active', (req, res) => {
  const activeDeliveryIds = Array.from(activeSessions.keys());
  res.json({ activeDeliveries: activeDeliveryIds });
});

// Rutas (CON autenticación)
app.use('/api/auth', authRoutes);
app.use('/api/delivery', verifyToken, deliveryRoutes);
app.use('/api/packages', verifyToken, packageRoutes);

// Socket.io para actualizaciones en tiempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Nuevo evento: cuando un admin se conecta y solicita el estado actual
  socket.on('admin-connected', () => {
    console.log('Admin conectado, enviando estado actual de deliveries activos');
    socket.emit('active-deliveries-updated', Array.from(activeSessions.keys()));
  });

  // Cuando un delivery se conecta
  socket.on('delivery-login', (data) => {
    const { userId, username, role } = data;
    if (role === 'delivery') {
      activeSessions.set(userId, {
        socketId: socket.id,
        username: username,
        lastActivity: new Date()
      });
      
      // Emitir lista actualizada de deliveries activos
      io.emit('active-deliveries-updated', Array.from(activeSessions.keys()));
      console.log(`Delivery ${username} (ID: ${userId}) conectado`);
    }
  });

  // Cuando un delivery se desconecta manualmente (logout)
  socket.on('delivery-logout', (data) => {
    const { userId } = data;
    if (activeSessions.has(userId)) {
      const session = activeSessions.get(userId);
      activeSessions.delete(userId);
      console.log(`Delivery ${session.username} (ID: ${userId}) desconectado por logout`);
      
      // Emitir lista actualizada
      io.emit('active-deliveries-updated', Array.from(activeSessions.keys()));
    }
  });

  socket.on('updateLocation', (data) => {
    // Actualizar última actividad
    if (activeSessions.has(data.userId)) {
      activeSessions.get(data.userId).lastActivity = new Date();
    }
    
    // Emitir la ubicación actualizada a todos los clientes (admin)
    io.emit('locationUpdated', data);
  });

  socket.on('packageStatusUpdate', (data) => {
    // Emitir actualización de estado del paquete
    io.emit('packageUpdated', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    
    // Remover de sesiones activas
    for (const [userId, session] of activeSessions.entries()) {
      if (session.socketId === socket.id) {
        activeSessions.delete(userId);
        console.log(`Delivery ${session.username} (ID: ${userId}) desconectado`);
        
        // Emitir lista actualizada
        io.emit('active-deliveries-updated', Array.from(activeSessions.keys()));
        break;
      }
    }
  });

  // Nuevo evento para simulación de ruta
  socket.on('route-simulation', (data) => {
    // Obtener el socketId del delivery específico si está conectado
    const deliverySession = activeSessions.get(data.deliveryId);
    
    if (deliverySession) {
      // Emitir solo al delivery específico y al admin que inició la simulación
      io.to(deliverySession.socketId).emit('route-simulation-updated', data);
      socket.emit('route-simulation-updated', data); // También al admin que lo inició
    } else {
      // Si el delivery no está conectado, solo emitir al admin
      socket.emit('route-simulation-updated', data);
      console.log(`Delivery ${data.deliveryId} no está conectado para recibir simulación`);
    }
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