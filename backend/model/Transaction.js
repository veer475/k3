// src/models/Transaction.js
import pkg from '@prisma/client';
import prisma from '../database.js';
const {TransactionType} = pkg;

class Transaction {
  // Create transaction (idempotent-safe)
  static async create(transactionData) {
    const { provider, providerId } = transactionData;

    // Idempotency protection (payment gateways)
    if (provider && providerId) {
      const existing = await prisma.transaction.findFirst({
        where: { provider, providerId }
      });

      if (existing) return existing;
    }

    return prisma.transaction.create({
      data: transactionData,
      include: {
        order: true,
        user: { include: { profile: true } }
      }
    });
  }

  // Find transaction by ID (admin/internal)
  static async findById(id) {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        order: true,
        user: { include: { profile: true } }
      }
    });
  }

  // Get transactions for a user
  static async findByUserId(userId) {
    return prisma.transaction.findMany({
      where: { userId },
      include: { order: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get transactions for an order
  static async findByOrderId(orderId) {
    return prisma.transaction.findMany({
      where: { orderId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Find by payment provider reference (webhooks)
  static async findByProvider(provider, providerId) {
    return prisma.transaction.findFirst({
      where: { provider, providerId }
    });
  }

  // Get transactions by order + type
  static async findByOrderAndType(orderId, type) {
    return prisma.transaction.findMany({
      where: {
        orderId,
        type
      }
    });
  }

  // Wallet credit (payout / refund)
  static async creditWallet(userId, amount, orderId = null) {
    return prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId,
          orderId,
          amount,
          type: TransactionType.PAYOUT,
          provider: 'WALLET'
        }
      }),
      prisma.wallet.update({
        where: { userId },
        data: {
          balance: { increment: amount }
        }
      })
    ]);
  }

  // Wallet debit (charge)
  static async debitWallet(userId, amount, orderId = null) {
    return prisma.$transaction([
      prisma.transaction.create({
        data: {
          userId,
          orderId,
          amount: -amount,
          type: TransactionType.CHARGE,
          provider: 'WALLET'
        }
      }),
      prisma.wallet.update({
        where: { userId },
        data: {
          balance: { decrement: amount }
        }
      })
    ]);
  }

  // Admin: all transactions
  static async adminFindAll() {
    return prisma.transaction.findMany({
      include: {
        user: true,
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default Transaction;