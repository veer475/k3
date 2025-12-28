// src/models/User.js
import prisma from "../database.js";
import bcrypt from "bcryptjs";

class User {
  // Create user with profile + wallet
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role || "USER",
        phone: userData.phone,
        profile: {
          create: {
            fullName: userData.fullName,
            avatarUrl: userData.avatarUrl || null,
            bio: userData.bio || null,
          },
        },
        wallet: {
          create: {}
        }
      },
      include: {
        profile: true,
        wallet: true,
      },
    });
  }

  // Find active user by email
  static async findByEmail(email) {
    return prisma.user.findFirst({
      where: {
        email,
        isActive: true,
      },
      include: { profile: true },
    });
  }

  // Find active user by ID
  static async findById(id) {
    return prisma.user.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        profile: true,
        addresses: { where: { isActive: true } },
        wallet: true,
      },
    });
  }

  // Update user (safe)
  static async update(id, updateData) {
    const data = { ...updateData };

    if (updateData.password) {
      data.passwordHash = await bcrypt.hash(updateData.password, 12);
      delete data.password;
    }

    return prisma.user.update({
      where: { id },
      data,
      include: { profile: true },
    });
  }

  // Soft delete user + cascade deactivation
  static async softDelete(id) {
    await prisma.$transaction([
      prisma.listing.updateMany({
        where: { ownerId: id },
        data: { isActive: false }
      }),
      prisma.order.updateMany({
        where: {
          OR: [
            { buyerId: id },
            { listing: { ownerId: id } }
          ]
        },
        data: { isActive: false }
      }),
      prisma.user.update({
        where: { id },
        data: {
          isActive: false,
          email: `deleted_${Date.now()}_${id}`
        }
      })
    ]);

    return true;
  }

  // Password comparison
  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Admin: paginated users
  static async getAllUsers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { isActive: true },
        include: { profile: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where: { isActive: true } }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Create or update profile (CORRECTED)
  static async createOrUpdateProfile(userId, profileData) {
    return prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        fullName: profileData.fullName,
        avatarUrl: profileData.avatarUrl || null,
        bio: profileData.bio || null,
      },
      update: {
        fullName: profileData.fullName,
        avatarUrl: profileData.avatarUrl,
        bio: profileData.bio,
      },
    });
  }

  // Get profile with user info
  static async getProfile(userId) {
    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            phone: true,
            role: true,
            isActive: true,
            createdAt: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    return profile;
  }
}

export default User;