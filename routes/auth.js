const express = require('express');
const { 
    register, 
    login, 
    getMe, 
    logout, 
    trocarSenha 
} = require('../controllers/auth');

const router = express.Router();
const {protect} = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me/:id', protect, getMe);


//todo:
router.post('/logout', protect, logout);
router.post('/trocarSenha', trocarSenha);



module.exports = router;