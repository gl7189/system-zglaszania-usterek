// Stała z adresem produkcyjnym (Zarządca)
export const PRODUCTION_EMAIL = 'administrator5@zarzadca.wroclaw.pl';

// Sprawdzamy środowisko Vercel (przekazane przez vite.config.ts)
const IS_VERCEL_PROD = import.meta.env.VERCEL_ENV === 'production';

// Konfiguracja EmailJS (Bezpieczna dla Frontendu)
export const APP_CONFIG = {
  // Te dane uzyskasz w panelu EmailJS
  serviceId: 'service_a8e2q28',     
  templateId: 'template_f8p52gb',   
  publicKey: 'y37vsFJVjmxf4kZih',     
  
  // Email administratora/odbiorcy
  // LOGIKA "TWARDA":
  // 1. Jeśli Vercel mówi, że to Produkcja -> ZAWSZE mail zarządcy (ignoruj zmienne ręczne).
  // 2. Jeśli to inne środowisko (Preview/Dev/Local) -> Sprawdź czy jest podany VITE_RECEIVER_EMAIL.
  // 3. Jeśli nie ma zmiennej (fallback) -> mail zarządcy.
  receiverEmail: IS_VERCEL_PROD 
    ? PRODUCTION_EMAIL 
    : (import.meta.env.VITE_RECEIVER_EMAIL || PRODUCTION_EMAIL),

  // Klucz API do ImgBB (darmowy hosting zdjęć)
  imgbbApiKey: '96163e8152806c5e12a21c046a1e8aba' 
};