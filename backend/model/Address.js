// src/models/Address.js
import prisma from '../database';

class Address {
  static async create(addressData) {
    return await prisma.address.create({
      data: addressData
    });
  }

  static async findById(id) {
    return await prisma.address.findUnique({
      where: { id, isActive: true }
    });
  }

  static async findByUserId(userId) {
    return await prisma.address.findMany({
      where: { userId, isActive: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async update(id, updateData) {
    return await prisma.address.update({
      where: { id },
      data: updateData
    });
  }

  static async softDelete(id) {
    return await prisma.address.update({
      where: { id },
      data: { isActive: false }
    });
  }

  static async setDefaultAddress(userId, addressId) {
    // First, set all addresses as non-default
    await prisma.address.updateMany({
      where: { userId },
      data: { label: 'Home' }
    });

    // Then set the selected one as default
    return await prisma.address.update({
      where: { id: addressId },
      data: { label: 'Default' }
    });
  }
}

module.exports = Address;