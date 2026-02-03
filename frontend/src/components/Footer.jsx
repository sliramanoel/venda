import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, Phone, Instagram } from 'lucide-react';
import { settingsApi } from '../services/api';

export const Footer = () => {
  const [settings, setSettings] = useState({
    siteName: 'NeuroVita',
    description: 'Suplemento natural para potencializar sua memória e disposição diária.',
    phone: '(11) 99999-9999',
    email: 'contato@neurovita.com.br',
    instagram: '@neurovita',
    whatsapp: '5511999999999'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await settingsApi.get();
        setSettings(data);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    loadSettings();
  }, []);

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              {settings?.logoUrl ? (
                <img src={settings.logoUrl} alt={settings.siteName} className="h-9 sm:h-10 object-contain" />
              ) : (
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
              )}
              <span className="text-lg sm:text-xl font-bold text-white">
                {settings?.siteName || 'NeuroVita'}
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {settings?.description || 'Suplemento natural para potencializar sua memória e disposição diária.'}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Links Rápidos</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/" className="text-xs sm:text-sm hover:text-emerald-400 transition-colors duration-200">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/quem-somos" className="text-xs sm:text-sm hover:text-emerald-400 transition-colors duration-200">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-xs sm:text-sm hover:text-emerald-400 transition-colors duration-200">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link to="/comprar" className="text-xs sm:text-sm hover:text-emerald-400 transition-colors duration-200">
                  Comprar Agora
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Contato</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center gap-2 text-xs sm:text-sm">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                <span>{settings?.phone || '(11) 99999-9999'}</span>
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                <span className="break-all">{settings?.email || 'contato@neurovita.com.br'}</span>
              </li>
              <li className="flex items-center gap-2 text-xs sm:text-sm">
                <Instagram className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 flex-shrink-0" />
                <span>{settings?.instagram || '@neurovita'}</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Informações</h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <a href="#" className="text-xs sm:text-sm hover:text-emerald-400 transition-colors duration-200">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm hover:text-emerald-400 transition-colors duration-200">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-xs sm:text-sm hover:text-emerald-400 transition-colors duration-200">
                  Política de Envio
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 sm:mt-10 lg:mt-12 pt-6 sm:pt-8 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
              © {currentYear} {settings?.siteName || 'NeuroVita'}. Todos os direitos reservados.
            </p>
            <p className="text-[10px] sm:text-xs text-slate-600 text-center sm:text-right">
              * Este produto não substitui uma alimentação equilibrada.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
