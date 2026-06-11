require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const run = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected successfully.');

    const users = await User.find({}, 'name email password isAdmin');
    console.log('\n--- Registered Users ---');
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach(u => {
        console.log(`Name: ${u.name} | Email: ${u.email} | Admin: ${u.isAdmin || false}`);
      });
    }
    console.log('------------------------\n');

    const emailToReset = process.argv[2];
    const newPassword = process.argv[3];
    const makeAdmin = process.argv[4] === '--admin';

    if (emailToReset && newPassword) {
      const normalizedEmail = emailToReset.trim().toLowerCase();
      console.log(`Attempting to update user: ${normalizedEmail}`);
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        console.log(`User with email "${normalizedEmail}" not found. Creating a new user account...`);
        const newUser = new User({
          name: normalizedEmail.split('@')[0], // default name from email prefix
          email: normalizedEmail,
          password: newPassword,
          isAdmin: makeAdmin
        });
        await newUser.save();
        console.log(`User account created successfully!`);
        console.log(`Name: ${newUser.name}`);
        console.log(`Email: ${newUser.email}`);
        console.log(`Password: ${newPassword}`);
        console.log(`Admin Status: ${newUser.isAdmin}`);
      } else {
        user.password = newPassword;
        if (makeAdmin) {
          user.isAdmin = true;
          console.log(`Promoting ${normalizedEmail} to Admin...`);
        }
        await user.save();
        console.log(`Password for user ${normalizedEmail} has been successfully updated.`);
        if (makeAdmin) {
          console.log(`User ${normalizedEmail} is now an Admin!`);
        }
      }
    } else {
      console.log('Usage:');
      console.log('  node reset-password-util.js <email> <password> [--admin]');
    }
  } catch (err) {
    console.error('An error occurred:', err);
  } finally {
    await mongoose.connection.close();
    console.log('DB connection closed.');
  }
};

run();
