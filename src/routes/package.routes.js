const express = require('express');
const router = express.Router();
const controller = require('../controllers/package.controller');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', verifyToken, controller.getAssignedPackages); // para delivery
router.put('/:id', verifyToken, controller.updatePackageStatus); // cambiar status
router.post('/assign', verifyToken, controller.assignPackageToDelivery); // admin

module.exports = router;
