const express = require('express');
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  getAllUsers, 
  toggleUserAdmin, 
  deleteUser 
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);

// Admin routes
router.get('/users', protect, admin, getAllUsers);
router.put('/users/:id/toggle-admin', protect, admin, toggleUserAdmin);
router.delete('/users/:id', protect, admin, deleteUser);

module.exports = router;
