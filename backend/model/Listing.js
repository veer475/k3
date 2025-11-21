// src/models/Listing.js
import prisma from '../database.js';

class Listing {
  static async create(listingData) {
    return await prisma.listing.create({
      data: listingData,
      include: {
        item: {
          include: { photos: true }
        },
        owner: {
          include: { profile: true }
        }
      }
    });
  }

  static async findById(id) {
    return await prisma.listing.findUnique({
      where: { id, isActive: true },
      include: {
        item: {
          include: { photos: true }
        },
        owner: {
          include: { profile: true }
        },
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

  static async findAll(filters = {}) {
    const {
      type,
      status = 'ACTIVE',
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
      status: status || 'ACTIVE',
      ...(type && { type }),
      ...(brand && { item: { brand: { contains: brand, mode: 'insensitive' } } }),
      ...(size && { item: { size: { contains: size, mode: 'insensitive' } } }),
      ...(condition && { item: { condition } }),
      ...(search && {
        OR: [
          { item: { title: { contains: search, mode: 'insensitive' } } },
          { item: { description: { contains: search, mode: 'insensitive' } } },
          { item: { brand: { contains: search, mode: 'insensitive' } } }
        ]
      })
    };

    // Price filtering
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.OR = [
        { pricePerDay: { gte: minPrice || 0, lte: maxPrice || 1000000 } },
        { price: { gte: minPrice || 0, lte: maxPrice || 1000000 } }
      ];
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          item: {
            include: { photos: true }
          },
          owner: {
            include: { profile: true }
          }
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

  static async update(id, updateData) {
    return await prisma.listing.update({
      where: { id },
      data: updateData,
      include: {
        item: {
          include: { photos: true }
        }
      }
    });
  }

  static async softDelete(id) {
    return await prisma.listing.update({
      where: { id },
      data: { 
        isActive: false,
        status: 'REMOVED'
      }
    });
  }

  static async findByOwner(ownerId) {
    return await prisma.listing.findMany({
      where: { ownerId, isActive: true },
      include: {
        item: {
          include: { photos: true }
        },
        bookings: {
          where: { isActive: true },
          include: { buyer: { include: { profile: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateStatus(id, status) {
    return await prisma.listing.update({
      where: { id },
      data: { status }
    });
  }
}

export default Listing;