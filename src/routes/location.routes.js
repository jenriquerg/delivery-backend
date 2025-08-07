const express = require('express');
const router = express.Router();
const controller = require('../controllers/location.controller');
const verifyToken = require('../middlewares/verifyToken');

router.post('/', verifyToken, controller.saveLocation);
router.get('/latest', verifyToken, controller.getLatestLocations);

module.exports = router;
