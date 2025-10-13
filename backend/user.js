import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

class User {
  constructor({
    id,
    email,
    passwordHash,
    role,
    phone,
    createdAt,
    profile,
    addresses,
    wallet,
    listings,
    itemsOwned,
    orders,
    transactions,
    ratingsGiven,
    ratingsReceived,
    deliveries,
  }) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role;
    this.phone = phone;
    this.createdAt = createdAt;

    // Optional relational fields
    this.profile = profile || null;
    this.addresses = addresses || [];
    this.wallet = wallet || null;
    this.listings = listings || [];
    this.itemsOwned = itemsOwned || [];
    this.orders = orders || [];
    this.transactions = transactions || [];
    this.ratingsGiven = ratingsGiven || [];
    this.ratingsReceived = ratingsReceived || [];
    this.deliveries = deliveries || [];
  }

  // ✅ Create new user with hashed password
  static async create(data) {
    const { email, password, role, phone } = data;
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role,
        phone,
        // create related wallet automatically if needed
        wallet: { create: { balance: 0 } },
      },
      include: {
        wallet: true,
      },
    });

    return new User(result);
  }

  // ✅ Find user by ID (include relations)
  static async findById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        addresses: true,
        wallet: true,
        listings: true,
        itemsOwned: true,
        orders: true,
        transactions: true,
        ratingsGiven: true,
        ratingsReceived: true,
        deliveries: true,
      },
    });
    return user ? new User(user) : null;
  }

  // ✅ Get all users (basic info only)
  static async findAll() {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
        wallet: true,
      },
    });
    return users.map((u) => new User(u));
  }

  // ✅ Update user
  static async update(id, data) {
    const updateData = { ...data };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 10);
      delete updateData.password;
    }

    const result = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        profile: true,
        addresses: true,
        wallet: true,
        listings: true,
        itemsOwned: true,
        orders: true,
        transactions: true,
        ratingsGiven: true,
        ratingsReceived: true,
        deliveries: true,
      },
    });

    return new User(result);
  }

  // ✅ Delete user
  static async delete(id) {
    await prisma.user.delete({ where: { id } });
    return true;
  }

  // ✅ Validate login
  static async validate(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) return null;

    return new User(user);
  }
}

export default User;
