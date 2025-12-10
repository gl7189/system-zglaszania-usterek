export enum UrgencyLevel {
  NORMAL = 'Normalna',
  URGENT = 'Pilna',
  EMERGENCY = 'Awaryjna'
}

export enum IssueCategory {
  ELECTRIC = 'Instalacja elektryczna (brak prądu, awaria)',
  PLUMBING = 'Wodno-kanalizacyjna (wycieki, zatory)',
  HVAC = 'Ogrzewanie i Wentylacja',
  ELEVATOR = 'Winda',
  GATE_GARAGE = 'Brama wjazdowa / Garażowa',
  WINDOWS_DOORS = 'Stolarka (Okna i Drzwi)',
  WALLS_CEILINGS = 'Konstrukcja (Ściany, Sufity, Elewacja)',
  ROOF = 'Dach i Rynny',
  CLEANING = 'Czystość i Porządek',
  INTERCOM = 'Domofon i Kontrola dostępu',
  LIGHTING = 'Oświetlenie części wspólnych',
  OTHER = 'Inne zgłoszenie'
}

export interface EmailConfig {
  senderEmail: string;
  appPassword: string;
  receiverEmail: string;
}

export interface IssueFormState {
  senderName: string;
  senderEmail: string;
  location: string;
  category: IssueCategory | '';
  urgency: UrgencyLevel;
  description: string;
  photos: File[];
}

export interface ValidationErrors {
  senderName?: string;
  senderEmail?: string;
  location?: string;
  category?: string;
  description?: string;
  photos?: string;
  config?: string;
}