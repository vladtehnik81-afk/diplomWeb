import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import HomePage from "./pages/HomePage.jsx";
import UniversityPage from "./pages/UniversityPage.jsx";
import UniversitiesPage from "./pages/UniversitiesPage.jsx";
import ComparePage from "./pages/ComparePage.jsx";
import SpecialtiesPage from "./pages/SpecialtiesPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import ScrollToTopButton from "./components/ScrollToTopButton.jsx";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"               element={<HomePage />} />
          <Route path="/universities"   element={<UniversitiesPage />} />
          <Route path="/university/:id" element={<UniversityPage />} />
          <Route path="/compare"        element={<ComparePage />} />
          <Route path="/specialties"    element={<SpecialtiesPage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/profile"        element={<ProfilePage />} />
          <Route path="*"               element={<NotFoundPage />} />
        </Routes>
      </main>
      <ScrollToTopButton />
    </div>
  );
}