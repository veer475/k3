// src/models/Delivery.js
import prisma from '../database.js';

class Delivery {
  static async findById(id) {
    return await prisma.delivery.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            listing: {
              include: {
                item: { include: { photos: true } }
              }
            },
            buyer: { include: { profile: true } }
          }
        },
        assignedTo: { include: { profile: true } },
        pickupPhotos: true,
        deliveryPhotos: true
      }
    });
  }

  static async findByDeliveryPerson(deliveryPersonId) {
    return await prisma.delivery.findMany({
      where: { assignedToId: deliveryPersonId },
      include: {
        order: {
          include: {
            listing: {
              include: {
                item: { include: { photos: true } }
              }
            },
            buyer: { include: { profile: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateStatus(id, status, updateData = {}) {
    return await prisma.delivery.update({
      where: { id },
      data: {
        status,
        ...updateData
      },
      include: {
        order: true
      }
    });
  }

  static async addPickupPhotos(deliveryId, photoUrls) {
    return await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        pickupPhotos: {
          create: photoUrls.map(url => ({ url }))
        }
      },
      include: {
        pickupPhotos: true
      }
    });
  }

  static async addDeliveryPhotos(deliveryId, photoUrls) {
    return await prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        deliveryPhotos: {
          create: photoUrls.map(url => ({ url }))
        }
      },
      include: {
        deliveryPhotos: true
      }
    });
  }

  static async setPickupOtp(deliveryId, otp) {
    return await prisma.delivery.update({
      where: { id: deliveryId },
      data: { pickupOtp: otp }
    });
  }

  static async setDeliveryOtp(deliveryId, otp) {
    return await prisma.delivery.update({
      where: { id: deliveryId },
      data: { deliveryOtp: otp }
    });
  }
}

export default Delivery;