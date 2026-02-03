import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { settingsApi } from '../services/api';

const FAQ = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsApi.get();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const faqItems = settings?.faq || [];
  const productName = settings?.productName || 'NeuroVita';
  const whatsapp = settings?.whatsapp || '5511999999999';

  return (
    <div className="min-h-screen pt-20">
      <section className="py-16 md:py-20 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-10 left-0 w-72 h-72 bg-emerald-100 opacity-30 rounded-full blur-3xl" />
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 mb-6">
            <HelpCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Perguntas <span className="text-emerald-600">Frequentes</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Tire suas dúvidas sobre o {productName} e saiba tudo sobre nosso suplemento natural.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqItems.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {faqItems.map((item, index) => (
                <AccordionItem 
                  key={index} 
                  value={`item-${index}`} 
                  className="border border-slate-200 rounded-xl px-6 shadow-sm"
                >
                  <AccordionTrigger className="text-left py-5 hover:no-underline">
                    <span className="text-slate-900 font-medium hover:text-emerald-600">
                      {item.question}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma pergunta frequente cadastrada.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-4">
            Ainda tem dúvidas?
          </h2>
          <p className="text-slate-600 mb-8">
            Nossa equipe está pronta para ajudar você. Entre em contato conosco!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                Falar no WhatsApp
              </Button>
            </a>
            <Link to="/comprar">
              <Button size="lg" variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
                Quero Experimentar
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FAQ;
