// src/models/Rating.js
import prisma from '../database.js';
import { OrderStatus } from '@prisma/client';

class Rating {
  // Create rating (validated)
  static async create(ratingData) {
    const { giverId, receiverId, orderId } = ratingData;

    if (giverId === receiverId) {
      throw new Error('Users cannot rate themselves');
    }

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId }
      });

      if (!order || order.orderStatus !== OrderStatus.COMPLETED) {
        throw new Error('Rating allowed only after order completion');
      }

      const existing = await prisma.rating.findFirst({
        where: { giverId, orderId }
      });

      if (existing) {
        throw new Error('You have already rated this order');
      }
    }

    return prisma.rating.create({
      data: ratingData,
      include: {
        giver: { include: { profile: true } },
        receiver: { include: { profile: true } },
        order: true
      }
    });
  }

  // Ratings received by user
  static async findByReceiverId(receiverId) {
    return prisma.rating.findMany({
      where: { receiverId },
      include: {
        giver: { include: { profile: true } },
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Ratings given by user
  static async findByGiverId(giverId) {
    return prisma.rating.findMany({
      where: { giverId },
      include: {
        receiver: { include: { profile: true } },
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Ratings for an order
  static async findByOrderId(orderId) {
    return prisma.rating.findMany({
      where: { orderId },
      include: {
        giver: { include: { profile: true } },
        receiver: { include: { profile: true } }
      }
    });
  }

  // Check if user already rated order
  static async hasUserRatedOrder(orderId, giverId) {
    const rating = await prisma.rating.findFirst({
      where: { orderId, giverId }
    });
    return !!rating;
  }

  // Average rating for user
  static async getUserAverageRating(userId) {
    const result = await prisma.rating.aggregate({
      where: { receiverId: userId },
      _avg: { score: true },
      _count: { score: true }
    });

    return {
      average: Number(result._avg.score?.toFixed(2)) || 0,
      totalRatings: result._count.score || 0
    };
  }

  // Admin: all ratings
  static async adminFindAll() {
    return prisma.rating.findMany({
      include: {
        giver: true,
        receiver: true,
        order: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Admin: delete rating (moderation)
  static async deleteById(id) {
    return prisma.rating.delete({
      where: { id }
    });
  }
}

export default Rating;