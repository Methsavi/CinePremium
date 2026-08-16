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

// In-memory fallback database
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
      });
      return doc.toJSON();
    }

    const newUser = {
      id: `user_${Date.now()}`,
      name: userData.name,
      email,
      password: hashedPassword,
      role: userData.role || 'user',
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
};
