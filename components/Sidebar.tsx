import React, { useState } from 'react';
import { Settings, HelpCircle, Eye, EyeOff, Mail, Key, User } from 'lucide-react';
import { EmailConfig } from '../types';

interface SidebarProps {
  config: EmailConfig;
  setConfig: React.Dispatch<React.SetStateAction<EmailConfig>>;
  isOpen: boolean;
  toggleSidebar: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ config, setConfig, isOpen, toggleSidebar }) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Content */}
      <div className={`fixed top-0 left-0 h-full w-80 bg-white border-r border-slate-200 shadow-xl transform transition-transform duration-300 ease-in-out z-30 overflow-y-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:h-screen lg:shadow-none`}>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8 text-slate-800">
            <Settings className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold">Konfiguracja</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email nadawcy (Gmail)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="senderEmail"
                  value={config.senderEmail}
                  onChange={handleChange}
                  placeholder="twoj.email@gmail.com"
                  className="pl-10 w-full rounded-md border border-slate-300 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Hasło aplikacji
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="appPassword"
                  value={config.appPassword}
                  onChange={handleChange}
                  placeholder="xxxx xxxx xxxx xxxx"
                  className="pl-10 pr-10 w-full rounded-md border border-slate-300 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-1 text-xs text-amber-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                Nigdy nie udostępniaj tego hasła.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Email administratora
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  name="receiverEmail"
                  value={config.receiverEmail}
                  onChange={handleChange}
                  placeholder="admin@firma.pl"
                  className="pl-10 w-full rounded-md border border-slate-300 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
              <div className="flex items-start gap-2">
                <HelpCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 text-sm mb-2">Jak uzyskać hasło?</h4>
                  <ol className="text-xs text-blue-800 space-y-1.5 list-decimal pl-3">
                    <li>Wejdź na <a href="https://myaccount.google.com" target="_blank" rel="noreferrer" className="underline hover:text-blue-950">myaccount.google.com</a></li>
                    <li>Bezpieczeństwo &rarr; Weryfikacja dwuetapowa</li>
                    <li>Wyszukaj "Hasła aplikacji"</li>
                    <li>Wybierz "Poczta" i "Inne urządzenie"</li>
                    <li>Skopiuj wygenerowane hasło</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-8 text-xs text-slate-400 text-center">
            Wersja React 1.0.0
          </div>
        </div>
      </div>
    </>
  );
};