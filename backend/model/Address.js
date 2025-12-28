// src/models/Address.js
import prisma from '../database.js';

class Address {
  // Create address
  static async create(addressData) {
    return prisma.address.create({
      data: addressData
    });
  }

  // Get address by ID (user-scoped)
  static async findById(id, userId) {
    return prisma.address.findFirst({
      where: {
        id,
        userId,
        isActive: true
      }
    });
  }

  // Get all active addresses of a user
  static async findByUserId(userId) {
    return prisma.address.findMany({
      where: {
        userId,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Admin / internal use – includes inactive
  static async findAllByUserIdAdmin(userId) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Get default address
  static async findDefaultByUser(userId) {
    return prisma.address.findFirst({
      where: {
        userId,
        label: 'Default',
        isActive: true
      }
    });
  }

  // Update address (user-scoped)
  static async update(id, userId, updateData) {
    const result = await prisma.address.updateMany({
      where: {
        id,
        userId,
        isActive: true
      },
      data: updateData
    });

    return result.count > 0;
  }

  // Soft delete address (user-scoped)
  static async softDelete(id, userId) {
    const result = await prisma.address.updateMany({
      where: {
        id,
        userId,
        isActive: true
      },
      data: { isActive: false }
    });

    return result.count > 0;
  }

  // Set default address (user-scoped)
  static async setDefaultAddress(userId, addressId) {
    // Reset previous default
    await prisma.address.updateMany({
      where: {
        userId,
        label: 'Default'
      },
      data: { label: 'Home' }
    });

    // Set new default
    const result = await prisma.address.updateMany({
      where: {
        id: addressId,
        userId,
        isActive: true
      },
      data: { label: 'Default' }
    });

    return result.count > 0;
  }

  // Deactivate all addresses (user deactivation / compliance)
  static async deactivateByUser(userId) {
    return prisma.address.updateMany({
      where: { userId },
      data: { isActive: false }
    });
  }
}

export default Address;