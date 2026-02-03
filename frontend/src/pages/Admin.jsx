import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, Image, Settings, RefreshCw, CheckCircle2, Link as LinkIcon, 
  Package, Palette, Type, MessageSquare, Star, HelpCircle, Users,
  Plus, Trash2, GripVertical, Eye, Upload, LogOut, User, Loader2, CreditCard
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

          {/* PEDIDOS */}
          <TabsContent value="orders">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Package className="w-5 h-5 text-emerald-600" /> Pedidos ({orders.length})</CardTitle>
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
                            <span className="text-slate-400 text-sm ml-2">{new Date(order.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-2 text-sm">
                          <div><span className="text-slate-500">Cliente:</span> <span className="text-slate-900">{order.name}</span></div>
                          <div><span className="text-slate-500">Telefone:</span> <span className="text-slate-900">{order.phone}</span></div>
                          <div><span className="text-slate-500">Opção:</span> <span className="text-slate-900">{getQuantityLabel(order.quantity)}</span></div>
                          <div><span className="text-slate-500">Total:</span> <span className="text-emerald-600 font-semibold">R$ {order.totalPrice.toFixed(2)}</span></div>
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
      </div>
    </div>
  );
};

export default Admin;
