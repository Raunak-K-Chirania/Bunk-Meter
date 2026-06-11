const bcrypt = require('bcryptjs');

async function test() {
  const password = 'password123';
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log('Password:', password);
  console.log('Hash:', hash);
  
  const isMatch = await bcrypt.compare(password, hash);
  console.log('Is Match:', isMatch);
}

test();
