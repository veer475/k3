// src/models/Profile.js
import prisma from '../database.js';

class Profile {
  // Get profile by user
  static async findByUserId(userId) {
    return prisma.profile.findUnique({
      where: { userId }
    });
  }

  // Create profile
  static async create(profileData) {
    return prisma.profile.create({
      data: profileData
    });
  }

  // Update profile (user-scoped)
  static async update(userId, updateData) {
    return prisma.profile.update({
      where: { userId },
      data: updateData
    });
  }

  // Create or update profile (recommended default usage)
  static async upsert(userId, profileData) {
    return prisma.profile.upsert({
      where: { userId },
      create: {
        userId,
        ...profileData
      },
      update: profileData
    });
  }

  // Admin / internal use
  static async adminFindByUserId(userId) {
    return prisma.profile.findUnique({
      where: { userId },
      include: {
        user: true
      }
    });
  }
}

export default Profile;