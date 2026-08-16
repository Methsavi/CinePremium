import { UserModel } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';

export const UserService = {
  async getAllUsers() {
    return await UserModel.findAll();
  },

  async getUserById(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(404, `User with ID ${id} not found`);
    }
    return user;
  },

  async createUser(userData) {
    const { email } = userData;
    const existingUser = await UserModel.findByEmail(email);

    if (existingUser) {
      throw new ApiError(409, 'User with this email already exists');
    }

    return await UserModel.create(userData);
  },
  async updateUser(id, updateData) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(404, `User with ID ${id} not found`);
    }
    if (updateData.email) {
      const existingUser = await UserModel.findByEmail(updateData.email);
      if (existingUser && existingUser.id !== id) {
        throw new ApiError(409, 'User with this email already exists');
      }
    }
    return await UserModel.update(id, updateData);
  },
  async deleteUser(id) {
    const user = await UserModel.findById(id);
    if (!user) {
      throw new ApiError(404, `User with ID ${id} not found`);
    }
    return await UserModel.delete(id);
  },
};
