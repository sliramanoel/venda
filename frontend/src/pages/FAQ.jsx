import React from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

const faqItems = [
  {
    id: "item-1",
    question: "O que é o NeuroVita?",
    answer: "NeuroVita é um suplemento natural desenvolvido para auxiliar na melhora da memória, concentração e disposição. Nossa fórmula exclusiva combina ingredientes naturais cientificamente estudados."
  },
  {
    id: "item-2",
    question: "Como devo tomar o NeuroVita?",
    answer: "Recomendamos tomar 2 cápsulas ao dia, preferencialmente pela manhã, com um copo de água. Para melhores resultados, mantenha o uso contínuo."
  },
  {
    id: "item-3",
    question: "Quanto tempo leva para ver resultados?",
    answer: "Os resultados podem variar de pessoa para pessoa, mas a maioria dos usuários relatam melhorias perceptíveis entre 2 a 4 semanas de uso contínuo."
  },
  {
    id: "item-4",
    question: "O NeuroVita possui contraindicações?",
    answer: "Por ser um produto natural, o NeuroVita é seguro para a maioria das pessoas. No entanto, gestantes, lactantes e pessoas com condições médicas específicas devem consultar um médico antes do uso."
  },
  {
    id: "item-5",
    question: "Como funciona a oferta das amostras grátis?",
    answer: "Você recebe 2 amostras grátis do NeuroVita pagando apenas o frete. É a oportunidade perfeita para experimentar nosso produto sem compromisso."
  },
  {
    id: "item-6",
    question: "Qual a forma de pagamento?",
    answer: "Aceitamos pagamento via PIX, que é instantâneo e seguro. Após a confirmação do pagamento, seu pedido é enviado em até 24 horas úteis."
  },
  {
    id: "item-7",
    question: "Como acompanho meu pedido?",
    answer: "Após o envio, você receberá o código de rastreamento por e-mail ou WhatsApp para acompanhar a entrega em tempo real."
  }
];

const FAQ = () => {
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
            Tire suas dúvidas sobre o NeuroVita e saiba tudo sobre nosso suplemento natural.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="item-1" className="border border-slate-200 rounded-xl px-6 shadow-sm">
              <AccordionTrigger className="text-left py-5 hover:no-underline">
                <span className="text-slate-900 font-medium hover:text-emerald-600">
                  {faqItems[0].question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                {faqItems[0].answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2" className="border border-slate-200 rounded-xl px-6 shadow-sm">
              <AccordionTrigger className="text-left py-5 hover:no-underline">
                <span className="text-slate-900 font-medium hover:text-emerald-600">
                  {faqItems[1].question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                {faqItems[1].answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3" className="border border-slate-200 rounded-xl px-6 shadow-sm">
              <AccordionTrigger className="text-left py-5 hover:no-underline">
                <span className="text-slate-900 font-medium hover:text-emerald-600">
                  {faqItems[2].question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                {faqItems[2].answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4" className="border border-slate-200 rounded-xl px-6 shadow-sm">
              <AccordionTrigger className="text-left py-5 hover:no-underline">
                <span className="text-slate-900 font-medium hover:text-emerald-600">
                  {faqItems[3].question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                {faqItems[3].answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5" className="border border-slate-200 rounded-xl px-6 shadow-sm">
              <AccordionTrigger className="text-left py-5 hover:no-underline">
                <span className="text-slate-900 font-medium hover:text-emerald-600">
                  {faqItems[4].question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                {faqItems[4].answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6" className="border border-slate-200 rounded-xl px-6 shadow-sm">
              <AccordionTrigger className="text-left py-5 hover:no-underline">
                <span className="text-slate-900 font-medium hover:text-emerald-600">
                  {faqItems[5].question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                {faqItems[5].answer}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7" className="border border-slate-200 rounded-xl px-6 shadow-sm">
              <AccordionTrigger className="text-left py-5 hover:no-underline">
                <span className="text-slate-900 font-medium hover:text-emerald-600">
                  {faqItems[6].question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="text-slate-600 pb-5 leading-relaxed">
                {faqItems[6].answer}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
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
            <a href="https://wa.me/5511999999999" target="_blank" rel="noopener noreferrer">
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
