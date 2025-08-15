const express = require('express');
const router = express.Router();
const controller = require('../controllers/package.controller');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, controller.getAssignedPackages);            // Paquetes asignados (para delivery/admin)
router.get('/unassigned', verifyToken, controller.getUnassignedPackages); // Paquetes sin asignar (para admin)
router.put('/:id', verifyToken, controller.updatePackageStatus);         // Cambiar status de paquete
router.put('/:id/assign', verifyToken, controller.assignExistingPackage); // Asignar paquete existente a delivery
router.post('/assign', verifyToken, controller.assignPackageToDelivery); // Crear y asignar paquete (admin)

module.exports = router;
