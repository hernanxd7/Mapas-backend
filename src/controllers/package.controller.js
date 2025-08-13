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

// Nueva función para crear paquetes desde el admin
const createPackageNew = async (req, res) => {
  try {
    const { recipient_name, delivery_address, delivery_id } = req.body;
    
    const newPackage = await packageModel.createPackageNew(recipient_name, delivery_address, delivery_id);
    
    res.status(201).json(newPackage);
  } catch (error) {
    console.error('Error al crear paquete nuevo:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Nueva función para asignar delivery a un paquete
const assignDeliveryToPackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { delivery_id } = req.body;
    
    const updatedPackage = await packageModel.assignDeliveryToPackage(packageId, delivery_id);
    
    if (!updatedPackage) {
      return res.status(404).json({ message: 'Paquete no encontrado' });
    }
    
    res.status(200).json(updatedPackage);
  } catch (error) {
    console.error('Error al asignar delivery:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

// Nueva función para actualizar solo el estado
const updatePackageStatusOnly = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { status } = req.body;
    
    const validStatus = ['asignado', 'en_transito', 'entregado'];
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
  createPackageNew,
  assignDeliveryToPackage,
  updatePackageStatusOnly,
  getPackagesByDelivery,
  updatePackageStatus,
  getAllPackages
};