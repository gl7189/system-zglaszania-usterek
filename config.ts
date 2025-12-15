
// Stała z adresem produkcyjnym (Zarządca)
export const PRODUCTION_EMAIL = 'administrator5@zarzadca.wroclaw.pl';

// Wersja aplikacji (wyświetlana w stopce)
export const APP_VERSION = '1.2.0';

// Sprawdzamy środowisko Vercel używając zdefiniowanej stałej globalnej
// Używamy typeof dla bezpieczeństwa, choć define w Vite powinno to obsłużyć
const ENV_NAME = typeof __VERCEL_ENV__ !== 'undefined' ? __VERCEL_ENV__ : 'development';
const IS_VERCEL_PROD = ENV_NAME === 'production';

// Dane kontaktowe i godziny pracy (Logika biznesowa)
export const EMERGENCY_CONTACT_NAME = 'KONSERWATOR DYŻURNY';
export const EMERGENCY_PHONE = '506-048-630';

export const OFFICE_HOURS = {
  START: 8,  // 8:00
  END: 15,   // 15:00
  DAYS: [1, 2, 3, 4, 5] // Dni robocze: 1=Poniedziałek, 5=Piątek
};

// Konfiguracja EmailJS (Bezpieczna dla Frontendu)
export const APP_CONFIG = {
  // Te dane uzyskasz w panelu EmailJS
  serviceId: 'service_a8e2q28',     
  templateId: 'template_f8p52gb',   
  publicKey: 'y37vsFJVjmxf4kZih',     
  
  // Email administratora/odbiorcy
  // LOGIKA "TWARDA":
  // 1. Jeśli Vercel mówi, że to Produkcja -> ZAWSZE mail zarządcy.
  // 2. Jeśli to inne środowisko (Preview/Dev/Local) -> Sprawdź czy jest podany VITE_RECEIVER_EMAIL.
  // 3. Jeśli nie ma zmiennej (fallback) -> mail zarządcy.
  // Używamy optional chaining (?.) dla bezpieczeństwa
  receiverEmail: IS_VERCEL_PROD 
    ? PRODUCTION_EMAIL 
    : (import.meta.env?.VITE_RECEIVER_EMAIL || PRODUCTION_EMAIL),

  // Klucz API do ImgBB (darmowy hosting zdjęć)
  imgbbApiKey: '96163e8152806c5e12a21c046a1e8aba' 
};
