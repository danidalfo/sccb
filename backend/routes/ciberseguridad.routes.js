const express = require('express');
const router = express.Router();

const ciberseguridad = require('../controllers/ciberseguridad.controller');

//Metodo1
router.get('/text1', ciberseguridad.getText1);
//Metodo2
router.post('/publicKey', ciberseguridad.getPublicKey);
router.get('/text2', ciberseguridad.getText2);
//Metodo3
router.post('/signedBlinded', ciberseguridad.signedBlinded);


module.exports = router;