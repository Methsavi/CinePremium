import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/home-page/HomePage";
import SingleMovieListingPage from "./pages/single-movie-listingpage/SingleMovieListingPage";
import LoginPage from "./pages/login-page/LoginPage";
import RegisterPage from "./pages/register-page/RegisterPage";
import AdminPage from "@/pages/admin-page/AdminPage.tsx";
import SuperAdminPage from "./pages/super-admin-page/SuperAdminPage.tsx";
import { CinemasPage } from "./pages/cinemas-page/CinemasPage.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/movie/:id" element={<SingleMovieListingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/super-admin" element={<SuperAdminPage />} />
      <Route path="/cinemas" element={<CinemasPage />} />
    </Routes>
  );
}