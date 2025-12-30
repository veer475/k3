// src/models/Wallet.js
import pkg from '@prisma/client';
import prisma from '../database.js';
const {TransactionType} = pkg;

class Wallet {
  // Ensure wallet exists (idempotent)
  static async ensureWallet(userId) {
    return prisma.wallet.upsert({
      where: { userId },
      create: { userId, balance: 0 },
      update: {}
    });
  }

  // Get wallet by user
  static async findByUserId(userId) {
    return prisma.wallet.findUnique({
      where: { userId }
    });
  }

  // Get wallet balance (safe)
  static async getBalance(userId) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });
    return wallet?.balance ?? 0;
  }

  // Credit wallet (refund / payout)
  // ALWAYS creates a transaction entry
  static async credit(userId, amount, orderId = null) {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    await this.ensureWallet(userId);

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

  // Debit wallet (purchase / charge)
  // Balance check enforced
  static async debit(userId, amount, orderId = null) {
    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }

    await this.ensureWallet(userId);

    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (wallet.balance < amount) {
      throw new Error('Insufficient wallet balance');
    }

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

  // Admin: get all wallets
  static async adminFindAll() {
    return prisma.wallet.findMany({
      include: {
        user: {
          include: { profile: true }
        }
      },
      orderBy: { balance: 'desc' }
    });
  }
}

export default Wallet;