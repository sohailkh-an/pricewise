import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import NavBar from "./components/layout/NavBar/Navbar";
import HomePage from "./pages/homepage/homepage";
import ProductPage from "./pages/product-page/product-page";
import Footer from "./components/layout/Footer/Footer";

const queryClient = new QueryClient();

function App() {
  return (
    <>
      <NavBar />
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/4555" element={<ProductPage />} />
          </Routes>
        </Router>
      </QueryClientProvider>
      <Footer />
    </>
  );
}

export default App;
