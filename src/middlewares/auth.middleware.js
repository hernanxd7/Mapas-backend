const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ message: 'No se proporcionó token de autenticación' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido o expirado' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Requiere rol de administrador' });
  }
  next();
};

const isDelivery = (req, res, next) => {
  if (req.user.role !== 'delivery') {
    return res.status(403).json({ message: 'Requiere rol de delivery' });
  }
  next();
};

module.exports = {
  verifyToken,
  isAdmin,
  isDelivery
};