const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all fields' });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    console.log(`Registration attempt for: ${normalizedEmail}`);

    const userExists = await User.findOne({ email: normalizedEmail });

    if (userExists) {
      console.log(`User already exists: ${normalizedEmail}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = new User({
      name,
      email: normalizedEmail,
      password,
      isAdmin: false, // Enforce student role by default (not admin)
    });

    await user.save();

    if (user) {
      console.log(`User created successfully: ${normalizedEmail}`);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();
    console.log(`Login attempt for: ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log(`User not found: ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    console.log(`Password length: ${password.length}`);
    console.log(`Hash starts with $: ${user.password.startsWith('$')}`);
    console.log(`Hash length: ${user.password.length}`);
    console.log(`Hash start: ${user.password.substring(0, 10)}...`);

    const isMatch = await user.comparePassword(password);
    console.log(`Password match for ${normalizedEmail}: ${isMatch}`);

    if (isMatch) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    const mongoose = require('mongoose');
    
    // Enrich users with subject count
    const enrichedUsers = await Promise.all(users.map(async (user) => {
      const subjectCount = await mongoose.model('Subject').countDocuments({ userId: user._id });
      return {
        ...user.toObject(),
        subjectCount,
      };
    }));

    res.json(enrichedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error fetching users' });
  }
};

const toggleUserAdmin = async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own admin status' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isAdmin = !user.isAdmin;
    await user.save();
    res.json({ message: `User admin status updated successfully`, user });
  } catch (error) {
    console.error('Error toggling admin status:', error);
    res.status(500).json({ message: 'Server error updating admin status' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete yourself' });
    }
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await User.findByIdAndDelete(userId);
    const mongoose = require('mongoose');
    await mongoose.model('Subject').deleteMany({ userId });
    res.json({ message: 'User and their subjects deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile, getAllUsers, toggleUserAdmin, deleteUser };
