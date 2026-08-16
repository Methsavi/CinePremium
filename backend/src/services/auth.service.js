import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';

export const AuthService = {
  async registerUser(data) {
    const { name, email, password, role } = data;

    if (!name || !email || !password) {
      throw new ApiError(400, 'Name, email, and password are required');
    }

    if (password.length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters long');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, 'Please enter a valid email address');
    }

    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists');
    }

    const newUser = await UserModel.create({ name, email, password, role: role || 'user' });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return { user: newUser, token };
  },

  async loginUser(email, password) {
    if (!email || !password) {
      throw new ApiError(400, 'Email and password are required');
    }

    const userWithPassword = await UserModel.findByEmail(email);
    if (!userWithPassword) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const isMatch = await UserModel.comparePassword(password, userWithPassword.password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid email or password');
    }

    const { password: _, ...user } = userWithPassword;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return { user, token };
  },

  async getCurrentUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User account not found');
    }
    return user;
  },
};
