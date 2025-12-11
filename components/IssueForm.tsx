import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, CheckCircle, Upload, X, 
  Loader2, AlertTriangle, Image as ImageIcon, Trash2
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { IssueFormState, IssueCategory, UrgencyLevel, ValidationErrors } from '../types';
import { APP_CONFIG, PRODUCTION_EMAIL } from '../config';

// Limit rozmiaru przed wysłaniem na ImgBB (dla wydajności) - 5MB
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; 
// Maksymalna liczba zdjęć
const MAX_PHOTOS = 5;

export const IssueForm: React.FC<any> = () => {
  const [formState, setFormState] = useState<IssueFormState>({
    senderName: '',
    senderEmail: '',
    location: '',
    category: '',
    urgency: UrgencyLevel.NORMAL,
    description: '',
    photos: []
  });

  // Stan dla Honeypot (Pułapka na boty)
  const [honeyPot, setHoneyPot] = useState('');

  // ZMIANA: Tablica URL zamiast pojedynczego stringa
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState<string[]>([]);
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Sprawdzamy czy działamy w trybie deweloperskim (inny mail niż produkcyjny)
  const isDevMode = APP_CONFIG.receiverEmail !== PRODUCTION_EMAIL;

  // DEBUGGING: Logowanie konfiguracji przy starcie
  useEffect(() => {
    console.group("🔧 Konfiguracja Formularza");
    console.log("Środowisko Vercel (VERCEL_ENV):", import.meta.env.VERCEL_ENV || 'local/unknown');
    console.log("Tryb developerski (env != prod):", isDevMode);
    console.log("Adres docelowy (używany):", APP_CONFIG.receiverEmail);
    console.log("Adres produkcyjny (wzorzec):", PRODUCTION_EMAIL);
    
    if (isDevMode) {
        console.warn("UWAGA: Jesteś w trybie testowym. Maile nie trafią do zarządcy.");
    } else {
        console.log("OK: Tryb produkcyjny. Zgłoszenia trafią do zarządcy.");
    }
    console.groupEnd();
  }, [isDevMode]);

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {};
    let isValid = true;

    if (!formState.senderName.trim()) { newErrors.senderName = 'Wymagane'; isValid = false; }
    if (!formState.senderEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { newErrors.senderEmail = 'Błędny email'; isValid = false; }
    if (!formState.location.trim()) { newErrors.location = 'Wymagane'; isValid = false; }
    if (!formState.category) { newErrors.category = 'Wymagane'; isValid = false; }
    
    // Zmieniono limit minimalny na 10 znaków
    if (formState.description.length < 10) { newErrors.description = 'Min. 10 znaków'; isValid = false; }
    if (formState.description.length > 1000) { newErrors.description = 'Max. 1000 znaków'; isValid = false; }

    if (uploadedPhotoUrls.length > 0 && (!APP_CONFIG.imgbbApiKey || APP_CONFIG.imgbbApiKey === 'YOUR_IMGBB_API_KEY_HERE')) {
        alert("Błąd konfiguracji: Brak klucza API ImgBB w pliku config.ts.");
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    const apiKey = APP_CONFIG.imgbbApiKey;
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error?.message || 'Błąd uploadu');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Sprawdzenie limitu ilości zdjęć
    if (uploadedPhotoUrls.length + files.length > MAX_PHOTOS) {
        alert(`Możesz dodać maksymalnie ${MAX_PHOTOS} zdjęć.`);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
    }

    // Walidacja rozmiaru dla wszystkich plików
    for (let i = 0; i < files.length; i++) {
        if (files[i].size > MAX_UPLOAD_SIZE) {
            alert(`Plik ${files[i].name} jest za duży (max 5MB).`);
            if (fileInputRef.current) fileInputRef.current.value = '';
            return;
        }
    }

    setIsUploading(true);
    try {
        if (!APP_CONFIG.imgbbApiKey || APP_CONFIG.imgbbApiKey.includes('YOUR_IMGBB')) {
            throw new Error("Brak klucza API ImgBB w konfiguracji.");
        }

        // Upload równoległy (wszystkie naraz)
        const uploadPromises = Array.from(files).map(file => uploadToImgBB(file));
        const newUrls = await Promise.all(uploadPromises);
        
        setUploadedPhotoUrls(prev => [...prev, ...newUrls]);
        console.log("Wgrano nowe zdjęcia:", newUrls);

    } catch (err: any) {
        console.error("Upload error:", err);
        alert(`Nie udało się wgrać zdjęć: ${err.message}`);
    } finally {
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setUploadedPhotoUrls(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- OCHRONA ANTYSPAMOWA (HONEYPOT) ---
    if (honeyPot) {
      console.log("Bot detected. Silently ignoring.");
      setSubmitStatus('success'); 
      return;
    }
    // --------------------------------------

    if (!validate()) return;
    
    if (isUploading) {
        alert("Poczekaj na zakończenie wysyłania zdjęć.");
        return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    // Przygotowanie sekcji ze zdjęciami do treści maila
    let photosSection = "";
    if (uploadedPhotoUrls.length > 0) {
        photosSection = `\n\n--- ZAŁĄCZONE ZDJĘCIA (${uploadedPhotoUrls.length}) ---\n`;
        uploadedPhotoUrls.forEach((url, index) => {
            photosSection += `${index + 1}. ${url}\n`;
        });
    }

    // Modyfikacja opisu - doklejamy listę linków
    const fullDescription = formState.description + photosSection;

    // Przygotowanie danych do wysyłki
    const templateParams = {
        // Odbiorca
        to_email: APP_CONFIG.receiverEmail,

        // Dane zgłaszającego
        senderName: formState.senderName,
        from_name: formState.senderName,
        name: formState.senderName,

        // Email zgłaszającego
        senderEmail: formState.senderEmail,
        reply_to: formState.senderEmail,
        from_email: formState.senderEmail,

        // Szczegóły
        location: formState.location,
        category: formState.category,
        urgency: formState.urgency,

        // Opis (z listą linków)
        description: fullDescription,
        message: fullDescription,

        // Główne zdjęcie (pierwsze z listy lub placeholder) - dla kompatybilności
        photo_url: uploadedPhotoUrls[0] || "Brak załączonych zdjęć"
    };

    console.log("Wysyłanie danych do EmailJS:", templateParams);

    try {
      await emailjs.send(
        APP_CONFIG.serviceId,
        APP_CONFIG.templateId,
        templateParams,
        APP_CONFIG.publicKey
      );
      
      console.log("=== SUKCES EMAILJS ===");
      setSubmitStatus('success');
      
      setFormState({
        senderName: '', senderEmail: '', location: '', category: '',
        urgency: UrgencyLevel.NORMAL, description: '', photos: []
      });
      setUploadedPhotoUrls([]); // Reset zdjęć
      
    } catch (error: any) {
      console.error('FAILED...', error);
      alert("Błąd wysyłania zgłoszenia: " + JSON.stringify(error));
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const urgencyColor = {
    [UrgencyLevel.NORMAL]: 'bg-green-100 border-green-200 text-green-800',
    [UrgencyLevel.URGENT]: 'bg-amber-100 border-amber-200 text-amber-800',
    [UrgencyLevel.EMERGENCY]: 'bg-red-100 border-red-200 text-red-800 animate-pulse'
  };

  if (submitStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Zgłoszenie wysłane!</h2>
        <p className="text-slate-600 mb-6">
          Dziękujemy za zgłoszenie. Administrator został powiadomiony.
          <br/>
          Kopia potwierdzenia powinna dotrzeć na Twój adres email.
        </p>
        <button
          onClick={() => setSubmitStatus('idle')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Wyślij kolejne zgłoszenie
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Dev Mode Banner */}
      {isDevMode && (
         <div className="bg-amber-50 border-b border-amber-200 p-3 text-xs text-amber-800 text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            <span>Tryb testowy: Zgłoszenia trafiają na mail skonfigurowany w środowisku (Vercel/Local), a nie do zarządcy.</span>
         </div>
      )}

      <div className="p-8">
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-8">
          
          {/* Sekcja Danych Kontaktowych */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
              1. Twoje dane kontaktowe
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Imię i Nazwisko *</label>
                <input
                  type="text"
                  name="senderName"
                  value={formState.senderName}
                  onChange={e => setFormState(prev => ({ ...prev, senderName: e.target.value }))}
                  className={`w-full p-2.5 rounded-lg border ${errors.senderName ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500`}
                  placeholder="Jan Kowalski"
                />
                {errors.senderName && <p className="text-red-500 text-xs mt-1">{errors.senderName}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="senderEmail"
                  value={formState.senderEmail}
                  onChange={e => setFormState(prev => ({ ...prev, senderEmail: e.target.value }))}
                  className={`w-full p-2.5 rounded-lg border ${errors.senderEmail ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500`}
                  placeholder="jan@przyklad.pl"
                />
                {errors.senderEmail && <p className="text-red-500 text-xs mt-1">{errors.senderEmail}</p>}
              </div>
            </div>
          </section>

          {/* Sekcja Lokalizacji */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center gap-2">
              2. Lokalizacja i Kategoria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lokalizacja usterki *</label>
                <input
                  type="text"
                  name="location"
                  value={formState.location}
                  onChange={e => setFormState(prev => ({ ...prev, location: e.target.value }))}
                  className={`w-full p-2.5 rounded-lg border ${errors.location ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500`}
                  placeholder="np. Klatka schodowa, Piętro 2"
                />
                {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Kategoria *</label>
                <select
                  name="category"
                  value={formState.category}
                  onChange={e => setFormState(prev => ({ ...prev, category: e.target.value as IssueCategory }))}
                  className={`w-full p-2.5 rounded-lg border ${errors.category ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Wybierz kategorię...</option>
                  {Object.values(IssueCategory).map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>
            </div>
          </section>

          {/* Sekcja Priorytetu */}
          <section>
             <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
              3. Priorytet zgłoszenia
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {Object.values(UrgencyLevel).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setFormState(prev => ({ ...prev, urgency: level }))}
                  className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                    formState.urgency === level 
                      ? `${urgencyColor[level]} border-current shadow-sm scale-[1.02]` 
                      : 'border-slate-200 text-slate-600 hover:border-slate-300 bg-slate-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </section>

          {/* Opis */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">
              4. Opis problemu
            </h3>
            <div>
              <textarea
                name="description"
                value={formState.description}
                onChange={e => setFormState(prev => ({ ...prev, description: e.target.value }))}
                rows={5}
                className={`w-full p-3 rounded-lg border ${errors.description ? 'border-red-500' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500`}
                placeholder="Opisz dokładnie usterkę..."
              />
              <div className="flex justify-between mt-1">
                 {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
                 <p className="text-xs text-slate-400 ml-auto">{formState.description.length}/1000</p>
              </div>
            </div>
          </section>

          {/* Zdjęcia */}
          <section>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2 flex items-center justify-between">
              <span>5. Zdjęcia (Opcjonalne)</span>
              <span className="text-xs font-normal text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                {uploadedPhotoUrls.length} / {MAX_PHOTOS}
              </span>
            </h3>
            
            <div className="space-y-4">
                {/* Lista wgranych zdjęć */}
                {uploadedPhotoUrls.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {uploadedPhotoUrls.map((url, index) => (
                            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                                <img src={url} alt={`Załącznik ${index + 1}`} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button 
                                        type="button"
                                        onClick={() => removePhoto(index)}
                                        className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                                        title="Usuń zdjęcie"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center shadow-sm">
                                    <CheckCircle className="w-3 h-3 mr-0.5" /> Wgrane
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Obszar Uploadu */}
                {uploadedPhotoUrls.length < MAX_PHOTOS && (
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors relative">
                        {isUploading ? (
                            <div className="flex flex-col items-center justify-center py-4">
                                <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                                <span className="text-sm text-slate-600">Wysyłanie zdjęć...</span>
                            </div>
                        ) : (
                            <>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    multiple // Pozwala na wybór wielu plików
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <div className="flex flex-col items-center pointer-events-none">
                                    <div className="bg-blue-50 p-3 rounded-full mb-3">
                                        <ImageIcon className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <p className="text-sm text-slate-700 font-medium">Kliknij, aby dodać zdjęcia</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Możesz dodać jeszcze {MAX_PHOTOS - uploadedPhotoUrls.length} zdjęcie(a). Max 5MB/plik.
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>
          </section>

          {/* Honeypot Field (Hidden) */}
          <div className="hidden">
             <label>Nie wypełniaj tego pola: <input type="text" name="website_url_hp" value={honeyPot} onChange={(e) => setHoneyPot(e.target.value)} /></label>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg shadow-lg transform transition-all 
                ${isSubmitting || isUploading 
                  ? 'bg-slate-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 hover:scale-[1.01] hover:shadow-xl'
                } flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Wysyłanie...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  Wyślij Zgłoszenie
                </>
              )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-4">
               Twoje zgłoszenie zostanie przesłane bezpośrednio do zarządcy nieruchomości.
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}