import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Mail, Phone, Instagram, MapPin } from 'lucide-react';
import { siteConfig } from '../data/mock';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                {siteConfig.name}
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              {siteConfig.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Links Rápidos</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-sm hover:text-emerald-400 transition-colors duration-200">
                  Início
                </Link>
              </li>
              <li>
                <Link to="/quem-somos" className="text-sm hover:text-emerald-400 transition-colors duration-200">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm hover:text-emerald-400 transition-colors duration-200">
                  Perguntas Frequentes
                </Link>
              </li>
              <li>
                <Link to="/comprar" className="text-sm hover:text-emerald-400 transition-colors duration-200">
                  Comprar Agora
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>{siteConfig.phone}</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>{siteConfig.email}</span>
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Instagram className="w-4 h-4 text-emerald-500" />
                <span>{siteConfig.instagram}</span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4">Informações</h4>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-sm hover:text-emerald-400 transition-colors duration-200">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-emerald-400 transition-colors duration-200">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-emerald-400 transition-colors duration-200">
                  Política de Envio
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} {siteConfig.name}. Todos os direitos reservados.
            </p>
            <p className="text-xs text-slate-600">
              * Este produto não substitui uma alimentação equilibrada e seu consumo deve ser orientado por profissional habilitado.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};