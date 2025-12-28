// src/models/Order.js
import prisma from '../database.js';
import { OrderStatus, DeliveryStatus } from '@prisma/client';

const ORDER_FLOW = {
  CREATED: ['PICKUP_ASSIGNED', 'CANCELLED'],
  PICKUP_ASSIGNED: ['PICKED_UP', 'CANCELLED'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED_FOR_TRYON'],
  DELIVERED_FOR_TRYON: ['VERIFIED_OK', 'RETURN_SCHEDULED'],
  VERIFIED_OK: ['COMPLETED'],
  RETURN_SCHEDULED: ['RETURNED'],
  RETURNED: ['COMPLETED']
};

class Order {
  // Create order + delivery
  static async create(orderData) {
    return prisma.order.create({
      data: {
        ...orderData,
        deliveryJob: {
          create: {
            pickupAddressId: orderData.pickupAddressId,
            deliveryAddressId: orderData.deliveryAddressId,
            status: DeliveryStatus.PENDING_PICKUP
          }
        }
      },
      include: {
        listing: {
          include: {
            item: { include: { photos: true } },
            owner: { include: { profile: true } }
          }
        },
        buyer: { include: { profile: true } },
        deliveryJob: true,
        transactions: true
      }
    });
  }

  // Get order by ID (active only)
  static async findById(id) {
    return prisma.order.findFirst({
      where: {
        id,
        isActive: true
      },
      include: {
        listing: {
          include: {
            item: { include: { photos: true } },
            owner: { include: { profile: true } }
          }
        },
        buyer: { include: { profile: true } },
        deliveryJob: {
          include: {
            assignedTo: { include: { profile: true } },
            pickupPhotos: true,
            deliveryPhotos: true
          }
        },
        transactions: true,
        dispute: true
      }
    });
  }

  // Buyer orders
  static async findByBuyer(buyerId) {
    return prisma.order.findMany({
      where: {
        buyerId,
        isActive: true
      },
      include: {
        listing: { include: { item: { include: { photos: true } } } },
        deliveryJob: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Seller orders
  static async findBySeller(ownerId) {
    return prisma.order.findMany({
      where: {
        listing: { ownerId },
        isActive: true
      },
      include: {
        listing: { include: { item: { include: { photos: true } } } },
        buyer: { include: { profile: true } },
        deliveryJob: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Update order status (validated)
  static async updateStatus(orderId, newStatus) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { deliveryJob: true }
    });

    if (!order || !order.isActive) {
      throw new Error('Order not found');
    }

    const allowed = ORDER_FLOW[order.orderStatus] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid order transition from ${order.orderStatus} → ${newStatus}`);
    }

    const deliveryUpdates = {};

    if (newStatus === OrderStatus.PICKED_UP) {
      deliveryUpdates.status = DeliveryStatus.PICKED_UP;
      deliveryUpdates.pickedAt = new Date();
    }

    if (newStatus === OrderStatus.DELIVERED_FOR_TRYON) {
      deliveryUpdates.status = DeliveryStatus.DELIVERED;
      deliveryUpdates.deliveredAt = new Date();
    }

    if (newStatus === OrderStatus.COMPLETED) {
      deliveryUpdates.status = DeliveryStatus.COMPLETED;
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: newStatus,
        ...(Object.keys(deliveryUpdates).length && {
          deliveryJob: { update: deliveryUpdates }
        })
      },
      include: {
        deliveryJob: true,
        listing: true,
        buyer: true
      }
    });
  }

  // Assign delivery person (ADMIN only)
  static async assignDeliveryPerson(orderId, deliveryPersonId) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.PICKUP_ASSIGNED,
        deliveryJob: {
          update: {
            assignedToId: deliveryPersonId,
            status: DeliveryStatus.ASSIGNED
          }
        }
      },
      include: {
        deliveryJob: {
          include: {
            assignedTo: { include: { profile: true } }
          }
        }
      }
    });
  }

  // Cancel order (buyer/admin)
  static async cancel(orderId) {
    return prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: OrderStatus.CANCELLED,
        isActive: false
      }
    });
  }

  // Orders needing delivery attention
  static async findPendingDeliveries() {
    return prisma.order.findMany({
      where: {
        isActive: true,
        orderStatus: {
          in: [
            OrderStatus.CREATED,
            OrderStatus.PICKUP_ASSIGNED,
            OrderStatus.PICKED_UP,
            OrderStatus.IN_TRANSIT
          ]
        }
      },
      include: {
        listing: {
          include: {
            item: true,
            owner: { include: { profile: true } }
          }
        },
        buyer: { include: { profile: true } },
        deliveryJob: {
          include: {
            assignedTo: { include: { profile: true } }
          }
        }
      }
    });
  }

  // Admin: all orders
  static async adminFindAll() {
    return prisma.order.findMany({
      include: {
        buyer: true,
        listing: true,
        deliveryJob: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Deactivate all orders by user (compliance)
  static async deactivateByUser(userId) {
    return prisma.order.updateMany({
      where: {
        OR: [
          { buyerId: userId },
          { listing: { ownerId: userId } }
        ]
      },
      data: { isActive: false }
    });
  }
}

export default Order;