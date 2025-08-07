const packageModel = require('../models/package.model');

const createPackage = async (req, res) => {
  try {
    const { deliveryAddress, deliveryId } = req.body;
    
    const newPackage = await packageModel.createPackage(deliveryAddress, deliveryId);
    
    res.status(201).json(newPackage);
  } catch (error) {
    console.error('Error al crear paquete:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const getPackagesByDelivery = async (req, res) => {
  try {
    const deliveryId = req.user.role === 'delivery' ? req.user.id : req.params.deliveryId;
    
    const packages = await packageModel.getPackagesByDeliveryId(deliveryId);
    
    res.status(200).json(packages);
  } catch (error) {
    console.error('Error al obtener paquetes:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const updatePackageStatus = async (req, res) => {
  try {
    const { packageId, status } = req.body;
    
    // Verificar que el estado sea válido
    const validStatus = ['en_transito', 'entregado', 'regresado'];
    if (!validStatus.includes(status)) {
      return res.status(400).json({ message: 'Estado de paquete inválido' });
    }
    
    const updatedPackage = await packageModel.updatePackageStatus(packageId, status);
    
    if (!updatedPackage) {
      return res.status(404).json({ message: 'Paquete no encontrado' });
    }
    
    res.status(200).json(updatedPackage);
  } catch (error) {
    console.error('Error al actualizar estado del paquete:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const getAllPackages = async (req, res) => {
  try {
    const packages = await packageModel.getAllPackages();
    res.status(200).json(packages);
  } catch (error) {
    console.error('Error al obtener todos los paquetes:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = {
  createPackage,
  getPackagesByDelivery,
  updatePackageStatus,
  getAllPackages
};