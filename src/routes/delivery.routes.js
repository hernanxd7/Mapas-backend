const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { isAdmin, isDelivery } = require('../middlewares/auth.middleware');

router.post('/location', isDelivery, deliveryController.updateLocation);
router.get('/all', isAdmin, deliveryController.getAllDeliveries);
router.get('/locations', isAdmin, deliveryController.getAllLocations);
router.put('/status', isAdmin, deliveryController.updateDeliveryStatus);

module.exports = router;