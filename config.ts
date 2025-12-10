// Konfiguracja EmailJS (Bezpieczna dla Frontendu)
export const APP_CONFIG = {
  // Te dane uzyskasz w panelu EmailJS
  serviceId: 'service_a8e2q28',     
  templateId: 'template_f8p52gb',   
  publicKey: 'y37vsFJVjmxf4kZih',     
  
  // Email administratora/odbiorcy
  // LOGIKA: 
  // 1. Sprawdza czy zdefiniowano zmienną środowiskową VITE_RECEIVER_EMAIL (np. w pliku .env)
  // 2. Jeśli nie ma zmiennej (czyli na produkcji/main), używa domyślnego adresu zarządcy.
  // Używamy (import.meta as any), aby ominąć błędy typowania TypeScript w różnych środowiskach
  receiverEmail: (import.meta as any).env?.VITE_RECEIVER_EMAIL || 'administrator5@zarzadca.wroclaw.pl',

  // Klucz API do ImgBB (darmowy hosting zdjęć)
  imgbbApiKey: '96163e8152806c5e12a21c046a1e8aba' 
};