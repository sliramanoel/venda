import React, { useState } from 'react';
import { Package, Truck, CreditCard, CheckCircle2, AlertCircle, Loader2, ShieldCheck, Clock, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { productData, productImages, siteConfig, shippingRates, regionByState } from '../data/mock';

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
      // Fetch address from ViaCEP
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepError('CEP não encontrado.');
        setShipping(null);
        return;
      }

      // Update address fields
      setFormData(prev => ({
        ...prev,
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      }));

      // Calculate shipping based on state/region
      const region = regionByState[data.uf] || 'sudeste';
      const rates = shippingRates[region];
      
      // Simulate shipping calculation with variation based on quantity
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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!shipping) {
      toast.error('Por favor, calcule o frete primeiro.');
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.number) {
      toast.error('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Check if payment link is configured
    if (!siteConfig.paymentLink) {
      toast.info('Link de pagamento será configurado em breve. Obrigado pelo interesse!');
      return;
    }

    // Open payment link
    window.open(siteConfig.paymentLink, '_blank');
  };

  const totalPrice = shipping ? parseFloat(shipping.price) : 0;

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
      {/* Hero Banner */}
      <section className="py-8 md:py-12 bg-emerald-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full mb-4">
            <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span className="text-sm font-medium text-white">Oferta Especial por Tempo Limitado</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {productData.description}
          </h1>
          <p className="text-emerald-100">
            Experimente o NeuroVita sem compromisso
          </p>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Info */}
            <div className="space-y-8">
              {/* Product Image */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-emerald-200/50 to-teal-200/50 rounded-3xl blur-xl" />
                <div className="relative bg-white rounded-2xl shadow-xl p-8">
                  <div className="absolute top-4 left-4 px-4 py-2 bg-emerald-600 text-white text-sm font-bold rounded-full">
                    {productData.freeText}
                  </div>
                  <img
                    src={productImages.main}
                    alt={productData.name}
                    className="w-full h-auto rounded-xl"
                  />
                </div>
              </div>

              {/* Product Details */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900">{productData.name}</h2>
                  <p className="text-slate-600">{productData.subtitle}</p>
                  <p className="text-sm text-slate-500">{productData.capsules}</p>
                  
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <span className="text-slate-400 line-through text-lg">R$ {productData.originalPrice.toFixed(2)}</span>
                    <span className="text-3xl font-bold text-emerald-600">GRÁTIS</span>
                  </div>
                  <p className="text-sm text-slate-600">*Pague apenas o frete</p>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-xl shadow-md">
                  <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">Compra Segura</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-md">
                  <Truck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">Entrega Rápida</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-md">
                  <Clock className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-600">Envio em 24h</p>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <div>
              <Card className="border-0 shadow-xl sticky top-24">
                <CardContent className="p-6 md:p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    Finalize seu Pedido
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Quantity Selection */}
                    <div>
                      <Label className="text-slate-700 font-medium">Quantidade de Amostras</Label>
                      <div className="mt-2 flex gap-3">
                        {[1, 2, 3].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => {
                              setQuantity(num);
                              setShipping(null);
                            }}
                            className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all duration-200 ${
                              quantity === num
                                ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                                : 'border-slate-200 text-slate-600 hover:border-emerald-300'
                            }`}
                          >
                            {num * 2} frascos
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Personal Info */}
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome completo"
                          className="mt-1.5"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">E-mail *</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="seu@email.com"
                            className="mt-1.5"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Telefone *</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(00) 00000-0000"
                            className="mt-1.5"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Shipping Calculator */}
                    <div className="p-4 bg-slate-50 rounded-xl space-y-4">
                      <div className="flex items-center gap-2">
                        <Truck className="w-5 h-5 text-emerald-600" />
                        <span className="font-medium text-slate-900">Calcular Frete</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <div className="flex-1">
                          <Input
                            name="cep"
                            value={formData.cep}
                            onChange={handleInputChange}
                            placeholder="00000-000"
                            maxLength={9}
                          />
                        </div>
                        <Button
                          type="button"
                          onClick={calculateShipping}
                          disabled={loadingCep}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {loadingCep ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            'Calcular'
                          )}
                        </Button>
                      </div>

                      {cepError && (
                        <div className="flex items-center gap-2 text-red-600 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          {cepError}
                        </div>
                      )}

                      {shipping && (
                        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-emerald-800">Frete Calculado</p>
                              <p className="text-sm text-emerald-600">Entrega em {shipping.days} dias úteis</p>
                            </div>
                            <span className="text-xl font-bold text-emerald-700">R$ {shipping.price}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Address Fields (shown after CEP) */}
                    {formData.city && (
                      <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <Label htmlFor="address">Endereço</Label>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="number">Número *</Label>
                            <Input
                              id="number"
                              name="number"
                              value={formData.number}
                              onChange={handleInputChange}
                              className="mt-1.5"
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="complement">Complemento</Label>
                            <Input
                              id="complement"
                              name="complement"
                              value={formData.complement}
                              onChange={handleInputChange}
                              placeholder="Apto, Bloco, etc."
                              className="mt-1.5"
                            />
                          </div>
                          <div>
                            <Label htmlFor="neighborhood">Bairro</Label>
                            <Input
                              id="neighborhood"
                              name="neighborhood"
                              value={formData.neighborhood}
                              onChange={handleInputChange}
                              className="mt-1.5"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">Cidade</Label>
                            <Input
                              id="city"
                              name="city"
                              value={formData.city}
                              onChange={handleInputChange}
                              className="mt-1.5"
                              readOnly
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">Estado</Label>
                            <Input
                              id="state"
                              name="state"
                              value={formData.state}
                              onChange={handleInputChange}
                              className="mt-1.5"
                              readOnly
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Order Summary */}
                    {shipping && (
                      <div className="p-4 bg-slate-900 rounded-xl text-white">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-300">Produto ({quantity * 2} frascos)</span>
                          <span className="text-emerald-400 font-medium">GRÁTIS</span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-slate-300">Frete</span>
                          <span>R$ {shipping.price}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-4 flex justify-between items-center">
                          <span className="font-medium">Total</span>
                          <span className="text-2xl font-bold text-emerald-400">R$ {totalPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    )}

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-300 h-14 text-lg"
                      disabled={!shipping}
                    >
                      <CreditCard className="w-5 h-5 mr-2" />
                      Pagar com PIX
                    </Button>

                    <p className="text-center text-xs text-slate-500">
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