import React from 'react';
import { IssueForm } from './components/IssueForm';
import { Logo } from './components/Logo';
import { APP_CONFIG } from './config';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="flex-grow py-8 px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8 text-center">
          
          {/* Logo Wspólnoty - teraz klikalne (resetuje stan/odświeża) */}
          <a href="/" title="Strona główna" className="inline-block hover:opacity-90 transition-opacity">
            {/* Używamy komponentu Logo (SVG) zamiast img */}
            <Logo className="h-28 mx-auto mb-6 w-auto" />
          </a>

          <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Zgłaszania Usterek</h1>
          <p className="text-slate-600 mt-2 text-lg">Aleja Śliwowa 26-32</p>
        </div>

        {/* Main Content */}
        <main>
          <IssueForm config={APP_CONFIG} />
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            &copy; 2025 Zarząd Wspólnoty Mieszkaniowej Aleja Śliwowa 26-32. Wszystkie prawa zastrzeżone.
          </p>
        </div>
      </footer>
    </div>
  );
}