// src/models/Delivery.js
import prisma from '../database.js';
import { DeliveryStatus } from '@prisma/client';

const STATUS_FLOW = {
  PENDING_PICKUP: ['ASSIGNED'],
  ASSIGNED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['DELIVERED'],
  DELIVERED: ['COMPLETED']
};

class Delivery {
  // Create delivery for order
  static async create(orderId, pickupAddressId, deliveryAddressId) {
    return prisma.delivery.create({
      data: {
        orderId,
        pickupAddressId,
        deliveryAddressId
      }
    });
  }

  // Find by ID (secure)
  static async findById(id) {
    return prisma.delivery.findUnique({
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

  // Find delivery by order
  static async findByOrderId(orderId) {
    return prisma.delivery.findUnique({
      where: { orderId }
    });
  }

  // Assign delivery person (ADMIN)
  static async assignDelivery(deliveryId, deliveryPersonId) {
    return prisma.delivery.update({
      where: { id: deliveryId },
      data: {
        assignedToId: deliveryPersonId,
        status: DeliveryStatus.ASSIGNED
      }
    });
  }

  // Delivery person jobs
  static async findByDeliveryPerson(deliveryPersonId) {
    return prisma.delivery.findMany({
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

  // Status update with validation
  static async updateStatus(id, newStatus) {
    const delivery = await prisma.delivery.findUnique({ where: { id } });
    if (!delivery) throw new Error('Delivery not found');

    const allowed = STATUS_FLOW[delivery.status] || [];
    if (!allowed.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${delivery.status} to ${newStatus}`);
    }

    return prisma.delivery.update({
      where: { id },
      data: {
        status: newStatus,
        pickedAt: newStatus === DeliveryStatus.PICKED_UP ? new Date() : undefined,
        deliveredAt: newStatus === DeliveryStatus.DELIVERED ? new Date() : undefined
      }
    });
  }

  // Pickup OTP
  static async setPickupOtp(deliveryId, otp) {
    return prisma.delivery.update({
      where: { id: deliveryId },
      data: { pickupOtp: otp }
    });
  }

  static async verifyPickupOtp(deliveryId, otp) {
    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (!delivery || delivery.pickupOtp !== otp) return false;

    await prisma.delivery.update({
      where: { id: deliveryId },
      data: { pickupOtp: null }
    });

    return true;
  }

  // Delivery OTP
  static async setDeliveryOtp(deliveryId, otp) {
    return prisma.delivery.update({
      where: { id: deliveryId },
      data: { deliveryOtp: otp }
    });
  }

  static async verifyDeliveryOtp(deliveryId, otp) {
    const delivery = await prisma.delivery.findUnique({ where: { id: deliveryId } });
    if (!delivery || delivery.deliveryOtp !== otp) return false;

    await prisma.delivery.update({
      where: { id: deliveryId },
      data: { deliveryOtp: null }
    });

    return true;
  }

  // Photos
  static async addPickupPhotos(deliveryId, photoUrls) {
    return prisma.photo.createMany({
      data: photoUrls.map(url => ({
        url,
        deliveryPickupId: deliveryId
      }))
    });
  }

  static async addDeliveryPhotos(deliveryId, photoUrls) {
    return prisma.photo.createMany({
      data: photoUrls.map(url => ({
        url,
        deliveryDropId: deliveryId
      }))
    });
  }

  // Admin: get all deliveries
  static async adminFindAll() {
    return prisma.delivery.findMany({
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default Delivery;