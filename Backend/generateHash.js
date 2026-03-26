import bcrypt from 'bcryptjs';

async function generateHash() {
  try {
    const password = 'Admin123'; // Change this to your desired password

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    console.log('Password:', password);
    console.log('Hash:', hash);
    console.log('\nUse this SQL to update/create admin:');
    console.log(
      `UPDATE users SET password = '${hash}' WHERE email = 'admin@marketstore.com';`
    );

  } catch (error) {
    console.error('Error generating hash:', error);
  }
}
// $ ls generateHash.js
// node generateHash.js Admin123
// $2b$10$H7LTBD04Mtp3X43yxfDqVODwAp936hZm9vUXTUliu4fWh5IHwn1CC
// Admin123
// admin@store.com 


generateHash();