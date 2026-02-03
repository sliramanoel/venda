import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import QuemSomos from "./pages/QuemSomos";
import FAQ from "./pages/FAQ";
import Vendas from "./pages/Vendas";
import Pagamento from "./pages/Pagamento";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <main className="min-h-screen">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/quem-somos" element={<QuemSomos />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/comprar" element={<Vendas />} />
            <Route path="/pagamento/:orderId" element={<Pagamento />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </BrowserRouter>
    </div>
  );
}

export default App;