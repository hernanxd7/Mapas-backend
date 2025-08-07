const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const { isAdmin, isDelivery } = require('../middlewares/auth.middleware');

router.post('/', isAdmin, packageController.createPackage);
router.get('/delivery/:deliveryId?', packageController.getPackagesByDelivery);
router.put('/status', isDelivery, packageController.updatePackageStatus);
router.get('/all', isAdmin, packageController.getAllPackages);

module.exports = router;