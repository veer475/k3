// src/models/Rating.js
import prisma from '../database';

class Rating {
  static async create(ratingData) {
    return await prisma.rating.create({
      data: ratingData,
      include: {
        giver: { include: { profile: true } },
        receiver: { include: { profile: true } },
        order: true
      }
    });
  }

  static async findByReceiverId(receiverId) {
    return await prisma.rating.findMany({
      where: { receiverId },
      include: {
        giver: { include: { profile: true } },
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findByOrderId(orderId) {
    return await prisma.rating.findMany({
      where: { orderId },
      include: {
        giver: { include: { profile: true } },
        receiver: { include: { profile: true } }
      }
    });
  }

  static async getUserAverageRating(userId) {
    const result = await prisma.rating.aggregate({
      where: { receiverId: userId },
      _avg: { score: true },
      _count: { score: true }
    });

    return {
      average: result._avg.score || 0,
      totalRatings: result._count.score || 0
    };
  }
}

module.exports = Rating;