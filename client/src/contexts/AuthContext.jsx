import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/users/me`,
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      } else {
        setUser(null);
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/login`,
        { email, password },
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/register`,
        userData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/users/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/users/profile`,
        profileData,
        { withCredentials: true }
      );

      if (response.data.success) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      console.error("Profile update error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Profile update failed",
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
