# Roadmapa Projektu: Wersja 2.0.0 (System Ticketowy)

Ten dokument opisuje planowaną architekturę przyszłej wersji aplikacji, która przekształci prosty formularz kontaktowy w pełnoprawny system Helpdesk z panelem administratora i śledzeniem statusu.

## 1. Cel Zmian
Przejście z modelu "Fire & Forget" (tylko wysyłka maila) na model "Ticketing System" (baza danych, historia, statusy), przy zachowaniu zerowych kosztów utrzymania.

## 2. Architektura Techniczna

### Stack Technologiczny
*   **Frontend:** React + Vite (bez zmian).
*   **Hosting:** Vercel (bez zmian).
*   **Baza Danych:** Supabase (PostgreSQL) - Plan Darmowy.
*   **Auth:** Supabase Auth (dla Administratora).
*   **Storage Plików:** ImgBB (bez zmian) - dla optymalizacji kosztów Supabase.
*   **Powiadomienia:** EmailJS (bez zmian).

### Dlaczego Supabase + ImgBB?
Darmowy plan Supabase daje 500MB na bazę danych, ale tylko 1GB na pliki.
*   Zdjęcia trzymamy na ImgBB.
*   W bazie zapisujemy tylko linki (tekst).
*   Dzięki temu w darmowej bazie zmieścimy miliony zgłoszeń.

## 3. Model Danych (Schema)

Tabela `tickets`:

| Kolumna | Typ | Opis |
| --- | --- | --- |
| `id` | UUID | Klucz główny (losowy ciąg znaków, trudny do zgadnięcia). |
| `created_at` | TIMESTAMPTZ | Data utworzenia (default: now()). |
| `status` | TEXT | Enum: 'NEW', 'IN_PROGRESS', 'DONE', 'REJECTED'. |
| `sender_info` | JSONB | { name, email, location, phone }. |
| `category` | TEXT | Kategoria usterki. |
| `description` | TEXT | Opis problemu. |
| `photos` | TEXT[] | Tablica linków do ImgBB (np. `['url1', 'url2']`). |
| `admin_notes` | TEXT | Notatki wewnętrzne zarządcy (niewidoczne dla mieszkańca). |

## 4. Workflow (Przepływ Danych)

### Krok 1: Mieszkaniec (Zgłoszenie)
1.  Wypełnia formularz.
2.  Zdjęcia lecą do ImgBB -> wracają URL-e.
3.  Aplikacja tworzy rekord w Supabase `tickets`.
4.  Dostaje zwrotne `id` (UUID).
5.  EmailJS wysyła powiadomienie do Zarządcy z linkiem do panelu admina: `/admin/ticket/{uuid}`.
6.  Mieszkaniec widzi link do śledzenia: `/status/{uuid}`.

### Krok 2: Administrator (Obsługa)
1.  Wchodzi na `/admin`.
2.  Loguje się (Supabase Auth).
3.  Widzi listę zgłoszeń.
4.  Zmienia status (np. na "W TOKU").

### Krok 3: Mieszkaniec (Status)
1.  Wchodzi na link `/status/{uuid}`.
2.  Widzi aktualny status i ewentualny komentarz publiczny.

## 5. Bezpieczeństwo (Row Level Security - RLS)

Zabezpieczenia na poziomie bazy danych (Supabase):

1.  **INSERT (Dodawanie):** Publiczne. Każdy może dodać zgłoszenie (anonimowo).
2.  **SELECT (Podgląd statusu):** Publiczne, ale ograniczone do konkretnego ID. Użytkownik nie może wylistować wszystkich zgłoszeń ("zobacz swoje, jeśli znasz ID").
3.  **ALL (Admin):** Pełny dostęp tylko dla uwierzytelnionego użytkownika (email administratora).

## 6. Etapy Wdrożenia

1.  Utworzenie projektu na Supabase.
2.  Instalacja `npm install @supabase/supabase-js`.
3.  Stworzenie tabeli i polityk bezpieczeństwa (RLS).
4.  Nowe widoki w React:
    *   `/admin` (Logowanie + Dashboard).
    *   `/status/:id` (Widok dla mieszkańca).
5.  Aktualizacja `IssueForm.tsx` (zapis do bazy przed wysłaniem maila).
