import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, CheckCircle, Upload, X, 
  Wrench, Link as LinkIcon, Loader2, AlertTriangle
} from 'lucide-react';
import emailjs from '@emailjs/browser';
import { IssueFormState, IssueCategory, UrgencyLevel, ValidationErrors } from '../types';
import { APP_CONFIG } from '../config';

// Limit rozmiaru przed wysłaniem na ImgBB (dla wydajności) - 5MB
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024; 

// Oficjalny mail produkcyjny do porównania
const PRODUCTION_EMAIL = 'administrator5@zarzadca.wroclaw.pl';

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

  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string>('');
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
    console.log("Tryb developerski:", isDevMode);
    console.log("Docelowy email w kodzie (to_email):", APP_CONFIG.receiverEmail);
    console.log("Czy klucz ImgBB jest ustawiony?", !!APP_CONFIG.imgbbApiKey);
    if (isDevMode) {
        console.warn("UWAGA: Maile będą wysyłane na adres testowy, a nie do zarządcy!");
    } else {
        console.log("OK: Tryb produkcyjny aktywny. Maile idą do zarządcy.");
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

    if (formState.photos.length > 0 && (!APP_CONFIG.imgbbApiKey || APP_CONFIG.imgbbApiKey === 'YOUR_IMGBB_API_KEY_HERE')) {
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
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_UPLOAD_SIZE) {
        alert("Plik jest za duży (max 5MB)");
        return;
    }

    setIsUploading(true);
    try {
        setFormState(prev => ({ ...prev, photos: [file] }));

        if (!APP_CONFIG.imgbbApiKey || APP_CONFIG.imgbbApiKey.includes('YOUR_IMGBB')) {
            throw new Error("Brak klucza API ImgBB w konfiguracji.");
        }

        const url = await uploadToImgBB(file);
        setUploadedPhotoUrl(url);
        console.log("Zdjęcie wgrane:", url);

    } catch (err: any) {
        console.error("Upload error:", err);
        alert(`Nie udało się wgrać zdjęcia: ${err.message}`);
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
    
    // --- OCHRONA ANTYSPAMOWA (HONEYPOT) ---
    // Jeśli pole pułapki jest wypełnione, udajemy sukces, ale nic nie wysyłamy.
    if (honeyPot) {
      console.log("Bot detected. Silently ignoring.");
      setSubmitStatus('success'); 
      return;
    }
    // --------------------------------------

    if (!validate()) return;
    if (!formRef.current) return;

    if (isUploading) {
        alert("Poczekaj na zakończenie wysyłania zdjęcia.");
        return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      await emailjs.sendForm(
        APP_CONFIG.serviceId,
        APP_CONFIG.templateId,
        formRef.current,
        APP_CONFIG.publicKey
      );
      
      console.log("=== SUKCES EMAILJS ===");
      setSubmitStatus('success');
      
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
        <h2 className="text-2xl font-bold text-slate-90