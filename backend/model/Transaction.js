// src/models/Transaction.js
import prisma from '../database.js';

class Transaction {
  static async create(transactionData) {
    return await prisma.transaction.create({
      data: transactionData,
      include: {
        order: true,
        user: { include: { profile: true } }
      }
    });
  }

  static async findById(id) {
    return await prisma.transaction.findUnique({
      where: { id },
      include: {
        order: true,
        user: { include: { profile: true } }
      }
    });
  }

  static async findByUserId(userId) {
    return await prisma.transaction.findMany({
      where: { userId },
      include: { order: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findByOrderId(orderId) {
    return await prisma.transaction.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateStatus(providerId, status) {
    return await prisma.transaction.update({
      where: { providerId },
      data: { status }
    });
  }
}

export default Transaction;