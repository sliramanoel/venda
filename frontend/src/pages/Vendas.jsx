import React, { useState, useEffect } from 'react';
import { Package, Truck, CreditCard, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Clock, Star, Timer, Flame } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { settingsApi, imagesApi, ordersApi } from '../services/api';

const shippingRates = {
  sudeste: { min: 15.90, max: 22.90, days: "3 a 5" },
  sul: { min: 18.90, max: 25.90, days: "4 a 6" },
  nordeste: { min: 22.90, max: 32.90, days: "5 a 8" },
  norte: { min: 25.90, max: 38.90, days: "6 a 10" },
  centroOeste: { min: 19.90, max: 28.90, days: "4 a 7" }
};

const regionByState = {
  SP: "sudeste", RJ: "sudeste", MG: "sudeste", ES: "sudeste",
  PR: "sul", SC: "sul", RS: "sul",
  BA: "nordeste", SE: "nordeste", AL: "nordeste", PE: "nordeste", 
  PB: "nordeste", RN: "nordeste", CE: "nordeste", PI: "nordeste", MA: "nordeste",
  AM: "norte", PA: "norte", AC: "norte", RO: "norte", RR: "norte", AP: "norte", TO: "norte",
  MT: "centroOeste", MS: "centroOeste", GO: "centroOeste", DF: "centroOeste"
};

// Countdown Timer Component
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState(() => {
    // Check if there's a saved end time in sessionStorage
    const savedEndTime = sessionStorage.getItem('neurovita_offer_end');
    if (savedEndTime) {
      const remaining = Math.max(0, Math.floor((parseInt(savedEndTime) - Date.now()) / 1000));
      return remaining;
    }
    // Set initial time: 15 minutes
    const initialTime = 15 * 60;
    sessionStorage.setItem('neurovita_offer_end', (Date.now() + initialTime * 1000).toString());
    return initialTime;
  });

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Reset timer when it reaches 0
          const newTime = 15 * 60;
          sessionStorage.setItem('neurovita_offer_end', (Date.now() + newTime * 1000).toString());
          return newTime;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isUrgent = timeLeft < 300; // Less than 5 minutes

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl ${
      isUrgent ? 'bg-red-50 border-2 border-red-200' : 'bg-amber-50 border-2 border-amber-200'
    }`}>
      <div className={`p-2 rounded-lg ${isUrgent ? 'bg-red-100' : 'bg-amber-100'}`}>
        <Timer className={`w-5 h-5 sm:w-6 sm:h-6 ${isUrgent ? 'text-red-600 animate-pulse' : 'text-amber-600'}`} />
      </div>
      <div className="text-center">
        <p className={`text-xs sm:text-sm font-medium ${isUrgent ? 'text-red-700' : 'text-amber-700'}`}>
          {isUrgent ? 'ÚLTIMOS MINUTOS!' : 'Oferta expira em:'}
        </p>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className={`px-2 sm:px-3 py-1 rounded-lg font-bold text-lg sm:text-2xl ${
            isUrgent ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            {String(minutes).padStart(2, '0')}
          </div>
          <span className={`text-lg sm:text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>:</span>
          <div className={`px-2 sm:px-3 py-1 rounded-lg font-bold text-lg sm:text-2xl ${
            isUrgent ? 'bg-red-600 text-white' : 'bg-amber-600 text-white'
          }`}>
            {String(seconds).padStart(2, '0')}
          </div>
        </div>
      </div>
      {isUrgent && (
        <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 animate-bounce" />
      )}
    </div>
  );
};

const Vendas = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  });
  const [quantity, setQuantity] = useState(1);
  const [shipping, setShipping] = useState(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [cepError, setCepError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [siteConfig, setSiteConfig] = useState({ paymentLink: '' });
  const [productImages, setProductImages] = useState({ main: '' });

  // Load settings and images from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [settings, images] = await Promise.all([
          settingsApi.get(),
          imagesApi.get()
        ]);
        setSiteConfig(settings);
        setProductImages(images);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    loadData();
  }, []);

  const formatCep = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return `${numbers.slice(0, 5)}-${numbers.slice(5, 8)}`;
  };

  const formatPhone = (value) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'cep') {
      const formatted = formatCep(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      setCepError('');
      setShipping(null);
    } else if (name === 'phone') {
      const formatted = formatPhone(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateShipping = async () => {
    const cepNumbers = formData.cep.replace(/\D/g, '');
    
    if (cepNumbers.length !== 8) {
      setCepError('CEP inválido. Digite 8 números.');
      return;
    }

    setLoadingCep(true);
    setCepError('');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado.');
        setShipping(null);
        return;
      }

      setFormData(prev => ({
        ...prev,
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }));

      const region = regionByState[data.uf] || 'sudeste';
      const rates = shippingRates[region];
      const basePrice = rates.min + (Math.random() * (rates.max - rates.min));
      const finalPrice = basePrice * quantity;

      setShipping({
        price: finalPrice.toFixed(2),
        days: rates.days,
        region: region,
      });

      toast.success('Frete calculado com sucesso!');
    } catch (error) {
      setCepError('Erro ao buscar CEP. Tente novamente.');
      setShipping(null);
    } finally {
      setLoadingCep(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!shipping) {
      toast.error('Por favor, calcule o frete primeiro.');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.number) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);

    try {
      // Create order in backend
      const orderData = {
        ...formData,
        quantity,
        productPrice,
        shippingPrice: parseFloat(shipping.price),
        totalPrice
      };

      const order = await ordersApi.create(orderData);
      
      toast.success(`Pedido ${order.orderNumber} criado com sucesso!`);

      // Open payment link if configured
      if (siteConfig.paymentLink) {
        window.open(siteConfig.paymentLink, '_blank');
      } else {
        toast.info('Link de pagamento será configurado em breve. Entraremos em contato!');
      }

      // Reset form
      setFormData({
        name: '', email: '', phone: '', cep: '', address: '',
        number: '', complement: '', neighborhood: '', city: '', state: ''
      });
      setQuantity(1);
      setShipping(null);

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Erro ao criar pedido. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Preço por frasco adicional
  const pricePerBottle = 197;
  const productPrice = quantity === 1 ? 0 : (quantity - 1) * pricePerBottle;
  const totalPrice = shipping ? productPrice + parseFloat(shipping.price) : productPrice;

  return (
    <div className="min-h-screen pt-16 sm:pt-20 bg-slate-50">
      {/* Hero Banner - Mobile optimized */}
      <section className="py-6 sm:py-8 md:py-12 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 rounded-full mb-3">
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 fill-amber-300" />
            <span className="text-xs sm:text-sm font-medium text-white">Oferta Especial por Tempo Limitado</span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
            2 Amostras Grátis - Pague apenas o frete!
          </h1>
          <p className="text-emerald-100 text-sm sm:text-base">
            Experimente o NeuroVita sem compromisso
          </p>
        </div>
      </section>

      <section className="py-6 sm:py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
            {/* Product Info - Mobile first */}
            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
              {/* Product Image */}
              <div className="relative">
                <div className="relative bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8">
                  <div className="absolute top-2 left-2 sm:top-4 sm:left-4 px-3 py-1.5 bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-full z-10">
                    GRÁTIS
                  </div>
                  <img
                    src={productImages.main}
                    alt="NeuroVita"
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>

              {/* Product Details - Mobile card */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">NeuroVita</h2>
                  <p className="text-slate-600 text-sm sm:text-base">Suplemento Natural para Memória e Disposição</p>
                  <p className="text-xs sm:text-sm text-slate-500">60 cápsulas por frasco</p>
                  
                  <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t">
                    <span className="text-slate-400 line-through text-base sm:text-lg">R$ 197,00</span>
                    <span className="text-2xl sm:text-3xl font-bold text-emerald-600">GRÁTIS</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">*Pague apenas o frete</p>
                </CardContent>
              </Card>

              {/* Trust Badges - Mobile grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-md">
                  <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs text-slate-600">Compra Segura</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-md">
                  <Truck className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs text-slate-600">Entrega Rápida</p>
                </div>
                <div className="text-center p-3 sm:p-4 bg-white rounded-xl shadow-md">
                  <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 mx-auto mb-1 sm:mb-2" />
                  <p className="text-[10px] sm:text-xs text-slate-600">Envio em 24h</p>
                </div>
              </div>
            </div>

            {/* Order Form - Mobile optimized */}
            <div>
              {/* Countdown Timer - Urgency */}
              <div className="mb-4 sm:mb-6">
                <CountdownTimer />
              </div>

              <Card className="border-0 shadow-xl lg:sticky lg:top-24">
                <CardContent className="p-4 sm:p-6 md:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    Finalize seu Pedido
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                    {/* Quantity Selection - Mobile touch friendly */}
                    <div>
                      <Label className="text-slate-700 font-medium text-sm sm:text-base">Escolha sua opção</Label>
                      <div className="mt-2 flex flex-col gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setQuantity(1);
                            setShipping(null);
                          }}
                          className={`py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 text-left ${
                            quantity === 1
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 text-slate-600 hover:border-emerald-300 active:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="block text-sm sm:text-base font-semibold">2 Amostras Grátis</span>
                              <span className="block text-xs text-slate-500 mt-0.5">Pague apenas o frete</span>
                            </div>
                            <span className="text-emerald-600 font-bold text-sm sm:text-base">GRÁTIS</span>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setQuantity(2);
                            setShipping(null);
                          }}
                          className={`py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 text-left ${
                            quantity === 2
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 text-slate-600 hover:border-emerald-300 active:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="block text-sm sm:text-base font-semibold">2 Amostras + 1 Frasco</span>
                              <span className="block text-xs text-slate-500 mt-0.5">60 cápsulas extras</span>
                            </div>
                            <span className="text-slate-900 font-bold text-sm sm:text-base">R$ 197,00</span>
                          </div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            setQuantity(3);
                            setShipping(null);
                          }}
                          className={`py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 text-left ${
                            quantity === 3
                              ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 text-slate-600 hover:border-emerald-300 active:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="block text-sm sm:text-base font-semibold">2 Amostras + 2 Frascos</span>
                              <span className="block text-xs text-slate-500 mt-0.5">120 cápsulas extras</span>
                            </div>
                            <span className="text-slate-900 font-bold text-sm sm:text-base">R$ 394,00</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Personal Info - Mobile stacked */}
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-sm">Nome Completo *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome completo"
                          className="mt-1.5 h-11 sm:h-10 text-base sm:text-sm"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label htmlFor="email" className="text-sm">E-mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="seu@email.com"
                            className="mt-1.5 h-11 sm:h-10 text-base sm:text-sm"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="text-sm">Telefone *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(00) 00000-0000"
                            className="mt-1.5 h-11 sm:h-10 text-base sm:text-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Calculator - Mobile friendly */}
                    <div className="p-3 sm:p-4 bg-slate-50 rounded-xl space-y-3 sm:space-y-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-slate-900 text-sm sm:text-base">Calcular Frete</span>
                      </div>
                      
                      <div className="flex gap-2 sm:gap-3">
                        <div className="flex-1">
                          <Input
                            name="cep"
                            value={formData.cep}
                            onChange={handleInputChange}
                            placeholder="00000-000"
                            maxLength={9}
                            className="h-11 sm:h-10 text-base sm:text-sm"
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={calculateShipping}
                          disabled={loadingCep}
                          className="bg-emerald-600 hover:bg-emerald-700 h-11 sm:h-10 px-4 sm:px-6"
                        >
                          {loadingCep ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Calcular'
                          )}
                        </Button>
                      </div>

                      {cepError && (
                        <div className="flex items-center gap-2 text-red-600 text-xs sm:text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {cepError}
                        </div>
                      )}

                      {shipping && (
                        <div className="p-3 sm:p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-emerald-800 text-sm sm:text-base">Frete Calculado</p>
                              <p className="text-xs sm:text-sm text-emerald-600">Entrega em {shipping.days} dias úteis</p>
                            </div>
                            <span className="text-lg sm:text-xl font-bold text-emerald-700">R$ {shipping.price}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address Fields */}
                    {formData.city && (
                      <div className="space-y-3 sm:space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-4 gap-2 sm:gap-4">
                          <div className="col-span-3">
                            <Label htmlFor="address" className="text-sm">Endereço</Label>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="mt-1.5 h-11 sm:h-10 text-base sm:text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="number" className="text-sm">Nº *</Label>
                            <Input
                              id="number"
                              name="number"
                              value={formData.number}
                              onChange={handleInputChange}
                              className="mt-1.5 h-11 sm:h-10 text-base sm:text-sm"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                          <div>
                            <Label htmlFor="complement" className="text-sm">Complemento</Label>
                            <Input
                              id="complement"
                              name="complement"
                              value={formData.complement}
                              onChange={handleInputChange}
                              placeholder="Apto, Bloco..."
                              className="mt-1.5 h-11 sm:h-10 text-base sm:text-sm"
                            />
                          </div>
                          <div>
                            <Label htmlFor="neighborhood" className="text-sm">Bairro</Label>
                            <Input
                              id="neighborhood"
                              name="neighborhood"
                              value={formData.neighborhood}
                              onChange={handleInputChange}
                              className="mt-1.5 h-11 sm:h-10 text-base sm:text-sm"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                          <div>
                            <Label htmlFor="city" className="text-sm">Cidade</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="mt-1.5 h-11 sm:h-10 text-base sm:text-sm bg-slate-100"
                              readOnly
                            />
                          </div>
                          <div>
                            <Label htmlFor="state" className="text-sm">Estado</Label>
                            <Input
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="mt-1.5 h-11 sm:h-10 text-base sm:text-sm bg-slate-100"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    {shipping && (
                      <div className="p-3 sm:p-4 bg-slate-900 rounded-xl text-white">
                        <div className="flex justify-between items-center mb-2 text-sm sm:text-base">
                          <span className="text-slate-300">
                            {quantity === 1 && "2 Amostras Grátis"}
                            {quantity === 2 && "2 Amostras + 1 Frasco"}
                            {quantity === 3 && "2 Amostras + 2 Frascos"}
                          </span>
                          <span className={quantity === 1 ? "text-emerald-400 font-medium" : "font-medium"}>
                            {quantity === 1 ? "GRÁTIS" : `R$ ${productPrice.toFixed(2)}`}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-3 sm:mb-4 text-sm sm:text-base">
                          <span className="text-slate-300">Frete</span>
                          <span>R$ {shipping.price}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-3 sm:pt-4 flex justify-between items-center">
                          <span className="font-medium">Total</span>
                          <span className="text-xl sm:text-2xl font-bold text-emerald-400">R$ {totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Submit Button - Large touch target */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-300 h-14 sm:h-14 text-base sm:text-lg font-semibold"
                      disabled={!shipping || submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5 mr-2" />
                          Pagar com PIX
                        </>
                      )}
                    </Button>

                    <p className="text-center text-[10px] sm:text-xs text-slate-500">
                      Pagamento seguro e instantâneo via PIX
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Vendas;
