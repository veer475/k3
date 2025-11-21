// src/models/Profile.jsire('../config/database');
import prisma from '../database.js';

class Profile {
  static async findByUserId(userId) {
    return await prisma.profile.findUnique({
      where: { userId }
    });
  }

  static async update(userId, updateData) {
    return await prisma.profile.update({
      where: { userId },
      data: updateData
    });
  }

  static async create(profileData) {
    return await prisma.profile.create({
      data: profileData
    });
  }
}

export default Profile;