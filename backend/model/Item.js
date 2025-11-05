// src/models/Item.js
import prisma from '../database';

class Item {
  static async create(itemData) {
    return await prisma.item.create({
      data: {
        ...itemData,
        photos: {
          create: itemData.photos || []
        }
      },
      include: { photos: true, owner: { include: { profile: true } } }
    });
  }

  static async findById(id) {
    return await prisma.item.findUnique({
      where: { id, isActive: true },
      include: { 
        photos: true,
        owner: { include: { profile: true } },
        listings: { 
          where: { isActive: true },
          include: { bookings: true }
        }
      }
    });
  }

  static async findByOwner(ownerId) {
    return await prisma.item.findMany({
      where: { ownerId, isActive: true },
      include: { 
        photos: true,
        listings: { where: { isActive: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async update(id, updateData) {
    return await prisma.item.update({
      where: { id },
      data: updateData,
      include: { photos: true }
    });
  }

  static async softDelete(id) {
    return await prisma.item.update({
      where: { id },
      data: { isActive: false }
    });
  }

  static async addPhotos(itemId, photos) {
    return await prisma.item.update({
      where: { id: itemId },
      data: {
        photos: {
          create: photos.map(url => ({ url }))
        }
      },
      include: { photos: true }
    });
  }
}

module.exports = Item;