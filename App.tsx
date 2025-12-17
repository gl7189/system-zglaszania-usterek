import { IssueForm } from './components/IssueForm';
import { APP_CONFIG, APP_VERSION } from './config';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <div className="flex-grow py-8 px-4">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8 text-center">
          
          {/* Logo Wspólnoty - teraz klikalne (resetuje stan/odświeża) */}
          {/* Zmiana: block zamiast inline-block dla stabilności CLS */}
          <a href="/" title="Strona główna" className="block hover:opacity-90 transition-opacity w-fit mx-auto">
            <img 
              src="https://i.ibb.co/35dqrC0H/logo-as2632.png" 
              alt="Logo Wspólnoty - Aleja Śliwowa" 
              width={96}
              height={96}
              /* fetchPriority="high" mówi przeglądarce, żeby ładowała to priorytetowo (LCP fix) */
              {...({ fetchPriority: "high" } as any)}
              className="h-24 w-24 mx-auto mb-6 object-contain" 
            />
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
          <p className="text-xs text-slate-400 mt-2 font-mono">
            v{APP_VERSION}
          </p>
        </div>
      </footer>
    </div>
  );
}