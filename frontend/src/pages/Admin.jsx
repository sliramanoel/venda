import React, { useState, useEffect } from 'react';
import { Save, Image, Settings, RefreshCw, CheckCircle2, Link as LinkIcon, Package, Eye } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { settingsApi, imagesApi, ordersApi } from '../services/api';

const Admin = () => {
  const [siteSettings, setSiteSettings] = useState({
    name: '',
    tagline: '',
    description: '',
    phone: '',
    email: '',
    instagram: '',
    paymentLink: '',
  });

  const [productImages, setProductImages] = useState({
    main: '',
    secondary: '',
    tertiary: '',
  });

  const [orders, setOrders] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data from backend
  useEffect(() => {
    const loadData = async () => {
      try {
        const [settings, images, ordersList] = await Promise.all([
          settingsApi.get(),
          imagesApi.get(),
          ordersApi.list()
        ]);
        setSiteSettings(settings);
        setProductImages(images);
        setOrders(ordersList);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleSettingsChange = (e) => {
    const { name, value } = e.target;
    setSiteSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const { name, value } = e.target;
    setProductImages(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    
    try {
      await Promise.all([
        settingsApi.update(siteSettings),
        imagesApi.update(productImages)
      ]);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Error saving:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setIsSaving(false);
    }
  };

  const getQuantityLabel = (qty) => {
    if (qty === 1) return '2 Amostras Grátis';
    if (qty === 2) return '2 Amostras + 1 Frasco';
    return '2 Amostras + 2 Frascos';
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      paid: 'bg-emerald-100 text-emerald-700',
      shipped: 'bg-blue-100 text-blue-700',
      delivered: 'bg-slate-100 text-slate-700'
    };
    const labels = {
      pending: 'Pendente',
      paid: 'Pago',
      shipped: 'Enviado',
      delivered: 'Entregue'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-slate-50 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Painel de Administração</h1>
          <p className="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">Gerencie as configurações do seu site NeuroVita</p>
        </div>

        <Tabs defaultValue="general" className="space-y-6 sm:space-y-8">
          <TabsList className="bg-white shadow-sm border flex-wrap h-auto p-1">
            <TabsTrigger value="general" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs sm:text-sm">
              <Settings className="w-4 h-4 mr-1 sm:mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs sm:text-sm">
              <Image className="w-4 h-4 mr-1 sm:mr-2" />
              Imagens
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs sm:text-sm">
              <LinkIcon className="w-4 h-4 mr-1 sm:mr-2" />
              Pagamento
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs sm:text-sm">
              <Package className="w-4 h-4 mr-1 sm:mr-2" />
              Pedidos
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="name">Nome do Site</Label>
                    <Input
                      id="name"
                      name="name"
                      value={siteSettings.name}
                      onChange={handleSettingsChange}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="tagline">Slogan</Label>
                    <Input
                      id="tagline"
                      name="tagline"
                      value={siteSettings.tagline}
                      onChange={handleSettingsChange}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={siteSettings.description}
                    onChange={handleSettingsChange}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>

                <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
                  <div>
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={siteSettings.phone}
                      onChange={handleSettingsChange}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={siteSettings.email}
                      onChange={handleSettingsChange}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      name="instagram"
                      value={siteSettings.instagram}
                      onChange={handleSettingsChange}
                      className="mt-1.5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Images Settings */}
          <TabsContent value="images">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Image className="w-5 h-5 text-emerald-600" />
                  Imagens do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 sm:space-y-8">
                {/* Main Image */}
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-start">
                  <div>
                    <Label htmlFor="main">Imagem Principal</Label>
                    <Input
                      id="main"
                      name="main"
                      value={productImages.main}
                      onChange={handleImageChange}
                      placeholder="URL da imagem"
                      className="mt-1.5"
                    />
                    <p className="text-xs text-slate-500 mt-1">Cole a URL da imagem do produto</p>
                  </div>
                  <div className="bg-slate-100 rounded-xl p-3 sm:p-4">
                    <img
                      src={productImages.main}
                      alt="Preview principal"
                      className="w-full h-32 sm:h-48 object-cover rounded-lg"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Imagem+Inválida'}
                    />
                  </div>
                </div>

                {/* Secondary Image */}
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-start">
                  <div>
                    <Label htmlFor="secondary">Imagem Secundária</Label>
                    <Input
                      id="secondary"
                      name="secondary"
                      value={productImages.secondary}
                      onChange={handleImageChange}
                      placeholder="URL da imagem"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="bg-slate-100 rounded-xl p-3 sm:p-4">
                    <img
                      src={productImages.secondary}
                      alt="Preview secundário"
                      className="w-full h-32 sm:h-48 object-cover rounded-lg"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Imagem+Inválida'}
                    />
                  </div>
                </div>

                {/* Tertiary Image */}
                <div className="grid md:grid-cols-2 gap-4 sm:gap-6 items-start">
                  <div>
                    <Label htmlFor="tertiary">Imagem Terciária</Label>
                    <Input
                      id="tertiary"
                      name="tertiary"
                      value={productImages.tertiary}
                      onChange={handleImageChange}
                      placeholder="URL da imagem"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="bg-slate-100 rounded-xl p-3 sm:p-4">
                    <img
                      src={productImages.tertiary}
                      alt="Preview terciário"
                      className="w-full h-32 sm:h-48 object-cover rounded-lg"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Imagem+Inválida'}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Settings */}
          <TabsContent value="payment">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <LinkIcon className="w-5 h-5 text-emerald-600" />
                  Configuração de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div>
                  <Label htmlFor="paymentLink">Link de Pagamento PIX</Label>
                  <Input
                    id="paymentLink"
                    name="paymentLink"
                    value={siteSettings.paymentLink}
                    onChange={handleSettingsChange}
                    placeholder="https://seu-link-de-pagamento.com"
                    className="mt-1.5"
                  />
                  <p className="text-xs sm:text-sm text-slate-500 mt-2">
                    Cole aqui o link do seu gateway de pagamento PIX.
                  </p>
                </div>

                {siteSettings.paymentLink ? (
                  <div className="flex items-center gap-2 p-3 sm:p-4 bg-emerald-50 rounded-xl text-emerald-700">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Link de pagamento configurado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-3 sm:p-4 bg-amber-50 rounded-xl text-amber-700">
                    <RefreshCw className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Link de pagamento pendente</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orders List */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <Package className="w-5 h-5 text-emerald-600" />
                  Pedidos ({orders.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum pedido ainda</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order._id} className="p-4 border border-slate-200 rounded-xl hover:border-emerald-200 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <div>
                            <span className="font-semibold text-slate-900">{order.orderNumber}</span>
                            <span className="text-slate-400 text-sm ml-2">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-slate-500">Cliente:</span>
                            <span className="ml-2 text-slate-900">{order.name}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Telefone:</span>
                            <span className="ml-2 text-slate-900">{order.phone}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Opção:</span>
                            <span className="ml-2 text-slate-900">{getQuantityLabel(order.quantity)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500">Total:</span>
                            <span className="ml-2 text-emerald-600 font-semibold">R$ {order.totalPrice.toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-slate-500">
                          {order.address}, {order.number} - {order.neighborhood}, {order.city}/{order.state}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-6 sm:mt-8 flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg w-full sm:w-auto"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
