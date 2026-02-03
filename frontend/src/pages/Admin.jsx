import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, Image, Settings, RefreshCw, CheckCircle2, Link as LinkIcon, 
  Package, Palette, Type, MessageSquare, Star, HelpCircle, Users,
  Plus, Trash2, GripVertical, Eye, Upload, LogOut, User, Loader2, CreditCard,
  BarChart3, Search, Paintbrush
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Switch } from '../components/ui/switch';
import { settingsApi, imagesApi, ordersApi, authApi, uploadsApi, paymentsApi } from '../services/api';
import ImageUploader from '../components/ImageUploader';

const Admin = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(null);
  const [images, setImages] = useState(null);
  const [orders, setOrders] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("brand");
  const [currentUser, setCurrentUser] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all'); // 'all', 'paid', 'pending'
  const [orderSort, setOrderSort] = useState('newest'); // 'newest', 'oldest'

  useEffect(() => {
    // Check authentication
    if (!authApi.isAuthenticated()) {
      navigate('/login');
      return;
    }
    
    // Verify token is still valid
    const verifyAuth = async () => {
      try {
        await authApi.verify();
        setCurrentUser(authApi.getUser());
        loadData();
      } catch (error) {
        console.error('Auth verification failed:', error);
        authApi.logout();
        navigate('/login');
      }
    };
    
    verifyAuth();
  }, [navigate]);

  const loadData = async () => {
    try {
      const [settingsData, imagesData, ordersList] = await Promise.all([
        settingsApi.get(),
        imagesApi.get(),
        ordersApi.list()
      ]);
      setSettings(settingsData);
      setImages(imagesData);
      setOrders(ordersList);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    authApi.logout();
    toast.success('Logout realizado com sucesso');
    navigate('/login');
  };

  const handleSettingsChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setSettings(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleArrayChange = (arrayName, index, field, value) => {
    setSettings(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (arrayName, newItem) => {
    setSettings(prev => ({
      ...prev,
      [arrayName]: [...prev[arrayName], newItem]
    }));
  };

  const removeArrayItem = (arrayName, index) => {
    setSettings(prev => ({
      ...prev,
      [arrayName]: prev[arrayName].filter((_, i) => i !== index)
    }));
  };

  const handleImageChange = (field, value) => {
    setImages(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        settingsApi.update(settings),
        imagesApi.update(images)
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
    const option = settings?.productOptions?.find(o => o.id === qty);
    return option?.name || `Opção ${qty}`;
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-amber-100 text-amber-700',
      paid: 'bg-emerald-100 text-emerald-700',
      shipped: 'bg-blue-100 text-blue-700',
      delivered: 'bg-slate-100 text-slate-700'
    };
    const labels = { pending: 'Pendente', paid: 'Pago', shipped: 'Enviado', delivered: 'Entregue' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Painel de Administração</h1>
            <p className="text-slate-600 mt-1 text-sm">Personalize completamente seu site</p>
          </div>
          <div className="flex items-center gap-3">
            {currentUser && (
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm border">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-700">{currentUser.name}</span>
              </div>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? 'Salvando...' : 'Salvar Tudo'}
            </Button>
            <Button onClick={handleLogout} variant="outline" className="text-slate-600 hover:text-red-600 hover:border-red-300">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-white shadow-sm border flex-wrap h-auto p-1 gap-1">
            <TabsTrigger value="brand" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <Type className="w-4 h-4 mr-1" /> Marca
            </TabsTrigger>
            <TabsTrigger value="theme" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <Paintbrush className="w-4 h-4 mr-1" /> Tema
            </TabsTrigger>
            <TabsTrigger value="product" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <Package className="w-4 h-4 mr-1" /> Produto
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <Image className="w-4 h-4 mr-1" /> Imagens
            </TabsTrigger>
            <TabsTrigger value="hero" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <Eye className="w-4 h-4 mr-1" /> Hero
            </TabsTrigger>
            <TabsTrigger value="benefits" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <Star className="w-4 h-4 mr-1" /> Benefícios
            </TabsTrigger>
            <TabsTrigger value="testimonials" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <MessageSquare className="w-4 h-4 mr-1" /> Depoimentos
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <HelpCircle className="w-4 h-4 mr-1" /> FAQ
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <Users className="w-4 h-4 mr-1" /> Sobre
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <BarChart3 className="w-4 h-4 mr-1" /> Meta Ads
            </TabsTrigger>
            <TabsTrigger value="payments" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <CreditCard className="w-4 h-4 mr-1" /> Pagamentos
            </TabsTrigger>
            <TabsTrigger value="orders" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 text-xs">
              <Package className="w-4 h-4 mr-1" /> Pedidos
            </TabsTrigger>
          </TabsList>

          {/* MARCA / BRAND */}
          <TabsContent value="brand">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Type className="w-5 h-5 text-emerald-600" /> Identidade da Marca</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Site</Label>
                    <Input value={settings?.siteName || ''} onChange={e => handleSettingsChange('siteName', e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Slogan</Label>
                    <Input value={settings?.tagline || ''} onChange={e => handleSettingsChange('tagline', e.target.value)} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Descrição do Site</Label>
                  <Textarea value={settings?.description || ''} onChange={e => handleSettingsChange('description', e.target.value)} className="mt-1.5" rows={3} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>URL do Logo</Label>
                    <Input value={settings?.logoUrl || ''} onChange={e => handleSettingsChange('logoUrl', e.target.value)} placeholder="https://..." className="mt-1.5" />
                    {settings?.logoUrl && <img src={settings.logoUrl} alt="Logo" className="mt-2 h-12 object-contain" />}
                  </div>
                  <div>
                    <Label>URL do Favicon</Label>
                    <Input value={settings?.faviconUrl || ''} onChange={e => handleSettingsChange('faviconUrl', e.target.value)} placeholder="https://..." className="mt-1.5" />
                  </div>
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Contato</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <Label>Telefone</Label>
                      <Input value={settings?.phone || ''} onChange={e => handleSettingsChange('phone', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>E-mail</Label>
                      <Input value={settings?.email || ''} onChange={e => handleSettingsChange('email', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>Instagram</Label>
                      <Input value={settings?.instagram || ''} onChange={e => handleSettingsChange('instagram', e.target.value)} className="mt-1.5" />
                    </div>
                    <div>
                      <Label>WhatsApp</Label>
                      <Input value={settings?.whatsapp || ''} onChange={e => handleSettingsChange('whatsapp', e.target.value)} placeholder="5511999999999" className="mt-1.5" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TEMA / CORES */}
          <TabsContent value="theme">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Paintbrush className="w-5 h-5 text-emerald-600" /> Esquema de Cores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Color Presets */}
                <div>
                  <Label className="mb-3 block">Temas Pré-definidos</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                    {[
                      { name: 'Esmeralda', primary: '#059669', light: '#d1fae5', dark: '#047857' },
                      { name: 'Azul', primary: '#2563eb', light: '#dbeafe', dark: '#1d4ed8' },
                      { name: 'Roxo', primary: '#7c3aed', light: '#ede9fe', dark: '#6d28d9' },
                      { name: 'Rosa', primary: '#db2777', light: '#fce7f3', dark: '#be185d' },
                      { name: 'Laranja', primary: '#ea580c', light: '#ffedd5', dark: '#c2410c' },
                      { name: 'Vermelho', primary: '#dc2626', light: '#fee2e2', dark: '#b91c1c' },
                    ].map((theme) => (
                      <button
                        key={theme.name}
                        type="button"
                        onClick={() => {
                          handleSettingsChange('primaryColor', theme.primary);
                          handleSettingsChange('primaryColorLight', theme.light);
                          handleSettingsChange('primaryColorDark', theme.dark);
                        }}
                        className={`p-3 rounded-xl border-2 transition-all hover:scale-105 ${
                          settings?.primaryColor === theme.primary 
                            ? 'border-slate-900 shadow-lg' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div 
                          className="w-full h-8 rounded-lg mb-2"
                          style={{ backgroundColor: theme.primary }}
                        />
                        <span className="text-xs font-medium text-slate-700">{theme.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Colors */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Cores Personalizadas</h4>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <Label>Cor Principal</Label>
                      <div className="flex gap-2 mt-1.5">
                        <input
                          type="color"
                          value={settings?.primaryColor || '#059669'}
                          onChange={e => handleSettingsChange('primaryColor', e.target.value)}
                          className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200"
                        />
                        <Input 
                          value={settings?.primaryColor || '#059669'} 
                          onChange={e => handleSettingsChange('primaryColor', e.target.value)}
                          placeholder="#059669"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Cor Principal (Clara)</Label>
                      <div className="flex gap-2 mt-1.5">
                        <input
                          type="color"
                          value={settings?.primaryColorLight || '#d1fae5'}
                          onChange={e => handleSettingsChange('primaryColorLight', e.target.value)}
                          className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200"
                        />
                        <Input 
                          value={settings?.primaryColorLight || '#d1fae5'} 
                          onChange={e => handleSettingsChange('primaryColorLight', e.target.value)}
                          placeholder="#d1fae5"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Cor Principal (Escura)</Label>
                      <div className="flex gap-2 mt-1.5">
                        <input
                          type="color"
                          value={settings?.primaryColorDark || '#047857'}
                          onChange={e => handleSettingsChange('primaryColorDark', e.target.value)}
                          className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200"
                        />
                        <Input 
                          value={settings?.primaryColorDark || '#047857'} 
                          onChange={e => handleSettingsChange('primaryColorDark', e.target.value)}
                          placeholder="#047857"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Cor Secundária</Label>
                      <div className="flex gap-2 mt-1.5">
                        <input
                          type="color"
                          value={settings?.secondaryColor || '#0d9488'}
                          onChange={e => handleSettingsChange('secondaryColor', e.target.value)}
                          className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200"
                        />
                        <Input 
                          value={settings?.secondaryColor || '#0d9488'} 
                          onChange={e => handleSettingsChange('secondaryColor', e.target.value)}
                          placeholder="#0d9488"
                          className="font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <Label>Cor de Destaque</Label>
                      <div className="flex gap-2 mt-1.5">
                        <input
                          type="color"
                          value={settings?.accentColor || '#f59e0b'}
                          onChange={e => handleSettingsChange('accentColor', e.target.value)}
                          className="w-12 h-10 rounded-lg cursor-pointer border border-slate-200"
                        />
                        <Input 
                          value={settings?.accentColor || '#f59e0b'} 
                          onChange={e => handleSettingsChange('accentColor', e.target.value)}
                          placeholder="#f59e0b"
                          className="font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview */}
                <div className="border-t pt-6">
                  <h4 className="font-semibold mb-4">Preview</h4>
                  <div className="p-6 bg-slate-100 rounded-xl">
                    <div className="flex flex-wrap gap-3 mb-4">
                      <button 
                        className="px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: settings?.primaryColor || '#059669' }}
                      >
                        Botão Principal
                      </button>
                      <button 
                        className="px-4 py-2 rounded-lg text-white font-medium"
                        style={{ backgroundColor: settings?.primaryColorDark || '#047857' }}
                      >
                        Botão Hover
                      </button>
                      <button 
                        className="px-4 py-2 rounded-lg font-medium"
                        style={{ 
                          backgroundColor: settings?.primaryColorLight || '#d1fae5',
                          color: settings?.primaryColorDark || '#047857'
                        }}
                      >
                        Botão Secundário
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-3 items-center">
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: settings?.primaryColorLight || '#d1fae5',
                          color: settings?.primaryColorDark || '#047857'
                        }}
                      >
                        Badge
                      </span>
                      <span 
                        className="font-semibold"
                        style={{ color: settings?.primaryColor || '#059669' }}
                      >
                        Texto em destaque
                      </span>
                      <span 
                        className="px-3 py-1 rounded-full text-sm font-medium text-white"
                        style={{ backgroundColor: settings?.accentColor || '#f59e0b' }}
                      >
                        Alerta
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PRODUTO */}
          <TabsContent value="product">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-emerald-600" /> Configurações do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Nome do Produto</Label>
                    <Input value={settings?.productName || ''} onChange={e => handleSettingsChange('productName', e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Subtítulo</Label>
                    <Input value={settings?.productSubtitle || ''} onChange={e => handleSettingsChange('productSubtitle', e.target.value)} className="mt-1.5" />
                  </div>
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <Label>Descrição curta</Label>
                    <Input value={settings?.productDescription || ''} onChange={e => handleSettingsChange('productDescription', e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Preço Original (R$)</Label>
                    <Input type="number" step="0.01" value={settings?.originalPrice || ''} onChange={e => handleSettingsChange('originalPrice', parseFloat(e.target.value))} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Preço por Frasco (R$)</Label>
                    <Input type="number" step="0.01" value={settings?.pricePerBottle || ''} onChange={e => handleSettingsChange('pricePerBottle', parseFloat(e.target.value))} className="mt-1.5" />
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold">Opções de Compra</h4>
                    <Button size="sm" variant="outline" onClick={() => addArrayItem('productOptions', { id: Date.now(), name: 'Nova Opção', description: '', price: 0, isDefault: false })}>
                      <Plus className="w-4 h-4 mr-1" /> Adicionar
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {settings?.productOptions?.map((option, idx) => (
                      <div key={option.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="grid sm:grid-cols-4 gap-3">
                          <div>
                            <Label className="text-xs">Nome</Label>
                            <Input value={option.name} onChange={e => handleArrayChange('productOptions', idx, 'name', e.target.value)} className="mt-1" />
                          </div>
                          <div>
                            <Label className="text-xs">Descrição</Label>
                            <Input value={option.description} onChange={e => handleArrayChange('productOptions', idx, 'description', e.target.value)} className="mt-1" />
                          </div>
                          <div>
                            <Label className="text-xs">Preço (R$)</Label>
                            <Input type="number" step="0.01" value={option.price} onChange={e => handleArrayChange('productOptions', idx, 'price', parseFloat(e.target.value))} className="mt-1" />
                          </div>
                          <div className="flex items-end gap-2">
                            <Button size="sm" variant="ghost" className="text-red-500" onClick={() => removeArrayItem('productOptions', idx)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IMAGENS */}
          <TabsContent value="images">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Image className="w-5 h-5 text-emerald-600" /> Imagens do Produto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <ImageUploader
                    label="Imagem Principal"
                    value={images?.main || ''}
                    onChange={(url) => handleImageChange('main', url)}
                  />
                  <ImageUploader
                    label="Imagem Secundária"
                    value={images?.secondary || ''}
                    onChange={(url) => handleImageChange('secondary', url)}
                  />
                  <ImageUploader
                    label="Imagem Terciária"
                    value={images?.tertiary || ''}
                    onChange={(url) => handleImageChange('tertiary', url)}
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Logo e Favicon</h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <ImageUploader
                      label="Logo do Site"
                      value={images?.logo || ''}
                      onChange={(url) => handleImageChange('logo', url)}
                    />
                    <ImageUploader
                      label="Favicon"
                      value={images?.favicon || ''}
                      onChange={(url) => handleImageChange('favicon', url)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HERO SECTION */}
          <TabsContent value="hero">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-emerald-600" /> Seção Hero (Topo)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Badge (etiqueta)</Label>
                    <Input value={settings?.hero?.badge || ''} onChange={e => handleNestedChange('hero', 'badge', e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label>Texto do Botão CTA</Label>
                    <Input value={settings?.hero?.ctaText || ''} onChange={e => handleNestedChange('hero', 'ctaText', e.target.value)} className="mt-1.5" />
                  </div>
                </div>
                <div>
                  <Label>Título Principal</Label>
                  <Input value={settings?.hero?.title || ''} onChange={e => handleNestedChange('hero', 'title', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label>Subtítulo</Label>
                  <Textarea value={settings?.hero?.subtitle || ''} onChange={e => handleNestedChange('hero', 'subtitle', e.target.value)} className="mt-1.5" rows={2} />
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <Label>Barra de Urgência</Label>
                      <p className="text-xs text-slate-500 mt-1">Exibe mensagem de escassez no topo</p>
                    </div>
                    <Switch checked={settings?.hero?.showUrgencyBar || false} onCheckedChange={v => handleNestedChange('hero', 'showUrgencyBar', v)} />
                  </div>
                  {settings?.hero?.showUrgencyBar && (
                    <div>
                      <Label>Texto da Urgência</Label>
                      <Input value={settings?.hero?.urgencyText || ''} onChange={e => handleNestedChange('hero', 'urgencyText', e.target.value)} className="mt-1.5" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BENEFÍCIOS */}
          <TabsContent value="benefits">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><Star className="w-5 h-5 text-emerald-600" /> Benefícios</span>
                  <Button size="sm" variant="outline" onClick={() => addArrayItem('benefits', { icon: 'Star', title: 'Novo Benefício', description: '' })}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings?.benefits?.map((benefit, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                    <div className="grid sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Ícone</Label>
                        <Input value={benefit.icon} onChange={e => handleArrayChange('benefits', idx, 'icon', e.target.value)} placeholder="Brain, Zap, Shield, Clock" className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Título</Label>
                        <Input value={benefit.title} onChange={e => handleArrayChange('benefits', idx, 'title', e.target.value)} className="mt-1" />
                      </div>
                      <div className="sm:col-span-2 flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Descrição</Label>
                          <Input value={benefit.description} onChange={e => handleArrayChange('benefits', idx, 'description', e.target.value)} className="mt-1" />
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-500 self-end" onClick={() => removeArrayItem('benefits', idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DEPOIMENTOS */}
          <TabsContent value="testimonials">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><MessageSquare className="w-5 h-5 text-emerald-600" /> Depoimentos</span>
                  <Button size="sm" variant="outline" onClick={() => addArrayItem('testimonials', { name: 'Nome', age: 30, text: '', rating: 5 })}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings?.testimonials?.map((testimonial, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                    <div className="grid sm:grid-cols-4 gap-3">
                      <div>
                        <Label className="text-xs">Nome</Label>
                        <Input value={testimonial.name} onChange={e => handleArrayChange('testimonials', idx, 'name', e.target.value)} className="mt-1" />
                      </div>
                      <div>
                        <Label className="text-xs">Idade</Label>
                        <Input type="number" value={testimonial.age} onChange={e => handleArrayChange('testimonials', idx, 'age', parseInt(e.target.value))} className="mt-1" />
                      </div>
                      <div className="sm:col-span-2 flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Depoimento</Label>
                          <Textarea value={testimonial.text} onChange={e => handleArrayChange('testimonials', idx, 'text', e.target.value)} className="mt-1" rows={2} />
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-500 self-end" onClick={() => removeArrayItem('testimonials', idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ */}
          <TabsContent value="faq">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2"><HelpCircle className="w-5 h-5 text-emerald-600" /> Perguntas Frequentes</span>
                  <Button size="sm" variant="outline" onClick={() => addArrayItem('faq', { question: 'Nova pergunta?', answer: '' })}>
                    <Plus className="w-4 h-4 mr-1" /> Adicionar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {settings?.faq?.map((item, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-lg">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label className="text-xs">Pergunta</Label>
                          <Input value={item.question} onChange={e => handleArrayChange('faq', idx, 'question', e.target.value)} className="mt-1" />
                        </div>
                        <Button size="sm" variant="ghost" className="text-red-500 self-end" onClick={() => removeArrayItem('faq', idx)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <Label className="text-xs">Resposta</Label>
                        <Textarea value={item.answer} onChange={e => handleArrayChange('faq', idx, 'answer', e.target.value)} className="mt-1" rows={2} />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SOBRE */}
          <TabsContent value="about">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-emerald-600" /> Página Quem Somos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>História</Label>
                  <Textarea value={settings?.aboutHistory || ''} onChange={e => handleSettingsChange('aboutHistory', e.target.value)} className="mt-1.5" rows={4} />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Missão</Label>
                    <Textarea value={settings?.aboutMission || ''} onChange={e => handleSettingsChange('aboutMission', e.target.value)} className="mt-1.5" rows={3} />
                  </div>
                  <div>
                    <Label>Visão</Label>
                    <Textarea value={settings?.aboutVision || ''} onChange={e => handleSettingsChange('aboutVision', e.target.value)} className="mt-1.5" rows={3} />
                  </div>
                </div>
                <div>
                  <Label>Valores (um por linha)</Label>
                  <Textarea 
                    value={settings?.aboutValues?.join('\n') || ''} 
                    onChange={e => handleSettingsChange('aboutValues', e.target.value.split('\n').filter(v => v.trim()))} 
                    className="mt-1.5" rows={5} 
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* META ADS / SEO */}
          <TabsContent value="seo">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-emerald-600" /> Meta Ads & SEO</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Meta Pixel */}
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">Meta Pixel (Facebook Pixel)</h4>
                      <p className="text-xs text-slate-600">Rastreia conversões e cria públicos para anúncios</p>
                    </div>
                  </div>
                  <div>
                    <Label>ID do Pixel</Label>
                    <Input 
                      value={settings?.metaPixelId || ''} 
                      onChange={e => handleSettingsChange('metaPixelId', e.target.value)} 
                      placeholder="Ex: 123456789012345"
                      className="mt-1.5 bg-white" 
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Encontre em: Meta Business Suite → Gerenciador de Eventos → Pixel
                    </p>
                  </div>
                </div>

                {/* Open Graph */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4" /> Open Graph (Compartilhamento Social)
                  </h4>
                  <p className="text-sm text-slate-600">Define como o link aparece quando compartilhado no Facebook, WhatsApp, etc.</p>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Título OG</Label>
                      <Input 
                        value={settings?.ogTitle || ''} 
                        onChange={e => handleSettingsChange('ogTitle', e.target.value)} 
                        placeholder="Deixe vazio para usar título padrão"
                        className="mt-1.5" 
                      />
                    </div>
                    <div>
                      <Label>Imagem OG (URL 1200x630)</Label>
                      <Input 
                        value={settings?.ogImage || ''} 
                        onChange={e => handleSettingsChange('ogImage', e.target.value)} 
                        placeholder="https://exemplo.com/imagem-share.jpg"
                        className="mt-1.5" 
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Descrição OG</Label>
                    <Textarea 
                      value={settings?.ogDescription || ''} 
                      onChange={e => handleSettingsChange('ogDescription', e.target.value)} 
                      placeholder="Descrição que aparece ao compartilhar o link"
                      className="mt-1.5" 
                      rows={2}
                    />
                  </div>

                  {/* Preview */}
                  <div className="p-4 bg-slate-100 rounded-xl">
                    <p className="text-xs text-slate-500 mb-2">Preview do compartilhamento:</p>
                    <div className="bg-white rounded-lg border overflow-hidden max-w-sm">
                      {settings?.ogImage && (
                        <img src={settings.ogImage} alt="OG Preview" className="w-full h-32 object-cover" />
                      )}
                      <div className="p-3">
                        <p className="text-xs text-slate-400 uppercase">{window.location.hostname}</p>
                        <p className="font-semibold text-slate-900 text-sm">{settings?.ogTitle || settings?.siteName || 'Título do Site'}</p>
                        <p className="text-xs text-slate-600 line-clamp-2">{settings?.ogDescription || settings?.description || 'Descrição do site'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 flex items-center gap-2">
                    <Search className="w-4 h-4" /> SEO (Otimização para Buscadores)
                  </h4>
                  
                  <div>
                    <Label>Título da Página (Meta Title)</Label>
                    <Input 
                      value={settings?.metaTitle || ''} 
                      onChange={e => handleSettingsChange('metaTitle', e.target.value)} 
                      placeholder="Deixe vazio para usar nome do site + slogan"
                      className="mt-1.5" 
                    />
                    <p className="text-xs text-slate-500 mt-1">Recomendado: 50-60 caracteres</p>
                  </div>
                  
                  <div>
                    <Label>Meta Description</Label>
                    <Textarea 
                      value={settings?.metaDescription || ''} 
                      onChange={e => handleSettingsChange('metaDescription', e.target.value)} 
                      placeholder="Descrição que aparece nos resultados do Google"
                      className="mt-1.5" 
                      rows={2}
                    />
                    <p className="text-xs text-slate-500 mt-1">Recomendado: 150-160 caracteres</p>
                  </div>
                  
                  <div>
                    <Label>Palavras-chave</Label>
                    <Input 
                      value={settings?.metaKeywords || ''} 
                      onChange={e => handleSettingsChange('metaKeywords', e.target.value)} 
                      placeholder="suplemento, memória, concentração, energia"
                      className="mt-1.5" 
                    />
                  </div>
                </div>

                {/* Tracking Status */}
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-2">Eventos Rastreados</h4>
                  <ul className="text-sm text-emerald-700 space-y-1">
                    <li>✓ PageView - Visualização de página</li>
                    <li>✓ ViewContent - Visualização do produto</li>
                    <li>✓ AddToCart - Seleção de opção</li>
                    <li>✓ InitiateCheckout - Início do checkout</li>
                    <li>✓ AddPaymentInfo - Frete calculado</li>
                    <li>✓ Purchase - Pedido criado</li>
                    <li>✓ UTM Tracking - Atribuição de campanhas</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PAGAMENTOS */}
          <TabsContent value="payments">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><CreditCard className="w-5 h-5 text-emerald-600" /> Gateway de Pagamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* OrionPay Configuration */}
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">OrionPay</h4>
                      <p className="text-xs text-slate-600">Gateway de pagamento PIX</p>
                    </div>
                    <div className="ml-auto">
                      {settings?.orionpayApiKey ? (
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                          Configurado
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                          Não configurado
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>API Key</Label>
                      <Input 
                        type="password"
                        value={settings?.orionpayApiKey || ''} 
                        onChange={e => handleSettingsChange('orionpayApiKey', e.target.value)} 
                        placeholder="opay_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="mt-1.5 bg-white font-mono text-sm" 
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Encontre em: <a href="https://pay.orion.moe/desenvolvedores" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:underline">pay.orion.moe/desenvolvedores</a>
                      </p>
                    </div>

                    <div>
                      <Label>Webhook Secret (opcional)</Label>
                      <Input 
                        type="password"
                        value={settings?.orionpayWebhookSecret || ''} 
                        onChange={e => handleSettingsChange('orionpayWebhookSecret', e.target.value)} 
                        placeholder="whsec_xxxxxxxxxxxxxxxx"
                        className="mt-1.5 bg-white font-mono text-sm" 
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Para validar notificações de pagamento
                      </p>
                    </div>
                  </div>
                </div>

                {/* Payment Settings */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900">Configurações de Pagamento</h4>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Tempo de Expiração do PIX (minutos)</Label>
                      <Input 
                        type="number"
                        min="5"
                        max="120"
                        value={settings?.pixExpirationMinutes || 30} 
                        onChange={e => handleSettingsChange('pixExpirationMinutes', parseInt(e.target.value) || 30)} 
                        className="mt-1.5" 
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                      <div>
                        <Label>Modo de Teste</Label>
                        <p className="text-xs text-slate-500">Gera QR Code local (sem OrionPay)</p>
                      </div>
                      <Switch 
                        checked={settings?.paymentTestMode ?? true}
                        onCheckedChange={(checked) => handleSettingsChange('paymentTestMode', checked)}
                      />
                    </div>
                  </div>
                  
                  {/* Test Mode Alert */}
                  {settings?.paymentTestMode && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-amber-600 text-lg">⚠️</span>
                        </div>
                        <div>
                          <h5 className="font-medium text-amber-800">Modo de Teste Ativo</h5>
                          <p className="text-sm text-amber-700 mt-1">
                            O QR Code PIX está sendo gerado localmente. Para usar a OrionPay em produção:
                          </p>
                          <ul className="text-sm text-amber-700 mt-2 space-y-1 list-disc list-inside">
                            <li>Verifique se sua API Key está válida em <a href="https://pay.orion.moe" target="_blank" rel="noopener noreferrer" className="underline">pay.orion.moe</a></li>
                            <li>Desative o "Modo de Teste" acima</li>
                            <li>Configure o webhook para receber confirmações</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Webhook URL */}
                <div className="p-4 bg-slate-100 rounded-xl">
                  <h4 className="font-semibold text-slate-900 mb-2">URL do Webhook</h4>
                  <p className="text-xs text-slate-600 mb-2">Configure esta URL no painel do OrionPay para receber notificações de pagamento:</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 p-2 bg-white rounded border text-xs font-mono text-slate-700 break-all">
                      {window.location.origin}/api/webhooks/orionpay
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/api/webhooks/orionpay`);
                        toast.success('URL copiada!');
                      }}
                    >
                      Copiar
                    </Button>
                  </div>
                </div>

                {/* Payment Status Card */}
                <div className={`p-4 rounded-xl border-2 ${settings?.orionpayApiKey ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                  <h4 className={`font-semibold mb-2 ${settings?.orionpayApiKey ? 'text-emerald-800' : 'text-amber-800'}`}>
                    Status da Integração
                  </h4>
                  <ul className={`text-sm space-y-1 ${settings?.orionpayApiKey ? 'text-emerald-700' : 'text-amber-700'}`}>
                    <li>{settings?.orionpayApiKey ? '✓' : '○'} API Key configurada</li>
                    <li>{settings?.orionpayApiKey ? '✓' : '○'} Geração de PIX habilitada</li>
                    <li>✓ Webhook configurado para receber pagamentos</li>
                    <li>✓ Atualização automática de status do pedido</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PEDIDOS */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" /> 
                    Pedidos ({orders.length})
                  </CardTitle>
                  
                  {/* Filters */}
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={orderFilter}
                      onChange={(e) => setOrderFilter(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="all">Todos</option>
                      <option value="paid">Pagos</option>
                      <option value="pending">Pendentes</option>
                    </select>
                    <select
                      value={orderSort}
                      onChange={(e) => setOrderSort(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="newest">Mais recentes</option>
                      <option value="oldest">Mais antigos</option>
                    </select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Summary Cards */}
                {orders.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    <div className="p-4 bg-slate-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-slate-900">{orders.length}</p>
                      <p className="text-xs text-slate-500">Total Pedidos</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        {orders.filter(o => o.status === 'paid').length}
                      </p>
                      <p className="text-xs text-emerald-600">Pagos</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl text-center">
                      <p className="text-2xl font-bold text-amber-600">
                        {orders.filter(o => o.status === 'pending').length}
                      </p>
                      <p className="text-xs text-amber-600">Pendentes</p>
                    </div>
                    <div className="p-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-center">
                      <p className="text-2xl font-bold text-white">
                        R$ {orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.totalPrice || 0), 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-emerald-100">Total Vendas</p>
                    </div>
                  </div>
                )}

                {/* Orders List */}
                {(() => {
                  // Filter orders
                  let filteredOrders = [...orders];
                  if (orderFilter === 'paid') {
                    filteredOrders = filteredOrders.filter(o => o.status === 'paid');
                  } else if (orderFilter === 'pending') {
                    filteredOrders = filteredOrders.filter(o => o.status === 'pending');
                  }
                  
                  // Sort orders
                  filteredOrders.sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return orderSort === 'newest' ? dateB - dateA : dateA - dateB;
                  });

                  if (filteredOrders.length === 0) {
                    return (
                      <div className="text-center py-12 text-slate-500">
                        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>{orderFilter === 'all' ? 'Nenhum pedido ainda' : `Nenhum pedido ${orderFilter === 'paid' ? 'pago' : 'pendente'}`}</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {filteredOrders.map((order, index) => (
                        <div 
                          key={order._id} 
                          className={`p-4 border rounded-xl transition-all hover:shadow-md ${
                            order.status === 'paid' 
                              ? 'border-emerald-200 bg-emerald-50/30' 
                              : 'border-slate-200 hover:border-amber-200'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-3">
                              <span className="text-slate-400 text-sm font-mono">#{filteredOrders.length - index}</span>
                              <div>
                                <span className="font-semibold text-slate-900">{order.orderNumber}</span>
                                <span className="text-slate-400 text-sm ml-2">
                                  {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                              </div>
                            </div>
                            {getStatusBadge(order.status)}
                          </div>
                          
                          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-slate-500">Cliente:</span>{' '}
                              <span className="text-slate-900 font-medium">{order.name}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Email:</span>{' '}
                              <span className="text-slate-900">{order.email}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Telefone:</span>{' '}
                              <span className="text-slate-900">{order.phone}</span>
                            </div>
                            <div>
                              <span className="text-slate-500">Total:</span>{' '}
                              <span className="text-emerald-600 font-bold">R$ {order.totalPrice?.toFixed(2)}</span>
                            </div>
                          </div>
                          
                          <div className="mt-2 text-sm text-slate-500">
                            <span className="text-slate-400">Endereço:</span>{' '}
                            {order.address}, {order.number} - {order.neighborhood}, {order.city}/{order.state}
                          </div>
                          
                          {order.status === 'pending' && (
                            <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  try {
                                    await paymentsApi.simulatePayment(order._id);
                                    toast.success('Pagamento confirmado!');
                                    loadData();
                                  } catch (error) {
                                    toast.error('Erro ao confirmar pagamento');
                                  }
                                }}
                                className="text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                              >
                                <CreditCard className="w-4 h-4 mr-2" />
                                Confirmar Pagamento
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Total Sales Summary */}
                {orders.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-slate-200">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-slate-900 rounded-xl text-white">
                      <div>
                        <h4 className="font-semibold text-lg">Resumo de Vendas</h4>
                        <p className="text-slate-400 text-sm">Apenas pedidos pagos</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-emerald-400">
                          R$ {orders.filter(o => o.status === 'paid').reduce((sum, o) => sum + (o.totalPrice || 0), 0).toFixed(2)}
                        </p>
                        <p className="text-slate-400 text-sm">
                          {orders.filter(o => o.status === 'paid').length} pedido(s) confirmado(s)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
