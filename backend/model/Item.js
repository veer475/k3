// src/models/Item.js
import prisma from '../database.js';

class Item {
  // Create item with photos
  static async create(itemData) {
    return prisma.item.create({
      data: {
        ...itemData,
        photos: {
          create: (itemData.photos || []).map(url => ({ url }))
        }
      },
      include: {
        photos: true,
        owner: { include: { profile: true } }
      }
    });
  }

  // Get item by ID (active only)
  static async findById(id) {
    return prisma.item.findFirst({
      where: {
        id,
        isActive: true
      },
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

  // Get items by owner (secure)
  static async findByOwner(ownerId) {
    return prisma.item.findMany({
      where: {
        ownerId,
        isActive: true
      },
      include: {
        photos: true,
        listings: {
          where: { isActive: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Admin / internal (includes inactive)
  static async adminFindAll() {
    return prisma.item.findMany({
      include: {
        photos: true,
        owner: { include: { profile: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Update item (owner-scoped)
  static async update(id, ownerId, updateData) {
    const result = await prisma.item.updateMany({
      where: {
        id,
        ownerId,
        isActive: true
      },
      data: updateData
    });

    return result.count > 0;
  }

  // Soft delete item + deactivate listings
  static async softDelete(id, ownerId) {
    await prisma.listing.updateMany({
      where: {
        itemId: id,
        isActive: true
      },
      data: { isActive: false }
    });

    const result = await prisma.item.updateMany({
      where: {
        id,
        ownerId,
        isActive: true
      },
      data: { isActive: false }
    });

    return result.count > 0;
  }

  // Add photos to item
  static async addPhotos(itemId, ownerId, photoUrls) {
    const item = await prisma.item.findFirst({
      where: { id: itemId, ownerId, isActive: true }
    });

    if (!item) return false;

    await prisma.photo.createMany({
      data: photoUrls.map(url => ({
        url,
        itemId
      }))
    });

    return true;
  }

  // Remove single photo
  static async removePhoto(photoId, ownerId) {
    const photo = await prisma.photo.findUnique({
      where: { id: photoId },
      include: { item: true }
    });

    if (!photo || photo.item.ownerId !== ownerId) return false;

    await prisma.photo.delete({
      where: { id: photoId }
    });

    return true;
  }

  // Deactivate all items by owner (account deletion)
  static async deactivateByOwner(ownerId) {
    await prisma.listing.updateMany({
      where: { ownerId },
      data: { isActive: false }
    });

    return prisma.item.updateMany({
      where: { ownerId },
      data: { isActive: false }
    });
  }

  // Find item by listing (order / delivery usage)
  static async findByListingId(listingId) {
    return prisma.item.findFirst({
      where: {
        listings: {
          some: { id: listingId }
        }
      },
      include: {
        photos: true,
        owner: { include: { profile: true } }
      }
    });
  }
}

export default Item;