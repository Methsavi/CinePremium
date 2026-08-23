import { Routes, Route } from "react-router-dom";
import ScrollToTop from "./components/ScrollToTop";
import HomePage from "./pages/home-page/HomePage";
import SingleMovieListingPage from "./pages/single-movie-listingpage/SingleMovieListingPage";
import LoginPage from "./pages/login-page/LoginPage";
import RegisterPage from "./pages/register-page/RegisterPage";
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
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/super-admin" element={<SuperAdminPage />} />
      <Route path="/cinemas" element={<CinemasPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/about-us" element={<AboutPage />} />
      
      {/* 404 Page Not Found (Catches all undefined routes including /my-payments) */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </>
  );
}