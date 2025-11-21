// src/models/User.js
import prisma from "../database.js";
import bcrypt from "bcryptjs";

class User {
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);

    return await prisma.user.create({
      data: {
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role || "USER",
        phone: userData.phone,
        profile: {
          create: {
            fullName: userData.fullName,
            avatarUrl: userData.avatarUrl,
            bio: userData.bio,
          },
        },
      },
      include: {
        profile: true,
        addresses: true,
        wallet: true,
      },
    });
  }

  static async findByEmail(email) {
    return await prisma.user.findUnique({
      where: { email, isActive: true },
      include: { profile: true },
    });
  }

  static async findById(id) {
    return await prisma.user.findUnique({
      where: { id, isActive: true },
      include: {
        profile: true,
        addresses: { where: { isActive: true } },
        wallet: true,
      },
    });
  }

  static async update(id, updateData) {
    return await prisma.user.update({
      where: { id },
      data: updateData,
      include: { profile: true },
    });
  }

  static async softDelete(id) {
    return await prisma.user.update({
      where: { id },
      data: {
        isActive: false,
        email: `deleted_${Date.now()}_${id}`,
      },
    });
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

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

  static async createOrUpdateProfile(userId, profileData) {
    try {
      const existingProfile = await prisma.profile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        const updatedProfile = await prisma.profile.update({
          where: { userId },
          data: {
            fullName: data.fullName ?? existingProfile.fullName,
            avatarUrl: data.avatarUrl ?? existingProfile.avatarUrl,
            bio: data.bio ?? existingProfile.bio,
            updatedAt: new Date(),
          },
        });
        return updatedProfile;
      } else {
        const newProfile = await prisma.profile.create({
          data: {
            userId,
            fullName: data.fullName,
            avatarUrl: data.avatarUrl || null,
            bio: data.bio || null,
          },
        });
        return newProfile;
      }
    } catch (error) {
      console.error("Error creating or updating profile:", error);
      throw new Error("Unable to create or update profile");
    }
  }

  static async getProfile(userId) {
    try {
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
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw new Error("Unable to fetch profile");
    }
  }
}

export default User;