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
          
          {/* 
             MIEJSCE NA LOGO 
             Zalecane wymiary: Wysokość 64px - 128px. 
             Jeśli masz plik, wgraj go np. na ImgBB i wklej link poniżej w src.
          */}
          {/* <img src="https://twoja-domena.pl/logo.png" alt="Logo Wspólnoty" className="h-16 mx-auto mb-4" /> */}

          {/* Domyślne logo (ikona) */}
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm mb-4">
             <Building2 className="w-10 h-10 text-blue-600" />
          </div>

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