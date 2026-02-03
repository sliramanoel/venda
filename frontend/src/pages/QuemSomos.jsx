import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Target, Eye, Heart, Award, Users, Leaf, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { imagesApi } from '../services/api';

const aboutData = {
  mission: "Nossa missão é proporcionar saúde e bem-estar através de suplementos naturais de alta qualidade, ajudando pessoas a alcançarem seu potencial máximo de memória e disposição.",
  vision: "Ser referência nacional em suplementação natural para saúde cognitiva, reconhecida pela qualidade e eficácia de nossos produtos.",
  history: "A NeuroVita nasceu da busca por soluções naturais para melhorar a qualidade de vida. Fundada por especialistas em nutrição e fitoterapia, nossa empresa se dedica a desenvolver fórmulas que combinam o melhor da natureza com a ciência moderna."
};

const QuemSomos = () => {
  const [productImages, setProductImages] = useState({ secondary: '' });

  useEffect(() => {
    const loadImages = async () => {
      try {
        const images = await imagesApi.get();
        setProductImages(images);
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };
    loadImages();
  }, []);

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 md:py-24 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-80 h-80 bg-emerald-100 opacity-40 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full">
                Sobre Nós
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Conheça a <span className="text-emerald-600">NeuroVita</span>
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {aboutData.history}
              </p>
            </div>
            
            <div className="relative">
              <img
                src={productImages.secondary}
                alt="Sobre NeuroVita"
                className="relative w-full h-auto rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="h-2 bg-emerald-500" />
                <div className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                    <Target className="w-7 h-7 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Nossa Missão</h3>
                  <p className="text-slate-600 leading-relaxed">{aboutData.mission}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="h-2 bg-teal-500" />
                <div className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center mb-6">
                    <Eye className="w-7 h-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Nossa Visão</h3>
                  <p className="text-slate-600 leading-relaxed">{aboutData.vision}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl overflow-hidden">
              <CardContent className="p-0">
                <div className="h-2 bg-cyan-500" />
                <div className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center mb-6">
                    <Heart className="w-7 h-7 text-cyan-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">Nossos Valores</h3>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-sm">Qualidade sem compromisso</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-sm">Ingredientes 100% naturais</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-sm">Transparência com nossos clientes</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-sm">Compromisso com resultados</span>
                    </li>
                    <li className="flex items-center gap-2 text-slate-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span className="text-sm">Atendimento humanizado</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-emerald-100 text-emerald-700 text-sm font-medium rounded-full mb-4">
              Diferenciais
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Por que confiar na NeuroVita?
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Ingredientes Naturais</h3>
              <p className="text-slate-600">Todos os nossos ingredientes são de origem natural, sem aditivos químicos.</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Qualidade Garantida</h3>
              <p className="text-slate-600">Nossos produtos passam por rigorosos controles de qualidade.</p>
            </div>

            <div className="text-center p-8 bg-white rounded-2xl shadow-lg">
              <div className="w-16 h-16 rounded-full bg-cyan-100 flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-cyan-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-3">Atendimento Humanizado</h3>
              <p className="text-slate-600">Nossa equipe está sempre pronta para atender você.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Faça parte da nossa história
          </h2>
          <p className="text-lg text-slate-300 mb-10">
            Experimente o NeuroVita e descubra o poder dos suplementos naturais.
          </p>
          <Link to="/comprar">
            <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl">
              Experimente Grátis
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default QuemSomos;
