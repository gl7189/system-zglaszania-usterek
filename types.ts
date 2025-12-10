import React from 'react';
import { IssueForm } from './components/IssueForm';
import { APP_CONFIG } from './config';
import { Building2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="flex-grow py-8 px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8 text-center">
          
          {/* OPCJA 1: Jeśli masz plik z logo (np. URL do ImgBB lub w folderze public), odkomentuj poniższe: */}
          {/* <img src="https://twoja-domena.pl/logo.png" alt="Logo Wspólnoty" className="h-16 mx-auto mb-4" /> */}

          {/* OPCJA 2: Logo oparte na ikonie (Domyślne) */}
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm mb-4">
             <Building2 className="w-10 h-10 text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Portal Zgłoszeniowy</h1>
          <p className="text-slate-600 mt-2 text-lg">Zarządzanie Nieruchomościami i Obsługa Techniczna</p>
        </div>

        {/* Main Content */}
        <main>
          <IssueForm config={APP_CONFIG} />
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500 mb-2">
            &copy; {new Date().getFullYear()} Administracja Budynku "Wspólnota". Wszystkie prawa zastrzeżone.
          </p>
          <div className="text-xs text-slate-400 space-x-4">
            <a href="#" className="hover:text-slate-600 transition-colors">Regulamin</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Polityka Prywatności</a>
            <a href="#" className="hover:text-slate-600 transition-colors">Kontakt</a>
          </div>
        </div>
      </footer>
    </div>
  );
}