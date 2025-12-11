// Stała z adresem produkcyjnym (Zarządca)
export const PRODUCTION_EMAIL = 'administrator5@zarzadca.wroclaw.pl';

// Konfiguracja EmailJS (Bezpieczna dla Frontendu)
export const APP_CONFIG = {
  // Te dane uzyskasz w panelu EmailJS
  serviceId: 'service_a8e2q28',     
  templateId: 'template_f8p52gb',   
  publicKey: 'y37vsFJVjmxf4kZih',     
  
  // Email administratora/odbiorcy
  // LOGIKA:
  // 1. Jeśli zdefiniowano zmienną VITE_RECEIVER_EMAIL (w pliku .env lokalnie lub w Vercel dla Preview/Dev), użyj jej.
  // 2. W przeciwnym razie (np. na Produkcji, gdzie zmienna jest wyłączona), użyj PRODUCTION_EMAIL.
  receiverEmail: import.meta.env.VITE_RECEIVER_EMAIL || PRODUCTION_EMAIL,

  // Klucz API do ImgBB (darmowy hosting zdjęć)
  imgbbApiKey: '96163e8152806c5e12a21c046a1e8aba' 
};