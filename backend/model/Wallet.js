// src/models/Wallet.js
import prisma from '../database';

class Wallet {
  static async findByUserId(userId) {
    return await prisma.wallet.findUnique({
      where: { userId }
    });
  }

  static async create(userId) {
    return await prisma.wallet.create({
      data: { userId }
    });
  }

  static async updateBalance(userId, amount) {
    return await prisma.wallet.update({
      where: { userId },
      data: {
        balance: { increment: amount }
      }
    });
  }

  static async getBalance(userId) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });
    return wallet ? wallet.balance : 0;
  }
}

module.exports = Wallet;