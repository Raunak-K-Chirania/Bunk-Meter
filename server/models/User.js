const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false,
  },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  // Extra check: If password already looks like a bcrypt hash, don't hash it again
  // (Bcrypt hashes start with $2a$, $2b$, or $2y$)
  if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to check password validity
userSchema.methods.comparePassword = async function(candidatePassword) {
  // If the password in DB is not hashed (doesn't start with bcrypt prefix $)
  if (!this.password.startsWith('$')) {
    console.log(`Plain-text password detected for ${this.email}, attempting direct match...`);
    const isMatch = candidatePassword === this.password;
    
    if (isMatch) {
      console.log('Plain-text match successful. Hashing password for security...');
      // Setting this.password and saving will trigger the pre('save') hook to hash it
      this.password = candidatePassword; 
      await this.save();
    }
    return isMatch;
  }
  
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
