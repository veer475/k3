// src/models/Listing.js
import pkg from '@prisma/client';
import prisma from '../database.js';
const {ListingStatus} = pkg;

class Listing {
  // Create listing
  static async create(listingData) {
    return prisma.listing.create({
      data: listingData,
      include: {
        item: { include: { photos: true } },
        owner: { include: { profile: true } }
      }
    });
  }

  // Get listing by ID (active only)
  static async findById(id) {
    return prisma.listing.findFirst({
      where: {
        id,
        isActive: true
      },
      include: {
        item: { include: { photos: true } },
        owner: { include: { profile: true } },
        bookings: {
          where: { isActive: true },
          include: {
            buyer: { include: { profile: true } },
            deliveryJob: true
          }
        }
      }
    });
  }

  // Get listings by owner (secure)
  static async findByOwner(ownerId) {
    return prisma.listing.findMany({
      where: {
        ownerId,
        isActive: true
      },
      include: {
        item: { include: { photos: true } },
        bookings: {
          where: { isActive: true },
          include: { buyer: { include: { profile: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Public listing search
  static async findAll(filters = {}) {
    const {
      type,
      status = ListingStatus.ACTIVE,
      minPrice,
      maxPrice,
      brand,
      size,
      condition,
      search,
      page = 1,
      limit = 10
    } = filters;

    const where = {
      isActive: true,
      status,
      ...(type && { type }),
      ...(condition && { item: { condition } }),
      ...(brand && { item: { brand: { contains: brand, mode: 'insensitive' } } }),
      ...(size && { item: { size: { contains: size, mode: 'insensitive' } } }),
      ...(search && {
        OR: [
          { item: { title: { contains: search, mode: 'insensitive' } } },
          { item: { description: { contains: search, mode: 'insensitive' } } },
          { item: { brand: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.OR = [
        { pricePerDay: { gte: minPrice || 0, lte: maxPrice || 1_000_000 } },
        { price: { gte: minPrice || 0, lte: maxPrice || 1_000_000 } }
      ];
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          item: { include: { photos: true } },
          owner: { include: { profile: true } }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.listing.count({ where })
    ]);

    return {
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Update listing (owner-scoped)
  static async update(id, ownerId, updateData) {
    const result = await prisma.listing.updateMany({
      where: {
        id,
        ownerId,
        isActive: true,
        status: { not: ListingStatus.SOLD }
      },
      data: updateData
    });

    return result.count > 0;
  }

  // Pause listing
  static async pause(id, ownerId) {
    return prisma.listing.updateMany({
      where: {
        id,
        ownerId,
        status: ListingStatus.ACTIVE
      },
      data: { status: ListingStatus.PAUSED }
    });
  }

  // Resume listing
  static async resume(id, ownerId) {
    return prisma.listing.updateMany({
      where: {
        id,
        ownerId,
        status: ListingStatus.PAUSED
      },
      data: { status: ListingStatus.ACTIVE }
    });
  }

  // Mark listing as sold
  static async markAsSold(id, ownerId) {
    return prisma.listing.updateMany({
      where: {
        id,
        ownerId,
        status: { in: [ListingStatus.ACTIVE, ListingStatus.PAUSED] }
      },
      data: { status: ListingStatus.SOLD }
    });
  }

  // Soft delete listing
  static async softDelete(id, ownerId) {
    await prisma.order.updateMany({
      where: {
        listingId: id,
        isActive: true
      },
      data: { isActive: false }
    });

    const result = await prisma.listing.updateMany({
      where: {
        id,
        ownerId,
        isActive: true
      },
      data: {
        isActive: false,
        status: ListingStatus.REMOVED
      }
    });

    return result.count > 0;
  }

  // Find listings by item
  static async findByItemId(itemId) {
    return prisma.listing.findMany({
      where: {
        itemId,
        isActive: true
      },
      include: {
        owner: { include: { profile: true } }
      }
    });
  }

  // Admin: all listings
  static async adminFindAll() {
    return prisma.listing.findMany({
      include: {
        item: true,
        owner: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default Listing;