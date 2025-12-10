export enum UrgencyLevel {
  NORMAL = 'Normalna',
  URGENT = 'Pilna',
  EMERGENCY = 'Awaryjna'
}

export enum IssueCategory {
  ELECTRIC = 'Instalacja elektryczna',
  PLUMBING = 'Instalacja wodno-kanalizacyjna',
  HVAC = 'Instalacja grzewcza/klimatyzacja',
  WINDOWS_DOORS = 'Okna i drzwi',
  WALLS_CEILINGS = 'Ściany i sufity (pęknięcia, wilgoć)',
  FLOORS = 'Podłogi',
  SANITARY = 'Instalacje sanitarne (łazienka, WC)',
  INTERCOM = 'Domofon/dzwonek',
  LOCKS = 'Zamki i klamki',
  LIGHTING = 'Oświetlenie wspólne',
  OTHER = 'Inne'
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