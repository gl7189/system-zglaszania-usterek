import React from 'react';
import { IssueForm } from './components/IssueForm';
import { APP_CONFIG } from './config';
import { Building2 } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-8 text-center">
        <div className="inline-flex items-center justify-center p-3 bg-blue-600 rounded-xl shadow-lg mb-4">
          <Building2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">System Zgłaszania Usterek</h1>
        <p className="text-slate-600 mt-2">Formularz zgłoszeniowy dla mieszkańców i najemców</p>
      </div>

      {/* Main Content */}
      <main>
        <IssueForm config={APP_CONFIG} />
      </main>
      
      {/* Footer */}
      <footer className="max-w-3xl mx-auto mt-8 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Administracja Budynku. Wszelkie prawa zastrzeżone.
      </footer>
    </div>
  );
}