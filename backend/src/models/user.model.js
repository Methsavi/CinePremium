import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define Mongoose User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['user', 'cinema_manager', 'admin'],
      default: 'user',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
      default: null,
    },
    verificationCodeExpiry: {
      type: Date,
      default: null,
    },
    resetPasswordOTP: {
      type: String,
      default: null,
    },
    resetPasswordOTPExpiry: {
      type: Date,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: '',
      trim: true,
    },
    bio: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'users',
  }
);

// Map _id to id in JSON output
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    delete ret.password;
    return ret;
  },
});

export const MongoUser = mongoose.model('User', userSchema);

// Pending User Schema (Holds unverified registrations until 6-digit code is confirmed)
const pendingUserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: 'user' },
    verificationCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now, expires: 86400 }, // 24 hours TTL
  }
);
export const MongoPendingUser = mongoose.model('PendingUser', pendingUserSchema);

// In-memory fallback database
const memoryPendingUsersDb = new Map();
const DEMO_PASSWORD_HASH = bcrypt.hashSync('password123', 10);
const memoryUsersDb = [
  {
    id: 'user_1',
    name: 'Site Admin',
    email: 'admin@example.com',
    password: DEMO_PASSWORD_HASH,
    role: 'admin',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_2',
    name: 'Cinema Manager',
    email: 'manager@example.com',
    password: DEMO_PASSWORD_HASH,
    role: 'cinema_manager',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'user_3',
    name: 'Regular User',
    email: 'user@example.com',
    password: DEMO_PASSWORD_HASH,
    role: 'user',
    createdAt: new Date().toISOString(),
  },
];

// Helper to check DB connection status
const isDbConnected = () => mongoose.connection.readyState === 1;

export const UserModel = {
  async seedDefaultUsers() {
    if (isDbConnected()) {
      try {
        const count = await MongoUser.countDocuments();
        if (count === 0) {
          console.log('[Database] No users found. Seeding default users...');
          const adminPass = await bcrypt.hash('password123', 10);
          const managerPass = await bcrypt.hash('password123', 10);
          const userPass = await bcrypt.hash('password123', 10);
          
          await MongoUser.create([
            {
              name: 'Site Admin',
              email: 'admin@example.com',
              password: adminPass,
              role: 'admin',
            },
            {
              name: 'Cinema Manager',
              email: 'manager@example.com',
              password: managerPass,
              role: 'cinema_manager',
            },
            {
              name: 'Regular User',
              email: 'user@example.com',
              password: userPass,
              role: 'user',
            }
          ]);
          console.log('[Database] Default users seeded successfully!');
        }
      } catch (error) {
        console.error('[Database] Failed to seed default users:', error.message);
      }
    }
  },

  async findAll() {
    if (isDbConnected()) {
      const users = await MongoUser.find().select('-password').sort({ createdAt: -1 });
      return users.map((u) => u.toJSON());
    }
    return memoryUsersDb.map(({ password, ...u }) => u);
  },

  async findById(id) {
    if (isDbConnected()) {
      try {
        const user = await MongoUser.findById(id).select('-password');
        return user ? user.toJSON() : null;
      } catch {
        return null;
      }
    }
    const user = memoryUsersDb.find((u) => u.id === id);
    if (!user) return null;
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async findByEmail(email) {
    if (!email) return null;
    const lowerEmail = email.toLowerCase();

    if (isDbConnected()) {
      const user = await MongoUser.findOne({ email: lowerEmail });
      if (!user) return null;
      return {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        isVerified: user.isVerified || false,
        verificationCode: user.verificationCode || null,
        verificationCodeExpiry: user.verificationCodeExpiry || null,
        resetPasswordOTP: user.resetPasswordOTP || null,
        resetPasswordOTPExpiry: user.resetPasswordOTPExpiry || null,
        createdAt: user.createdAt?.toISOString() || new Date().toISOString(),
      };
    }

    return memoryUsersDb.find((u) => u.email.toLowerCase() === lowerEmail) || null;
  },

  async comparePassword(candidatePassword, hashedPassword) {
    return bcrypt.compare(candidatePassword, hashedPassword);
  },

  async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const email = userData.email.toLowerCase();

    if (isDbConnected()) {
      const doc = await MongoUser.create({
        name: userData.name,
        email,
        password: hashedPassword,
        role: userData.role || 'user',
        isVerified: userData.isVerified !== undefined ? userData.isVerified : false,
        verificationCode: userData.verificationCode || null,
        verificationCodeExpiry: userData.verificationCodeExpiry || null,
      });
      return doc.toJSON();
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email,
      password: hashedPassword,
      role: userData.role || 'user',
      isVerified: userData.isVerified !== undefined ? userData.isVerified : false,
      verificationCode: userData.verificationCode || null,
      verificationCodeExpiry: userData.verificationCodeExpiry || null,
      createdAt: new Date().toISOString(),
    };
    memoryUsersDb.unshift(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async update(id, updateData) {
    if (isDbConnected()) {
      try {
        if (updateData.password) {
          updateData.password = await bcrypt.hash(updateData.password, 10);
        }
        const updated = await MongoUser.findByIdAndUpdate(
          id,
          { $set: updateData },
          { new: true, runValidators: true }
        ).select('-password');
        return updated ? updated.toJSON() : null;
      } catch {
        return null;
      }
    }

    const index = memoryUsersDb.findIndex((u) => u.id === id);
    if (index !== -1) {
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      memoryUsersDb[index] = {
        ...memoryUsersDb[index],
        ...updateData,
      };
      const { password, ...rest } = memoryUsersDb[index];
      return rest;
    }
    return null;
  },

  async delete(id) {
    if (isDbConnected()) {
      try {
        const deleted = await MongoUser.findByIdAndDelete(id);
        return deleted ? deleted.toJSON() : null;
      } catch {
        return null;
      }
    }
    const index = memoryUsersDb.findIndex((u) => u.id === id);
    if (index !== -1) {
      const [deleted] = memoryUsersDb.splice(index, 1);
      const { password, ...rest } = deleted;
      return rest;
    }
    return null;
  },

  async savePendingUser({ name, email, password, role, verificationCode }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const lowerEmail = email.toLowerCase();

    if (isDbConnected()) {
      await MongoPendingUser.deleteMany({ email: lowerEmail });
      const pendingDoc = await MongoPendingUser.create({
        name,
        email: lowerEmail,
        password: hashedPassword,
        role: role || 'user',
        verificationCode,
      });
      return pendingDoc;
    }

    const pendingData = {
      name,
      email: lowerEmail,
      password: hashedPassword,
      role: role || 'user',
      verificationCode,
      createdAt: new Date(),
    };
    memoryPendingUsersDb.set(lowerEmail, pendingData);
    return pendingData;
  },

  async findPendingUser(email) {
    if (!email) return null;
    const lowerEmail = email.toLowerCase();

    if (isDbConnected()) {
      return MongoPendingUser.findOne({ email: lowerEmail });
    }

    return memoryPendingUsersDb.get(lowerEmail) || null;
  },

  async deletePendingUser(email) {
    if (!email) return;
    const lowerEmail = email.toLowerCase();

    if (isDbConnected()) {
      await MongoPendingUser.deleteMany({ email: lowerEmail });
    } else {
      memoryPendingUsersDb.delete(lowerEmail);
    }
  },

  async createVerifiedUser({ name, email, passwordHash, role }) {
    const lowerEmail = email.toLowerCase();

    if (isDbConnected()) {
      const doc = await MongoUser.create({
        name,
        email: lowerEmail,
        password: passwordHash,
        role: role || 'user',
        isVerified: true,
      });
      return doc.toJSON();
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name,
      email: lowerEmail,
      password: passwordHash,
      role: role || 'user',
      isVerified: true,
      createdAt: new Date().toISOString(),
    };
    memoryUsersDb.unshift(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
};
