import React, { useState, useEffect } from 'react';
import { Save, Image, Settings, RefreshCw, CheckCircle2, Link as LinkIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const Admin = () => {
  const [siteSettings, setSiteSettings] = useState({
    name: 'NeuroVita',
    tagline: 'Memória Afiada, Energia Plena',
    description: 'Suplemento natural para potencializar sua memória e disposição diária.',
    phone: '(11) 99999-9999',
    email: 'contato@neurovita.com.br',
    instagram: '@neurovita',
    paymentLink: '',
  });

  const [productImages, setProductImages] = useState({
    main: 'https://images.unsplash.com/photo-1763668331599-487470fb85b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwzfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85',
    secondary: 'https://images.unsplash.com/photo-1763668444855-401b58dceb20?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwyfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85',
    tertiary: 'https://images.unsplash.com/photo-1763668177859-0ed5669a795e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxOTF8MHwxfHNlYXJjaHwxfHxzdXBwbGVtZW50JTIwYm90dGxlfGVufDB8fHx8MTc3MDA3NDk5NXww&ixlib=rb-4.1.0&q=85',
  });

  const [isSaving, setIsSaving] = useState(false);

  // Load saved settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('neurovita_settings');
    const savedImages = localStorage.getItem('neurovita_images');
    
    if (savedSettings) {
      setSiteSettings(JSON.parse(savedSettings));
    }
    if (savedImages) {
      setProductImages(JSON.parse(savedImages));
    }
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
    
    // Simulate API call - in production, this would save to backend
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    localStorage.setItem('neurovita_settings', JSON.stringify(siteSettings));
    localStorage.setItem('neurovita_images', JSON.stringify(productImages));
    
    toast.success('Configurações salvas com sucesso!');
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Painel de Administração</h1>
          <p className="text-slate-600 mt-2">Gerencie as configurações do seu site NeuroVita</p>
        </div>

        <Tabs defaultValue="general" className="space-y-8">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="general" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
              <Settings className="w-4 h-4 mr-2" />
              Geral
            </TabsTrigger>
            <TabsTrigger value="images" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
              <Image className="w-4 h-4 mr-2" />
              Imagens
            </TabsTrigger>
            <TabsTrigger value="payment" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700">
              <LinkIcon className="w-4 h-4 mr-2" />
              Pagamento
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
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

                <div className="grid md:grid-cols-3 gap-6">
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
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5 text-emerald-600" />
                  Imagens do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Main Image */}
                <div className="grid md:grid-cols-2 gap-6 items-start">
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
                  <div className="bg-slate-100 rounded-xl p-4">
                    <img
                      src={productImages.main}
                      alt="Preview principal"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Imagem+Inválida'}
                    />
                  </div>
                </div>

                {/* Secondary Image */}
                <div className="grid md:grid-cols-2 gap-6 items-start">
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
                  <div className="bg-slate-100 rounded-xl p-4">
                    <img
                      src={productImages.secondary}
                      alt="Preview secundário"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/400x300?text=Imagem+Inválida'}
                    />
                  </div>
                </div>

                {/* Tertiary Image */}
                <div className="grid md:grid-cols-2 gap-6 items-start">
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
                  <div className="bg-slate-100 rounded-xl p-4">
                    <img
                      src={productImages.tertiary}
                      alt="Preview terciário"
                      className="w-full h-48 object-cover rounded-lg"
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
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="w-5 h-5 text-emerald-600" />
                  Configuração de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
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
                  <p className="text-sm text-slate-500 mt-2">
                    Cole aqui o link do seu gateway de pagamento PIX. Este link será aberto quando o cliente clicar em "Pagar com PIX".
                  </p>
                </div>

                {siteSettings.paymentLink ? (
                  <div className="flex items-center gap-2 p-4 bg-emerald-50 rounded-xl text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Link de pagamento configurado</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 bg-amber-50 rounded-xl text-amber-700">
                    <RefreshCw className="w-5 h-5" />
                    <span className="text-sm font-medium">Link de pagamento pendente de configuração</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button
            onClick={handleSaveSettings}
            disabled={isSaving}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg"
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