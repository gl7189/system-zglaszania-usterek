import React, { useState, useRef } from 'react';
import { 
  Send, CheckCircle, Upload, X, 
  Wrench, Sparkles, Loader2, Link as LinkIcon 
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { IssueFormState, IssueCategory, UrgencyLevel, ValidationErrors } from '../types';
import { APP_CONFIG } from '../config';
import { improveDescription } from '../services/geminiService';

// Limit rozmiaru przed wysłaniem na ImgBB (dla wydajności) - 5MB
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; 

export const IssueForm: React.FC<any> = () => {
  const [formState, setFormState] = useState<IssueFormState>({
    senderName: '',
    senderEmail: '',
    location: '',
    category: '',
    urgency: UrgencyLevel.NORMAL,
    description: '',
    photos: [] // Używamy tylko do podglądu lokalnego
  });

  // Stan przechowujący URL do zdjęcia na serwerze
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
  
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isImproving, setIsImproving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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

    // Sprawdź czy klucz API jest skonfigurowany, jeśli użytkownik dodaje zdjęcie
    if (formState.photos.length > 0 && (!APP_CONFIG.imgbbApiKey || APP_CONFIG.imgbbApiKey === 'YOUR_IMGBB_API_KEY_HERE')) {
        alert("Błąd konfiguracji: Brak klucza API ImgBB w pliku config.ts. Zdjęcia nie będą działać.");
        isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleImproveDescription = async () => {
    if (formState.description.length < 5) return;
    setIsImproving(true);
    try {
      const improved = await improveDescription(formState.description);
      setFormState(prev => ({ ...prev, description: improved }));
      setErrors(prev => ({ ...prev, description: undefined }));
    } catch (error) {
      console.error(error);
      alert("Nie udało się połączyć z AI.");
    } finally {
      setIsImproving(false);
    }
  };

  const uploadToImgBB = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    
    // Usuwamy 'YOUR_IMGBB_API_KEY_HERE' jeśli użytkownik zapomniał zmienić, żeby request od razu padł z jasnym błędem
    const apiKey = APP_CONFIG.imgbbApiKey;
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.success) {
      return data.data.url; // Bezpośredni link do obrazka
    } else {
      throw new Error(data.error?.message || 'Błąd uploadu');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_SIZE) {
        alert("Plik jest za duży (max 5MB)");
        return;
    }

    setIsUploading(true);
    try {
        // 1. Pokaż podgląd lokalnie
        setFormState(prev => ({ ...prev, photos: [file] }));

        // 2. Wyślij na serwer ImgBB
        if (!APP_CONFIG.imgbbApiKey || APP_CONFIG.imgbbApiKey.includes('YOUR_IMGBB')) {
            throw new Error("Brak klucza API ImgBB w konfiguracji.");
        }

        const url = await uploadToImgBB(file);
        setUploadedPhotoUrl(url);
        console.log("Zdjęcie wgrane:", url);

    } catch (err: any) {
        console.error("Upload error:", err);
        alert(`Nie udało się wgrać zdjęcia: ${err.message}`);
        // Cofnij wybór
        setFormState(prev => ({ ...prev, photos: [] }));
        setUploadedPhotoUrl('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    } finally {
        setIsUploading(false);
    }
  };

  const removePhoto = () => {
    setFormState(prev => ({ ...prev, photos: [] }));
    setUploadedPhotoUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!formRef.current) return;

    if (isUploading) {
        alert("Poczekaj na zakończenie wysyłania zdjęcia.");
        return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // EmailJS wysyła formularz. 
      // Link zostanie dołączony do pola 'message' (patrz hidden input poniżej),
      // więc pojawi się w treści maila nawet jeśli szablon nie obsługuje 'attachment_link'.
      await emailjs.sendForm(
        APP_CONFIG.serviceId,
        APP_CONFIG.templateId,
        formRef.current,
        APP_CONFIG.publicKey
      );
      
      console.log("=== SUKCES EMAILJS ===");
      setSubmitStatus('success');
      
      // Reset form
      setFormState({
        senderName: '', senderEmail: '', location: '', category: '',
        urgency: UrgencyLevel.NORMAL, description: '', photos: []
      });
      setUploadedPhotoUrl('');
      
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
          Administrator otrzymał powiadomienie.
        </p>
        <button onClick={() => setSubmitStatus('idle')} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg">
          Wyślij kolejne
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Wrench className="w-6 h-6 text-blue-600" />
            Zgłaszanie Usterki
          </h1>
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-6">
          <input type="hidden" name="to_email" value={APP_CONFIG.receiverEmail} />
          <input type="hidden" name="name" value={formState.senderName} />
          <input type="hidden" name="email" value={formState.senderEmail} />
          
          {/* FIX: Łączymy opis i link w jedno pole 'message', bo szablon EmailJS prawdopodobnie używa tylko {{message}} */}
          <input type="hidden" name="message" value={`${formState.description}${uploadedPhotoUrl ? `\n\n--- ZDJĘCIE USTERKI ---\n${uploadedPhotoUrl}` : ''}`} />
          
          {/* Opcjonalnie wysyłamy link osobno, gdyby szablon został zaktualizowany o {{attachment_link}} */}
          <input type="hidden" name="attachment_link" value={uploadedPhotoUrl} />

          {/* Dane osobowe */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nadawca</label>
              <input 
                type="text" 
                name="from_name" 
                value={formState.senderName} 
                onChange={e => setFormState(prev => ({ ...prev, senderName: e.target.value }))} 
                className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2" 
                placeholder="Jan Kowalski" 
              />
              {errors.senderName && <p className="text-red-500 text-xs">{errors.senderName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                name="from_email" 
                value={formState.senderEmail} 
                onChange={e => setFormState(prev => ({ ...prev, senderEmail: e.target.value }))} 
                className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2" 
                placeholder="email@przyklad.pl" 
              />
              {errors.senderEmail && <p className="text-red-500 text-xs">{errors.senderEmail}</p>}
            </div>
          </div>

          {/* Lokalizacja i Kategoria */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Miejsce</label>
              <input 
                type="text" 
                name="location" 
                value={formState.location} 
                onChange={e => setFormState(prev => ({ ...prev, location: e.target.value }))} 
                className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2" 
                placeholder="np. klatka 26" 
              />
              {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategoria</label>
              <select 
                name="category" 
                value={formState.category} 
                onChange={e => setFormState(prev => ({ ...prev, category: e.target.value as IssueCategory }))} 
                className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2"
              >
                <option value="">Wybierz...</option>
                {Object.values(IssueCategory).map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
            </div>
          </div>

          {/* Pilność */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Pilność</label>
            <div className="flex flex-wrap gap-3">
              {Object.values(UrgencyLevel).map((level) => (
                <label key={level} className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border ${formState.urgency === level ? urgencyColor[level] : 'border-slate-200 bg-white'} hover:bg-slate-50`}>
                  <input 
                    type="radio" 
                    name="urgency" 
                    value={level} 
                    checked={formState.urgency === level} 
                    onChange={() => setFormState(prev => ({ ...prev, urgency: level }))} 
                    className="hidden" 
                  />
                  <span className={`font-medium text-sm ${formState.urgency === level ? '' : 'text-slate-600'}`}>{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Opis */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-slate-700">Opis</label>
              <button type="button" onClick={handleImproveDescription} disabled={isImproving || formState.description.length < 5} className="text-xs text-purple-600 flex items-center gap-1">
                {isImproving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} AI
              </button>
            </div>
            {/* Pole tekstowe bez atrybutu name, aby nie nadpisywało naszego hidden inputa 'message' */}
            <textarea 
              value={formState.description} 
              onChange={e => setFormState(prev => ({ ...prev, description: e.target.value }))} 
              rows={5} 
              maxLength={1000}
              className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2" 
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
          </div>

          {/* Zdjęcia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Zdjęcie</label>
            <p className="text-xs text-blue-600 mb-2">
              Zdjęcie zostanie automatycznie wysłane na bezpieczny hosting, a administrator otrzyma link.
            </p>
            
            {formState.photos.length === 0 ? (
              <div className={`border-2 border-dashed border-slate-300 rounded-lg p-6 text-center transition-colors ${isUploading ? 'bg-slate-50 opacity-50 cursor-wait' : 'cursor-pointer hover:bg-slate-50'}`} onClick={() => !isUploading && fileInputRef.current?.click()}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/png, image/jpeg" 
                  className="hidden" 
                />
                {isUploading ? (
                  <div className="flex flex-col items-center">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto" />
                      <p className="text-sm mt-2 text-blue-600">Wysyłanie na serwer...</p>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-sm mt-2 text-slate-600">Kliknij by dodać zdjęcie</p>
                  </>
                )}
              </div>
            ) : null}

            {/* Podgląd */}
            {formState.photos.length > 0 && (
                <div className="mt-2 relative bg-slate-100 rounded border p-2">
                  <div className="flex items-center gap-3">
                     <img src={URL.createObjectURL(formState.photos[0])} alt="" className="h-16 w-16 object-cover rounded" />
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{formState.photos[0].name}</p>
                        {uploadedPhotoUrl ? (
                            <p className="text-xs text-green-600 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Link dołączony do zgłoszenia</p>
                        ) : (
                            <p className="text-xs text-amber-600 flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin"/> Generowanie linku...</p>
                        )}
                     </div>
                     <button type="button" onClick={removePhoto} className="p-2 text-slate-400 hover:text-red-500"><X className="w-5 h-5"/></button>
                  </div>
                </div>
            )}
          </div>

          <button type="submit" disabled={isSubmitting || isUploading || (formState.photos.length > 0 && !uploadedPhotoUrl)} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} Wyślij zgłoszenie
          </button>
        </form>
      </div>
    </div>
  );
};