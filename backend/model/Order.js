// src/models/Order.js
import prisma from '../database';

class Order {
  static async create(orderData) {
    return await prisma.order.create({
      data: {
        ...orderData,
        deliveryJob: {
          create: {
            pickupAddressId: orderData.pickupAddressId,
            deliveryAddressId: orderData.deliveryAddressId
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

  static async findById(id) {
    return await prisma.order.findUnique({
      where: { id, isActive: true },
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

  static async updateStatus(id, status, deliveryData = {}) {
    const updateData = { orderStatus: status };
    
    if (status === 'PICKED_UP') {
      updateData.deliveryJob = {
        update: {
          status: 'IN_TRANSIT',
          pickedAt: new Date(),
          ...deliveryData
        }
      };
    } else if (status === 'DELIVERED_FOR_TRYON') {
      updateData.deliveryJob = {
        update: {
          status: 'DELIVERED',
          deliveredAt: new Date(),
          ...deliveryData
        }
      };
    } else if (status === 'COMPLETED') {
      updateData.deliveryJob = {
        update: {
          status: 'COMPLETED'
        }
      };
    }

    return await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        deliveryJob: true,
        listing: true,
        buyer: true
      }
    });
  }

  static async findByBuyer(buyerId) {
    return await prisma.order.findMany({
      where: { buyerId, isActive: true },
      include: {
        listing: {
          include: {
            item: { include: { photos: true } }
          }
        },
        deliveryJob: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findBySeller(ownerId) {
    return await prisma.order.findMany({
      where: { 
        listing: { ownerId },
        isActive: true 
      },
      include: {
        listing: {
          include: {
            item: { include: { photos: true } }
          }
        },
        buyer: { include: { profile: true } },
        deliveryJob: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async findPendingDeliveries() {
    return await prisma.order.findMany({
      where: {
        isActive: true,
        orderStatus: {
          in: ['CREATED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT']
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

  static async assignDeliveryPerson(orderId, deliveryPersonId) {
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        orderStatus: 'PICKUP_ASSIGNED',
        deliveryJob: {
          update: {
            assignedToId: deliveryPersonId,
            status: 'ASSIGNED'
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
}

module.exports = Order;