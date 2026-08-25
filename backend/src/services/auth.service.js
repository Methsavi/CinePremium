import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { ApiError } from '../utils/apiError.js';
import { config } from '../config/env.js';
import { MailService } from './mail.service.js';
import { uploadFileToR2 } from './r2Storage.service.js';

// Helper to generate secure random 6-digit numeric code
const generate6DigitCode = () => Math.floor(100000 + Math.random() * 900000).toString();

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

    // 1. Check if an active account already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser && existingUser.isVerified) {
      throw new ApiError(409, 'An active account with this email already exists');
    }

    // 2. Generate 6-digit verification code
    const verificationCode = generate6DigitCode();

    // 3. Save to Pending Registration (User is NOT created in database yet)
    await UserModel.savePendingUser({
      name,
      email,
      password,
      role: role || 'user',
      verificationCode,
    });

    console.log(`[Email Service] Dispatched verification code to ${email}: ${verificationCode}`);

    // 4. Send actual verification email via Gmail SMTP
    await MailService.sendVerificationEmail(email, name, verificationCode);

    return {
      email,
      message: `A 6-digit verification code has been sent to ${email}. Please verify to complete your account registration.`,
    };
  },

  async verifyEmail(email, code) {
    if (!email || !code) {
      throw new ApiError(400, 'Email and 6-digit verification code are required');
    }

    const lowerEmail = email.toLowerCase().trim();
    const cleanCode = code.toString().trim();

    // 1. Look for pending registration
    const pendingUser = await UserModel.findPendingUser(lowerEmail);

    if (pendingUser) {
      if (pendingUser.verificationCode !== cleanCode) {
        throw new ApiError(400, 'Invalid verification code. Please check your email and try again.');
      }

      // Create the real verified user in database NOW
      const newUser = await UserModel.createVerifiedUser({
        name: pendingUser.name,
        email: pendingUser.email,
        passwordHash: pendingUser.password,
        role: pendingUser.role || 'user',
      });

      // Remove from pending
      await UserModel.deletePendingUser(lowerEmail);

      const token = jwt.sign(
        { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role, isVerified: true },
        config.jwtSecret,
        { expiresIn: '7d' }
      );

      console.log(`[Auth] Account successfully created and verified for: ${lowerEmail}`);

      return {
        user: newUser,
        token,
        message: 'Account successfully verified and created!',
      };
    }

    // 2. Check if already verified existing user
    const existingUser = await UserModel.findByEmail(lowerEmail);
    if (existingUser && existingUser.isVerified) {
      const token = jwt.sign(
        { id: existingUser.id, name: existingUser.name, email: existingUser.email, role: existingUser.role, isVerified: true },
        config.jwtSecret,
        { expiresIn: '7d' }
      );
      return {
        user: existingUser,
        token,
        message: 'Email is already verified',
      };
    }

    throw new ApiError(400, 'No pending registration found for this email or code has expired. Please register again.');
  },

  async resendVerificationCode(email) {
    if (!email) {
      throw new ApiError(400, 'Email address is required');
    }

    const lowerEmail = email.toLowerCase().trim();
    const pendingUser = await UserModel.findPendingUser(lowerEmail);

    if (!pendingUser) {
      const existingUser = await UserModel.findByEmail(lowerEmail);
      if (existingUser && existingUser.isVerified) {
        return { message: 'Email is already verified' };
      }
      throw new ApiError(404, 'No pending registration found. Please register first.');
    }

    const verificationCode = generate6DigitCode();
    await UserModel.savePendingUser({
      name: pendingUser.name,
      email: pendingUser.email,
      password: pendingUser.password, // already hashed
      role: pendingUser.role,
      verificationCode,
    });

    // Send actual email
    await MailService.sendVerificationEmail(lowerEmail, pendingUser.name, verificationCode);

    return {
      message: `A new 6-digit verification code has been sent to ${lowerEmail}.`,
    };
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
      { id: user.id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified || false },
      config.jwtSecret,
      { expiresIn: '7d' }
    );

    return { user, token };
  },

  async sendPasswordResetOTP(email) {
    if (!email) {
      throw new ApiError(400, 'Email is required');
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'No account found with this email address');
    }

    const resetPasswordOTP = generate6DigitCode();
    const resetPasswordOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await UserModel.update(user.id, {
      resetPasswordOTP,
      resetPasswordOTPExpiry,
    });

    // Send actual OTP email
    await MailService.sendPasswordResetEmail(email, user.name, resetPasswordOTP);

    return {
      message: `A 6-digit password reset OTP has been sent to ${email}. Check your inbox.`,
    };
  },

  async verifyResetOTP(email, otp) {
    if (!email || !otp) {
      throw new ApiError(400, 'Email and OTP code are required');
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'No account found with this email');
    }

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp.trim()) {
      throw new ApiError(400, 'Invalid OTP code. Please check and try again.');
    }

    if (user.resetPasswordOTPExpiry && new Date() > new Date(user.resetPasswordOTPExpiry)) {
      throw new ApiError(400, 'OTP code has expired. Please request a new OTP.');
    }

    return { valid: true, message: 'OTP is valid' };
  },

  async resetPasswordWithOTP(email, otp, newPassword) {
    if (!email || !otp || !newPassword) {
      throw new ApiError(400, 'Email, OTP, and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters long');
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'No account found with this email');
    }

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp.trim()) {
      throw new ApiError(400, 'Invalid OTP code. Please try again.');
    }

    if (user.resetPasswordOTPExpiry && new Date() > new Date(user.resetPasswordOTPExpiry)) {
      throw new ApiError(400, 'OTP has expired. Please request a new OTP code.');
    }

    const updated = await UserModel.update(user.id, {
      password: newPassword,
      resetPasswordOTP: null,
      resetPasswordOTPExpiry: null,
    });

    console.log(`[Security] Password successfully reset for user ${email}`);

    return {
      message: 'Password reset successfully! You can now log in with your new password.',
      user: updated,
    };
  },

  async changePassword(userId, oldPassword, newPassword) {
    if (!userId || !oldPassword || !newPassword) {
      throw new ApiError(400, 'Current password and new password are required');
    }

    if (newPassword.length < 6) {
      throw new ApiError(400, 'New password must be at least 6 characters long');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    // Need raw user with password hash
    const rawUser = await UserModel.findByEmail(user.email);
    const isMatch = await UserModel.comparePassword(oldPassword, rawUser.password);
    if (!isMatch) {
      throw new ApiError(400, 'Current password is incorrect');
    }

    const updated = await UserModel.update(userId, {
      password: newPassword,
    });

    return {
      message: 'Password changed successfully',
      user: updated,
    };
  },

  async updateProfile(userId, data, file) {
    if (!userId) {
      throw new ApiError(401, 'Unauthorized');
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    let avatarUrl = data.avatarUrl !== undefined ? data.avatarUrl : undefined;

    if (file) {
      try {
        avatarUrl = await uploadFileToR2(file.buffer, file.mimetype, file.originalname, 'avatars');
      } catch (err) {
        console.warn('[Profile Upload] R2 upload fallback to base64 buffer:', err.message);
        avatarUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      }
    }

    const updateFields = {};
    if (data.name && data.name.trim()) updateFields.name = data.name.trim();
    if (data.phone !== undefined) updateFields.phone = data.phone.trim();
    if (data.bio !== undefined) updateFields.bio = data.bio.trim();
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;

    const updated = await UserModel.update(userId, updateFields);

    return {
      message: 'Profile updated successfully',
      user: updated,
    };
  },

  async deleteAccount(userId) {
    const deleted = await UserModel.delete(userId);
    if (!deleted) {
      throw new ApiError(404, 'User account not found');
    }
    return { message: 'Account deleted successfully' };
  },

  async getCurrentUser(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User account not found');
    }
    return user;
  },
};
