const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const { isAdmin, isDelivery } = require('../middlewares/auth.middleware');

// Rutas existentes
router.post('/', isAdmin, packageController.createPackageNew); // Cambiar a la nueva función
router.get('/delivery/:deliveryId?', packageController.getPackagesByDelivery);
router.put('/status', isDelivery, packageController.updatePackageStatus);
router.get('/all', isAdmin, packageController.getAllPackages);

// Nuevas rutas
router.put('/:packageId/assign', isAdmin, packageController.assignDeliveryToPackage);
router.put('/:packageId/status', isAdmin, packageController.updatePackageStatusOnly);

module.exports = router;