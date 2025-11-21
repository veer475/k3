// src/config/database.js
import { PrismaClient } from './generated/prisma/index.js';

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

export default prisma;