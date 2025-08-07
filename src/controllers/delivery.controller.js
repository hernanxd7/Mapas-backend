const locationModel = require('../models/location.model');
const userModel = require('../models/user.model');

const updateLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    const userId = req.user.id;
    
    const location = await locationModel.saveLocation(userId, latitude, longitude);
    
    res.status(200).json(location);
  } catch (error) {
    console.error('Error al actualizar ubicación:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await userModel.getAllDeliveries();
    res.status(200).json(deliveries);
  } catch (error) {
    console.error('Error al obtener deliveries:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const getAllLocations = async (req, res) => {
  try {
    const locations = await locationModel.getAllDeliveryLocations();
    res.status(200).json(locations);
  } catch (error) {
    console.error('Error al obtener ubicaciones:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId, status } = req.body;
    const updatedDelivery = await userModel.updateDeliveryStatus(deliveryId, status);
    
    if (!updatedDelivery) {
      return res.status(404).json({ message: 'Delivery no encontrado' });
    }
    
    res.status(200).json(updatedDelivery);
  } catch (error) {
    console.error('Error al actualizar estado del delivery:', error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

module.exports = {
  updateLocation,
  getAllDeliveries,
  getAllLocations,
  updateDeliveryStatus
};