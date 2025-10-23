import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/AuthContext";
import NavBar from "./components/layout/NavBar/Navbar";
import HomePage from "./pages/homepage/homepage";
import ProductPage from "./pages/product-page/product-page";
import Login from "./pages/auth/login/login";
import Register from "./pages/auth/register/register";
import AddProduct from "./pages/admin/add-product/add-product";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import PublicRoute from "./components/auth/PublicRoute";
import Footer from "./components/layout/Footer/Footer";

const queryClient = new QueryClient();

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Router>
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
              path="/*"
              element={
                <div className="min-h-screen flex flex-col">
                  <NavBar />
                  <main className="flex-1">
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/product/:id" element={<ProductPage />} />
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
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
