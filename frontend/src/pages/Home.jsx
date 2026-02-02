import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Zap, Shield, Clock, Star, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { siteConfig, benefits, testimonials, productImages } from '../data/mock';

const iconMap = {
  Brain: Brain,
  Zap: Zap,
  Shield: Shield,
  Clock: Clock,
};

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-slate-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-100 opacity-40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-100 opacity-30 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 rounded-full">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-emerald-700">100% Natural</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Memória Afiada,
                <span className="text-emerald-600"> Energia Plena</span>
              </h1>
              
              <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                {siteConfig.description} Experimente gratuitamente e sinta a diferença em seu dia a dia.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/comprar">
                  <Button size="lg" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-600/25 hover:shadow-emerald-600/40 transition-all duration-300 group">
                    Quero Experimentar Grátis
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/quem-somos">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-300 text-slate-700 hover:bg-slate-50">
                    Saiba Mais
                  </Button>
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-600">Frete calculado</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span className="text-sm text-slate-600">Pagamento via PIX</span>
                </div>
              </div>
            </div>
            
            {/* Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-200 opacity-50 rounded-3xl blur-2xl" style={{transform: 'rotate(6deg)'}} />
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-500">
                <img
                  src={productImages.main}
                  alt="NeuroVita - Suplemento Natural"
                  className="w-full h-auto rounded-2xl object-cover"
                />
                <div className="absolute -bottom-4 -right-4 bg-emerald-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                  <span className="text-sm font-semibold">2 Amostras Grátis!</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
              Benefícios
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Por que escolher o NeuroVita?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Nossa fórmula exclusiva foi desenvolvida para proporcionar os melhores resultados de forma natural e segura.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => {
              const IconComponent = iconMap[benefit.icon];
              return (
                <Card 
                  key={benefit.id} 
                  className="group border-0 shadow-lg shadow-slate-100 hover:shadow-xl hover:shadow-emerald-100/50 transition-all duration-300 hover:-translate-y-1"
                >
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
              Depoimentos
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              O que nossos clientes dizem
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Milhares de pessoas já transformaram suas vidas com o NeuroVita.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="border-0 shadow-lg bg-white hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{testimonial.name}</p>
                      <p className="text-sm text-slate-500">{testimonial.age} anos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-900 opacity-20" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 opacity-10 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Experimente o NeuroVita
            <span className="text-emerald-400"> Gratuitamente</span>
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
            Receba 2 amostras grátis pagando apenas o frete. Sem compromisso, sem assinatura. Apenas qualidade.
          </p>
          <Link to="/comprar">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 text-lg px-8 py-6 h-auto">
              Quero Minhas Amostras Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
