import React, { useEffect, useState } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import ThemeProvider from "./components/ThemeProvider";
import Home from "./pages/Home";
import QuemSomos from "./pages/QuemSomos";
import FAQ from "./pages/FAQ";
import Vendas from "./pages/Vendas";
import Pagamento from "./pages/Pagamento";
import Sucesso from "./pages/Sucesso";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import { settingsApi } from "./services/api";
import { initTracking, trackPageView } from "./utils/tracking";
import AnalyticsTracker from "./components/AnalyticsTracker";

// Component to track page views on route change
const PageTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    trackPageView();
  }, [location.pathname]);
  
  return null;
};

// Settings Provider Component
const AppContent = () => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsApi.get();
        setSettings(data);
        initTracking(data);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  return (
    <>
      <ThemeProvider settings={settings} />
      <PageTracker />
      <AnalyticsTracker />
      <Header />
      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quem-somos" element={<QuemSomos />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/comprar" element={<Vendas />} />
          <Route path="/pagamento/:orderId" element={<Pagamento />} />
          <Route path="/sucesso/:orderId" element={<Sucesso />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" richColors />
    </>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </div>
  );
}

export default App;