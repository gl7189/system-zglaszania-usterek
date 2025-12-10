import React, { useState, useRef } from 'react';
import { 
  Send, CheckCircle, Upload, X, 
  MapPin, Wrench, Sparkles, Loader2 
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { IssueFormState, IssueCategory, UrgencyLevel, ValidationErrors } from '../types';
import { APP_CONFIG } from '../config';
import { improveDescription } from '../services/geminiService';

const MAX_FILE_SIZE_MB = 2; // Zmniejszone dla darmowej wersji EmailJS
const MAX_FILES = 2; // Ograniczone dla stabilności

// Helper do konwersji pliku na Base64
const convertToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

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

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    if (formState.description.length < 20) { newErrors.description = 'Min. 20 znaków'; isValid = false; }

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
    } finally {
      setIsImproving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    if (files.length + formState.photos.length > MAX_FILES) {
      alert(`Maksymalnie ${MAX_FILES} zdjęcia w wersji darmowej.`);
      return;
    }

    const validFiles = files.filter(file => {
      const isValidSize = file.size <= MAX_FILE_SIZE_MB * 1024 * 1024;
      const isValidType = ['image/jpeg', 'image/png'].includes(file.type);
      return isValidSize && isValidType;
    });

    if (validFiles.length !== files.length) {
      alert(`Pominięto pliki > ${MAX_FILE_SIZE_MB}MB lub nieprawidłowy format.`);
    }

    setFormState(prev => ({ ...prev, photos: [...prev.photos, ...validFiles] }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePhoto = (index: number) => {
    setFormState(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // 1. Przygotowanie zdjęć (tylko 1 zdjęcie w podstawowej wersji szablonu dla uproszczenia)
      // W wersji produkcyjnej EmailJS zalecane jest wysyłanie linków do zdjęć, a nie samych plików Base64
      const photo1 = formState.photos[0] ? await convertToBase64(formState.photos[0]) : '';
      
      const templateParams = {
        to_email: APP_CONFIG.receiverEmail,
        from_name: formState.senderName,
        from_email: formState.senderEmail,
        location: formState.location,
        category: formState.category,
        urgency: formState.urgency,
        message: formState.description,
        // Załączniki w EmailJS wymagają włączenia ich w szablonie lub płatnego planu dla dużych plików
        // Tutaj wysyłamy tylko tekst dla pewności działania w darmowym planie
        my_photo: photo1 // Przykładowe przekazanie Base64 (wymaga konfiguracji w EmailJS)
      };

      await emailjs.send(
        APP_CONFIG.serviceId,
        APP_CONFIG.templateId,
        templateParams,
        APP_CONFIG.publicKey
      );
      
      console.log("=== EMAIL WYSŁANY PRZEZ EMAILJS ===");
      setSubmitStatus('success');
      setFormState({
        senderName: '', senderEmail: '', location: '', category: '',
        urgency: UrgencyLevel.NORMAL, description: '', photos: []
      });
    } catch (error) {
      console.error('FAILED...', error);
      alert("Błąd wysyłania: Sprawdź konfigurację EmailJS w pliku config.ts");
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
          Administrator otrzymał powiadomienie. Dziękujemy.
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
          {/* Dane osobowe */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nadawca</label>
              <input type="text" value={formState.senderName} onChange={e => setFormState(prev => ({ ...prev, senderName: e.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2" placeholder="Jan Kowalski" />
              {errors.senderName && <p className="text-red-500 text-xs">{errors.senderName}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" value={formState.senderEmail} onChange={e => setFormState(prev => ({ ...prev, senderEmail: e.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2" placeholder="email@przyklad.pl" />
              {errors.senderEmail && <p className="text-red-500 text-xs">{errors.senderEmail}</p>}
            </div>
          </div>

          {/* Lokalizacja i Kategoria */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Miejsce</label>
              <input type="text" value={formState.location} onChange={e => setFormState(prev => ({ ...prev, location: e.target.value }))} className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2" placeholder="np. Klatka B" />
              {errors.location && <p className="text-red-500 text-xs">{errors.location}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategoria</label>
              <select value={formState.category} onChange={e => setFormState(prev => ({ ...prev, category: e.target.value as IssueCategory }))} className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2">
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
                  <input type="radio" name="urgency" value={level} checked={formState.urgency === level} onChange={() => setFormState(prev => ({ ...prev, urgency: level }))} className="hidden" />
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
            <textarea value={formState.description} onChange={e => setFormState(prev => ({ ...prev, description: e.target.value }))} rows={5} className="w-full rounded-lg border border-slate-300 bg-white text-slate-900 px-3 py-2" />
            {errors.description && <p className="text-red-500 text-xs">{errors.description}</p>}
          </div>

          {/* Zdjęcia */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Zdjęcia (maks. 2)</label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => fileInputRef.current?.click()}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/png, image/jpeg" multiple className="hidden" />
              <Upload className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm mt-2 text-slate-600">Kliknij by dodać (max 2MB)</p>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4">
              {formState.photos.map((file, i) => (
                <div key={i} className="relative aspect-video bg-slate-100 rounded border flex items-center justify-center">
                  <img src={URL.createObjectURL(file)} alt="" className="h-full object-contain" />
                  <button type="button" onClick={(e) => {e.stopPropagation(); removePhoto(i)}} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"><X className="w-3 h-3"/></button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors">
            {isSubmitting ? <Loader2 className="animate-spin" /> : <Send />} Wyślij zgłoszenie
          </button>
        </form>
      </div>
    </div>
  );
};