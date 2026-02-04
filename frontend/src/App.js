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
import { settingsApi, analyticsApi } from "./services/api";
import { initTracking, trackPageView } from "./utils/tracking";

// Get UTM params from URL
const getUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content')
  };
};

// Component to track page views on route change
const PageTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Track for Meta Pixel
    trackPageView();
    
    // Track for our Analytics system
    const utmParams = getUtmParams();
    analyticsApi.trackPageview({
      page: location.pathname,
      referrer: document.referrer || null,
      ...utmParams
    });
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