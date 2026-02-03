import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Copy, CheckCircle2, Clock, AlertCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { toast } from 'sonner';
import { paymentsApi, ordersApi } from '../services/api';
import { trackPurchase, trackCompleteRegistration } from '../utils/tracking';

const Pagamento = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  const [order, setOrder] = useState(null);
  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 min
  const [hasTrackedPurchase, setHasTrackedPurchase] = useState(false);

  // Load order and generate PIX
  useEffect(() => {
    const loadOrder = async () => {
      try {
        const orderData = await ordersApi.get(orderId);
        setOrder(orderData);
        
        // Track Purchase/CompleteRegistration when order is loaded
        if (!hasTrackedPurchase && orderData) {
          trackPurchase({
            productName: 'NeuroVita',
            optionId: String(orderData.quantity || 1),
            totalPrice: orderData.totalPrice || 0,
            orderId: orderData.orderNumber || orderId
          });
          trackCompleteRegistration({
            productName: 'NeuroVita',
            totalPrice: orderData.totalPrice || 0
          });
          setHasTrackedPurchase(true);
        }
        
        if (orderData.status === 'paid') {
          setPaymentStatus('paid');
          setLoading(false);
          return;
        }

        // Generate PIX
        setGenerating(true);
        const pix = await paymentsApi.generatePix(orderId);
        setPixData(pix);
        
        if (pix.expiresAt) {
          const expiresAt = new Date(pix.expiresAt);
          const now = new Date();
          const remaining = Math.max(0, Math.floor((expiresAt - now) / 1000));
          setTimeLeft(remaining);
        }
      } catch (error) {
        console.error('Error loading order:', error);
        toast.error('Erro ao carregar pedido');
      } finally {
        setLoading(false);
        setGenerating(false);
      }
    };

    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || paymentStatus === 'paid') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, paymentStatus]);

  // Check payment status periodically
  const checkPayment = useCallback(async () => {
    try {
      const status = await paymentsApi.checkStatus(orderId);
      if (status.isPaid) {
        setPaymentStatus('paid');
        toast.success('Pagamento confirmado! Redirecionando...');
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          navigate(`/sucesso/${orderId}`);
        }, 2000);
      }
      return status.isPaid;
    } catch (error) {
      console.error('Error checking status:', error);
      return false;
    }
  }, [orderId, navigate]);

  useEffect(() => {
    if (paymentStatus === 'paid' || !pixData) return;

    const interval = setInterval(async () => {
      const isPaid = await checkPayment();
      if (isPaid) {
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [pixData, paymentStatus, checkPayment]);

  const copyPixCode = () => {
    if (pixData?.pixCode) {
      navigator.clipboard.writeText(pixData.pixCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-20 bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Carregando pagamento...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen pt-20 bg-slate-50 flex items-center justify-center">
        <Card className="max-w-md mx-4">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">Pedido não encontrado</h2>
            <p className="text-slate-600 mb-6">Não foi possível encontrar este pedido.</p>
            <Link to="/comprar">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Fazer novo pedido
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentStatus === 'paid') {
    return (
      <div className="min-h-screen pt-20 bg-slate-50">
        <div className="max-w-lg mx-auto px-4 py-12">
          <Card className="border-0 shadow-xl overflow-hidden">
            <div className="bg-emerald-500 p-6 text-center">
              <CheckCircle2 className="w-20 h-20 text-white mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white">Pagamento Confirmado!</h1>
            </div>
            <CardContent className="p-6 sm:p-8 text-center">
              <p className="text-slate-600 mb-6">
                Obrigado pela sua compra! Seu pedido <strong>{order.orderNumber}</strong> foi confirmado.
              </p>
              <div className="bg-slate-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-slate-500 mb-1">Total pago</p>
                <p className="text-2xl font-bold text-emerald-600">R$ {order.totalPrice.toFixed(2)}</p>
              </div>
              <p className="text-sm text-slate-500 mb-6">
                Você receberá um e-mail com os detalhes do envio em breve.
              </p>
              <div className="flex flex-col gap-3">
                <Link to={`/sucesso/${orderId}`}>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Ver detalhes do pedido
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Voltar ao início
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="max-w-lg mx-auto px-4 py-8 sm:py-12">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Voltar</span>
        </button>

        <Card className="border-0 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-emerald-600 p-4 sm:p-6 text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Pagamento via PIX</h1>
            <p className="text-emerald-100 text-sm">Pedido {order.orderNumber}</p>
          </div>

          <CardContent className="p-4 sm:p-6">
            {/* Timer */}
            <div className={`flex items-center justify-center gap-2 p-3 rounded-xl mb-6 ${
              timeLeft < 300 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
            }`}>
              <Clock className={`w-5 h-5 ${timeLeft < 300 ? 'animate-pulse' : ''}`} />
              <span className="font-medium">
                {timeLeft > 0 ? `Expira em ${formatTime(timeLeft)}` : 'PIX expirado'}
              </span>
            </div>

            {/* Amount */}
            <div className="text-center mb-6">
              <p className="text-slate-500 text-sm mb-1">Valor a pagar</p>
              <p className="text-3xl sm:text-4xl font-bold text-slate-900">
                R$ {order.totalPrice.toFixed(2)}
              </p>
            </div>

            {generating ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600 mx-auto mb-4" />
                <p className="text-slate-600">Gerando código PIX...</p>
              </div>
            ) : pixData ? (
              <>
                {/* QR Code */}
                {pixData.qrCode && (
                  <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-xl shadow-inner border-2 border-slate-100">
                      <img 
                        src={pixData.qrCode.startsWith('http') ? pixData.qrCode : `data:image/png;base64,${pixData.qrCode}`}
                        alt="QR Code PIX"
                        className="w-48 h-48 sm:w-56 sm:h-56 object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* PIX Code */}
                <div className="mb-6">
                  <p className="text-sm text-slate-500 mb-2 text-center">Ou copie o código PIX:</p>
                  <div className="relative">
                    <div className="bg-slate-100 rounded-xl p-3 pr-12 font-mono text-xs sm:text-sm break-all max-h-24 overflow-y-auto">
                      {pixData.pixCode}
                    </div>
                    <button
                      onClick={copyPixCode}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white rounded-lg shadow hover:bg-slate-50 transition-colors"
                    >
                      {copied ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Copy Button */}
                <Button
                  onClick={copyPixCode}
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white mb-4"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Código copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-5 h-5 mr-2" />
                      Copiar código PIX
                    </>
                  )}
                </Button>

                {/* Status check */}
                <button
                  onClick={checkPayment}
                  className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-emerald-600 text-sm py-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Verificar pagamento
                </button>
              </>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <p className="text-slate-600 mb-4">Não foi possível gerar o código PIX</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Tentar novamente
                </Button>
              </div>
            )}

            {/* Instructions */}
            <div className="mt-6 p-4 bg-slate-50 rounded-xl">
              <h3 className="font-semibold text-slate-900 mb-3">Como pagar:</h3>
              <ol className="space-y-2 text-sm text-slate-600">
                <li className="flex gap-2">
                  <span className="font-semibold text-emerald-600">1.</span>
                  Abra o app do seu banco
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-emerald-600">2.</span>
                  Escolha pagar via PIX com QR Code ou código
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-emerald-600">3.</span>
                  Escaneie o QR Code ou cole o código copiado
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold text-emerald-600">4.</span>
                  Confirme o pagamento no seu banco
                </li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Order summary */}
        <Card className="mt-6 border-0 shadow-lg">
          <CardContent className="p-4">
            <h3 className="font-semibold text-slate-900 mb-3">Resumo do pedido</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Produto</span>
                <span className="text-slate-900">
                  {order.quantity === 1 && '2 Amostras Grátis'}
                  {order.quantity === 2 && '2 Amostras + 1 Frasco'}
                  {order.quantity === 3 && '2 Amostras + 2 Frascos'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="text-slate-900">R$ {order.productPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Frete</span>
                <span className="text-slate-900">R$ {order.shippingPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t font-semibold">
                <span className="text-slate-900">Total</span>
                <span className="text-emerald-600">R$ {order.totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Pagamento;
