import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { MONGO_URI } from '../config.js';
import User from '../models/User.js';
import Article from '../models/Article.js';
import Ticket from '../models/Ticket.js';

async function run() {
  await mongoose.connect(MONGO_URI);
  await Promise.all([User.deleteMany({}), Article.deleteMany({}), Ticket.deleteMany({})]);

  const password = await bcrypt.hash('password123', 10);
  const [admin, agent, user] = await User.create([
    { name: 'Admin', email: 'admin@example.com', password_hash: password, role: 'admin' },
    { name: 'Agent', email: 'agent@example.com', password_hash: password, role: 'agent' },
    { name: 'User', email: 'user@example.com', password_hash: password, role: 'user' }
  ]);

  await Article.create([
    { title: 'How to update payment method', body: 'Go to Settings > Billing > Update card...', tags: ['billing','payments'], status: 'published' },
    { title: 'Troubleshooting 500 errors', body: 'Check logs, restart service, verify env vars...', tags: ['tech','errors'], status: 'published' },
    { title: 'Tracking your shipment', body: 'Use the tracking link sent via email...', tags: ['shipping','delivery'], status: 'published' }
  ]);

  await Ticket.create([
    { title: 'Refund for double charge', description: 'I was charged twice for order #1234', category: 'other', createdBy: user._id },
    { title: 'App shows 500 on login', description: 'Stack trace mentions auth module', category: 'other', createdBy: user._id },
    { title: 'Where is my package?', description: 'Shipment delayed 5 days', category: 'other', createdBy: user._id }
  ]);

  console.log('Seeded. Users: admin@example.com / agent@example.com / user@example.com (password123)');
  await mongoose.disconnect();
}

run().catch(e => { console.error(e); process.exit(1); });
