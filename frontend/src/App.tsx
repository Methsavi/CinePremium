import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/home-page/HomePage";
import SingleMovieListingPage from "./pages/single-movie-listingpage/SingleMovieListingPage";
import LoginPage from "./pages/login-page/LoginPage";
import RegisterPage from "./pages/register-page/RegisterPage";
import { VerifyEmailPage } from "./pages/verify-email-page/VerifyEmailPage";
import { ForgotPasswordPage } from "./pages/forgot-password-page/ForgotPasswordPage";
import { ProfilePage } from "./pages/profile-page/ProfilePage";
import { AdminLoginPage } from "./pages/admin-login-page/AdminLoginPage";
import AdminPage from "@/pages/admin-page/AdminPage.tsx";
import SuperAdminPage from "./pages/super-admin-page/SuperAdminPage.tsx";
import { CinemasPage } from "./pages/cinemas-page/CinemasPage.tsx";
import { AboutPage } from "./pages/about-page/AboutPage.tsx";
import { MoviesPage } from "./pages/movies-page/MoviesPage.tsx";
import { MyBookingsPage } from "./pages/my-bookings-page/MyBookingsPage.tsx";
import { SeatSelectionPage } from "./pages/seat-selection-page/SeatSelectionPage.tsx";
import { CheckoutPage } from "./pages/checkout-page/CheckoutPage.tsx";
import { NotFoundPage } from "./pages/not-found-page/NotFoundPage.tsx";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movies" element={<MoviesPage />} />
      <Route path="/my-bookings" element={<MyBookingsPage />} />
      <Route path="/my-tickets" element={<MyBookingsPage />} />
      <Route path="/seat-selection" element={<SeatSelectionPage />} />
      <Route path="/movie/:id/seats" element={<SeatSelectionPage />} />
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/payment" element={<CheckoutPage />} />
      <Route path="/movie/:id" element={<SingleMovieListingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin-login" element={<AdminLoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/staff-login" element={<AdminLoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ForgotPasswordPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/super-admin" element={<SuperAdminPage />} />
      <Route path="/cinemas" element={<CinemasPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/about-us" element={<AboutPage />} />
      
      {/* 404 Page Not Found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </>
  );
}