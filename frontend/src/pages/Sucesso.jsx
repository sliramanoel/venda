import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, Truck, Mail, Clock, ArrowRight, Loader2, Home } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ordersApi, settingsApi } from '../services/api';

const Sucesso = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [orderData, settingsData] = await Promise.all([
          ordersApi.get(orderId),
          settingsApi.get()
        ]);
        setOrder(orderData);
        setSettings(settingsData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const siteName = settings?.siteName || 'NeuroVita';
  const productName = settings?.productName || 'NeuroVita';
  const whatsapp = settings?.whatsapp || '5511999999999';

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6 animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">
            Compra Confirmada!
          </h1>
          <p className="text-lg text-slate-600">
            Obrigado por escolher o <span className="font-semibold text-emerald-600">{productName}</span>
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="border-0 shadow-xl mb-6">
          <CardContent className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6 pb-6 border-b">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Número do Pedido</p>
                <p className="text-xl font-bold text-slate-900">{order?.orderNumber || 'N/A'}</p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-slate-900">Resumo do Pedido</h3>
              <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Produto</span>
                  <span className="font-medium">{productName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Frete</span>
                  <span className="font-medium">R$ {order?.shippingPrice?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t">
                  <span className="font-semibold text-slate-900">Total Pago</span>
                  <span className="font-bold text-emerald-600">R$ {order?.totalPrice?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="space-y-2 mb-6">
              <h3 className="font-semibold text-slate-900">Endereço de Entrega</h3>
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-700">
                  {order?.address}, {order?.number}
                  {order?.complement && ` - ${order.complement}`}
                </p>
                <p className="text-sm text-slate-700">
                  {order?.neighborhood} - {order?.city}/{order?.state}
                </p>
                <p className="text-sm text-slate-500">CEP: {order?.cep}</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-center p-4 bg-emerald-50 rounded-xl">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mr-2" />
              <span className="font-semibold text-emerald-700">Pagamento Confirmado</span>
            </div>
          </CardContent>
        </Card>

        {/* Tracking Info Card */}
        <Card className="border-0 shadow-xl mb-6 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
            <div className="flex items-center gap-3 text-white">
              <Truck className="w-6 h-6" />
              <h3 className="font-semibold">Informações de Envio</h3>
            </div>
          </div>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Rastreamento por E-mail</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Assim que seu pedido for postado, você receberá todas as informações de rastreio 
                    no e-mail <span className="font-medium text-slate-900">{order?.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Prazo de Envio</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    Seu pedido será enviado em até <span className="font-medium text-slate-900">24 horas úteis</span> após a confirmação do pagamento.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Package className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Previsão de Entrega</h4>
                  <p className="text-sm text-slate-600 mt-1">
                    O prazo estimado de entrega é de <span className="font-medium text-slate-900">3 a 10 dias úteis</span> dependendo da sua região.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="border-0 shadow-lg bg-slate-50">
          <CardContent className="p-6 text-center">
            <p className="text-slate-600 mb-4">
              Dúvidas sobre seu pedido? Entre em contato conosco!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a 
                href={`https://wa.me/${whatsapp}?text=Olá! Gostaria de saber sobre meu pedido ${order?.orderNumber}`} 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto">
                  Falar no WhatsApp
                </Button>
              </a>
              <Link to="/">
                <Button variant="outline" className="w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer Message */}
        <div className="text-center mt-8">
          <p className="text-sm text-slate-500">
            Agradecemos a confiança! Equipe {siteName} 💚
          </p>
        </div>
      </div>
    </div>
  );
};

export default Sucesso;
