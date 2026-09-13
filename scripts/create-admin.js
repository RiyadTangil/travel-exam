const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdminUser() {
  console.log('Connecting to MongoDB...');
  process.env.MONGODB_URI
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db('manage_agency');
  const users = db.collection('users');

  console.log('Hashing password...');
  const hashedPassword = await bcrypt.hash('admin123', 12);

  const adminUser = {
    email: 'admin@example.com',
    password: hashedPassword,
    name: 'Admin User',
    role: 'admin',
    isVerified: true,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log('Creating/updating admin user...');
  const result = await users.updateOne(
    { email: 'admin@example.com' },
    { $set: adminUser },
    { upsert: true }
  );

  console.log('Admin user created or updated:', result.acknowledged ? 'Success' : 'Failed');
  await client.close();
  console.log('Connection closed');
}

createAdminUser()
  .catch(error => console.error('Error:', error))
  .finally(() => console.log('Script finished')); 