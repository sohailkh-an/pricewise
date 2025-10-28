import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "sonner";
import NavBar from "./components/layout/NavBar/Navbar";
import HomePage from "./pages/homepage/homepage";
import ProductPage from "./pages/product-page/product-page";
import SearchPage from "./pages/search-page/search-page";
import WishlistPage from "./pages/wishlist/wishlist";
import Login from "./pages/auth/login/login";
import Register from "./pages/auth/register/register";
import ForgetPassword from "./pages/auth/forget-password/forget-password";
import ResetPassword from "./pages/auth/reset-password/reset-password";
import AddProduct from "./pages/admin/add-product/add-product";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import Footer from "./components/layout/Footer/Footer";
import AboutPage from "./pages/about/about";
import PrivacyPolicy from "./pages/company/privacy-policy/privacy-policy";
import TermsOfService from "./pages/company/terms-of-service/terms-of-service";
import CookiePolicy from "./pages/company/cookie-policy/cookie-policy";
import ScrollToTop from "./components/layout/ScrollToTop";

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ScrollToTop />
          <Routes>
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <ForgetPassword />
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <ResetPassword />
                </PublicRoute>
              }
            />

            <Route
              path="/*"
              element={
                <div className="min-h-screen flex flex-col">
                  <NavBar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/search" element={<SearchPage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                      <Route path="/product/:id" element={<ProductPage />} />
                      <Route path="/about" element={<AboutPage />} />
                      <Route path="/cookie-policy" element={<CookiePolicy />} />
                      <Route
                        path="/terms-of-service"
                        element={<TermsOfService />}
                      />
                      <Route
                        path="/privacy-policy"
                        element={<PrivacyPolicy />}
                      />
                      <Route
                        path="/admin/add-product"
                        element={
                          <ProtectedRoute>
                            <AddProduct />
                          </ProtectedRoute>
                        }
                      />
                    </Routes>
                  </main>
                  <Footer />
                </div>
              }
            />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
