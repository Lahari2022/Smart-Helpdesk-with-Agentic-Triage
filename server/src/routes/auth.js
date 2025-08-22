import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User.js';
import { JWT_SECRET } from '../config.js';

const router = express.Router();

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['admin','agent','user']).optional()
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = registerSchema.parse(req.body);
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });
    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password_hash, role: role || 'user' });
    const token = jwt.sign({ sub: user._id, email, role: user.role, name }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = z.object({ email: z.string().email(), password: z.string().min(6) }).parse(req.body);
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ sub: user._id, email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (e) { next(e); }
});

export default router;
