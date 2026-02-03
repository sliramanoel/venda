import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Shield, Clock, Star, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { settingsApi, imagesApi } from '../services/api';

const iconMap = { Brain, Zap, Shield, Clock, Star };

const Home = () => {
  const [settings, setSettings] = useState(null);
  const [images, setImages] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [settingsData, imagesData] = await Promise.all([
          settingsApi.get(),
          imagesApi.get()
        ]);
        setSettings(settingsData);
        setImages(imagesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const benefits = settings?.benefits || [];
  const testimonials = settings?.testimonials || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-20 pb-12 sm:pt-28 sm:pb-16 md:pt-36 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-50" />
        <div className="absolute top-10 sm:top-20 right-0 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-emerald-100 opacity-40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 sm:w-64 lg:w-80 h-48 sm:h-64 lg:h-80 bg-teal-100 opacity-30 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="space-y-5 sm:space-y-6 lg:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-100 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs sm:text-sm font-medium text-emerald-700">{settings?.hero?.badge || '100% Natural'}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                {settings?.hero?.title || settings?.tagline || 'Seu Produto Incrível'}
              </h1>
              
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0">
                {settings?.hero?.subtitle || settings?.description}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link to="/comprar" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto h-12 sm:h-11 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl group text-base">
                    {settings?.hero?.ctaText || 'Comprar Agora'}
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/quem-somos" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 sm:h-11 border-slate-300 text-slate-700 hover:bg-slate-50 text-base">
                    Saiba Mais
                  </Button>
                </Link>
              </div>
              
              <div className="flex items-center gap-4 sm:gap-6 pt-2 sm:pt-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                  <span className="text-xs sm:text-sm text-slate-600">Frete calculado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                  <span className="text-xs sm:text-sm text-slate-600">Pagamento via PIX</span>
                </div>
              </div>
            </div>
            
            <div className="relative mt-6 lg:mt-0">
              <div className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 lg:p-8 mx-auto max-w-sm sm:max-w-md lg:max-w-none transform hover:scale-105 transition-transform duration-500">
                <img
                  src={images?.main || ''}
                  alt={settings?.productName || 'Produto'}
                  className="w-full h-auto rounded-xl sm:rounded-2xl object-cover"
                />
                <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-emerald-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl shadow-lg">
                  <span className="text-xs sm:text-sm font-semibold">{settings?.productOptions?.[0]?.name || 'Oferta Especial!'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      {benefits.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium rounded-full mb-3 sm:mb-4">
                Benefícios
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                Por que escolher o {settings?.productName}?
              </h2>
            </div>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
              {benefits.map((benefit, idx) => {
                const IconComponent = iconMap[benefit.icon] || Star;
                return (
                  <Card key={idx} className="group border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                    <CardContent className="p-4 sm:p-5 lg:p-6">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl sm:rounded-2xl bg-emerald-500 flex items-center justify-center mb-3 sm:mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                      </div>
                      <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-slate-900 mb-1 sm:mb-2">{benefit.title}</h3>
                      <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 sm:mb-12 lg:mb-16">
              <span className="inline-block px-3 sm:px-4 py-1 sm:py-1.5 bg-emerald-100 text-emerald-700 text-xs sm:text-sm font-medium rounded-full mb-3 sm:mb-4">
                Depoimentos
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 sm:mb-4">
                O que nossos clientes dizem
              </h2>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
              {testimonials.map((testimonial, idx) => (
                <Card key={idx} className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-5 sm:p-6 lg:p-8">
                    <div className="flex gap-0.5 sm:gap-1 mb-3 sm:mb-4">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <p className="text-slate-700 mb-4 sm:mb-6 leading-relaxed italic text-sm sm:text-base">"{testimonial.text}"</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                        {testimonial.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm sm:text-base">{testimonial.name}</p>
                        <p className="text-xs sm:text-sm text-slate-500">{testimonial.age} anos</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 sm:py-16 md:py-20 lg:py-28 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900 opacity-20" />
        <div className="absolute top-0 right-0 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-emerald-500 opacity-10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            Experimente o {settings?.productName}
            <span className="text-emerald-400"> Agora</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 mb-6 sm:mb-8 lg:mb-10 max-w-2xl mx-auto">
            {settings?.productOptions?.[0]?.description || 'Aproveite nossa oferta especial'}
          </p>
          <Link to="/comprar">
            <Button size="lg" className="w-full sm:w-auto h-12 sm:h-14 bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl text-base sm:text-lg px-6 sm:px-8">
              {settings?.hero?.ctaText || 'Comprar Agora'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
