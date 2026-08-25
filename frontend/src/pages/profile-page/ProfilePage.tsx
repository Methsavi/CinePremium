import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/context/AuthContext';
import { useNotification } from '@/context/NotificationContext';
import { authApi } from '@/services/authApi';
import {
  User as UserIcon,
  Mail,
  Shield,
  KeyRound,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronLeft,
  Ticket,
  Camera,
  Phone,
  FileText,
  Save,
  UploadCloud,
} from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, logout, updateUserState } = useAuth();
  const { addNotification } = useNotification();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Profile Section Tab
  const [activeSection, setActiveSection] = useState<'details' | 'security'>('details');

  // Edit Profile States
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(user?.avatarUrl || null);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Change Password States
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Delete Account States
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Redirect if unauthenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-[#08080a] text-white flex flex-col justify-between font-sans">
        <Navbar onBookNowClick={() => navigate('/movies')} onSearchClick={() => navigate('/movies')} />
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="text-center space-y-4 max-w-md bg-[#0d0d12] border border-white/10 p-8 rounded-3xl">
            <UserIcon className="w-12 h-12 text-zinc-500 mx-auto" />
            <h2 className="text-2xl font-bold font-display">Sign In Required</h2>
            <p className="text-sm text-zinc-400">
              Please log in to your CinePremium account to view and manage your profile.
            </p>
            <Link
              to="/login"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all"
            >
              Sign In to Your Account
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle Avatar Image Selection
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  // Handle Save Profile Info
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!name.trim()) {
      setProfileError('Please enter your full name.');
      return;
    }

    try {
      setIsUpdatingProfile(true);
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      formData.append('bio', bio.trim());
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      }

      const activeToken = token || localStorage.getItem('savi_auth_token') || '';
      const res = await authApi.updateProfile(formData, activeToken);

      if (res.data?.user) {
        updateUserState(res.data.user);
        if (res.data.user.avatarUrl) {
          setAvatarPreview(res.data.user.avatarUrl);
        }
      }

      setProfileSuccess('Profile details and avatar updated successfully!');
      addNotification({
        type: 'success',
        message: 'Profile Updated Successfully',
      });
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Handle Change Password
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!oldPassword.trim() || !newPassword.trim()) {
      setPasswordError('Please fill in both current and new passwords.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await authApi.changePassword(
        { oldPassword, newPassword },
        token || ''
      );

      setPasswordSuccess('Your password has been changed successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      addNotification({
        type: 'success',
        message: 'Password Changed Successfully',
      });
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle Delete Account
  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await authApi.deleteAccount(token || '');

      addNotification({
        type: 'delete',
        message: 'Account Deleted Successfully',
      });

      logout();
      navigate('/');
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete account');
      setIsDeleting(false);
    }
  };

  // Role Formatter
  const isAdminOrManager = user.role === 'admin' || user.role === 'cinema_manager';
  const roleDisplay = user.role === 'admin' ? 'Administrator' : user.role === 'cinema_manager' ? 'Cinema Manager' : '';
  const roleBadgeColor = user.role === 'admin' ? 'bg-red-600/20 text-red-400 border-red-500/30' : 'bg-amber-600/20 text-amber-400 border-amber-500/30';

  // Initials for avatar fallback
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-[#08080a] text-white flex flex-col justify-between font-sans antialiased selection:bg-red-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar onBookNowClick={() => navigate('/movies')} onSearchClick={() => navigate('/movies')} />

      {/* Main Content */}
      <main className="flex-1 pt-24 pb-16 px-4 sm:px-6 md:px-8 max-w-[800px] mx-auto w-full space-y-6">
        
        {/* Top Back Link & Bookings Button */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <Link
            to="/my-bookings"
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-white flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Ticket className="w-4 h-4 text-red-500" />
            <span>My Bookings</span>
          </Link>
        </div>

        {/* ── 1. Profile Banner & Avatar Card ── */}
        <div className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative z-10">
            
            {/* Interactive Avatar Container with Photo Upload */}
            <div className="relative group shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
              
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user.name}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover border-2 border-red-500/40 shadow-xl shadow-red-600/20"
                />
              ) : (
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-3xl sm:text-4xl flex items-center justify-center shadow-xl shadow-red-600/30 border-2 border-white/20">
                  {initials}
                </div>
              )}

              {/* Upload Overlay Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Profile Picture"
                className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer border border-white/30 backdrop-blur-xs"
              >
                <Camera className="w-6 h-6 text-red-400" />
                <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">Change</span>
              </button>

              {/* Small Camera Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-red-600 hover:bg-red-500 text-white shadow-lg border border-white/20 transition-transform hover:scale-110 cursor-pointer"
                title="Upload Photo"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Profile Overview Details */}
            <div className="flex-1 text-center sm:text-left space-y-2.5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
                  {user.name}
                </h1>
                {isAdminOrManager && (
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold w-fit mx-auto sm:mx-0 ${roleBadgeColor}`}>
                    <Shield className="w-3.5 h-3.5" />
                    <span>{roleDisplay}</span>
                  </span>
                )}
              </div>

              {user.bio && (
                <p className="text-xs text-zinc-300 leading-relaxed max-w-md">
                  {user.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-red-500" />
                  <span>{user.email}</span>
                </span>

                {user.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>{user.phone}</span>
                  </span>
                )}

                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Account Verified</span>
                </span>

                {user.createdAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>Joined {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. Tab Navigation Switcher ── */}
        <div className="flex items-center gap-2 bg-[#0d0d12] p-1.5 rounded-2xl border border-white/10">
          <button
            onClick={() => setActiveSection('details')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSection === 'details'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Edit Profile Info</span>
          </button>

          <button
            onClick={() => setActiveSection('security')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeSection === 'security'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Change Password</span>
          </button>
        </div>

        {/* ── 3. Section A: Edit Profile Information ── */}
        {activeSection === 'details' && (
          <div className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500">
                <UserIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Personal Information</h3>
                <p className="text-xs text-zinc-400">Update your name, contact phone, bio, and profile picture</p>
              </div>
            </div>

            {profileError && (
              <div className="flex items-start gap-2.5 bg-red-950/50 border border-red-500/40 text-red-300 px-4 py-3 rounded-2xl text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="flex items-start gap-2.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Full Name"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Email Address (Read-only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Email Address <span className="text-[10px] text-zinc-500 font-normal lowercase">(cannot be changed)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950/50 border border-white/5 rounded-xl text-zinc-400 text-sm cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Phone Number <span className="text-[10px] text-zinc-500 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+94 77 123 4567"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Bio / Status */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Bio / Movie Preferences <span className="text-[10px] text-zinc-500 font-normal lowercase">(optional)</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-3.5 pointer-events-none text-zinc-500">
                    <FileText className="w-4 h-4" />
                  </div>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your favorite movie genres (e.g. Sci-Fi enthusiast, IMAX addict)..."
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 text-sm transition-colors resize-none"
                  />
                </div>
              </div>

              {/* Photo Upload Info */}
              <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-white">Profile Photo</div>
                  <div className="text-[11px] text-zinc-400">
                    {avatarFile ? avatarFile.name : (user.avatarUrl ? 'Photo uploaded' : 'No custom photo uploaded')}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
                >
                  <UploadCloud className="w-3.5 h-3.5 text-red-500" />
                  <span>Choose Photo</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={isUpdatingProfile}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isUpdatingProfile ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving Profile Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── 4. Section B: Change Password ── */}
        {activeSection === 'security' && (
          <div className="bg-[#0d0d12] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 animate-in fade-in duration-200">
            <div className="flex items-center gap-3 border-b border-white/10 pb-4">
              <div className="p-2.5 rounded-xl bg-red-600/15 border border-red-500/30 text-red-500">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Change Password</h3>
                <p className="text-xs text-zinc-400">Update your login security credentials</p>
              </div>
            </div>

            {passwordError && (
              <div className="flex items-start gap-2.5 bg-red-950/50 border border-red-500/40 text-red-300 px-4 py-3 rounded-2xl text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="flex items-start gap-2.5 bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 px-4 py-3 rounded-2xl text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              {/* Old Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Current Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-10 py-3 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-3 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 text-sm transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-white cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-white/15 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-red-500 text-sm transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isChangingPassword || !oldPassword || !newPassword}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {isChangingPassword ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Change Password</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── 5. Single Delete Account Button ── */}
        <div className="pt-2">
          {deleteError && (
            <div className="mb-3 text-xs text-red-400 bg-red-950/60 p-3 rounded-xl border border-red-500/40">
              {deleteError}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="w-full bg-red-950/30 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 text-xs font-bold py-3.5 rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-[#0d0d12] border border-red-500/40 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-red-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-white">Delete CinePremium Account?</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Are you sure you want to permanently delete your account? This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs py-3 rounded-xl border border-white/10 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteAccount}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Confirm Delete</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default ProfilePage;
