# Haushaltsplan - Familienausgaben-Tracker

Ein mobiles, deutschsprachiges Expense-Tracking-System für Familien mit automatischer Kostenaufteilung.

## Features

- 🏠 **Familienorientiert**: Vorkonfiguriert mit Jenny, Eric (Eltern) und Melina, Matheo (Kinder)
- 💰 **Intelligente Aufteilung**:
  - **Gleichmäßig (50:50)**: Kosten werden gleichmäßig zwischen Eltern aufgeteilt
  - **Gewichtet**: Aufteilung basierend auf Einkommen (Jenny: 3500€, Eric: 4500€)
  - **Zugewiesen**: Kosten für bestimmte Personen (Kinderkosten automatisch 50:50 zwischen Eltern)
- 📊 **Abrechnung**: Automatische Berechnung der Nettoschuld zwischen Jenny & Eric
- 🔄 **Wiederkehrende Ausgaben**: Automatische Erstellung von monatlichen/wöchentlichen Ausgaben
- 🌙 **Dark Mode**: Mobile-first Design mit dunklem Theme
- 📱 **Responsive**: Optimiert für mobile Geräte

## Tech Stack

- **Frontend**: Next.js 16 mit React 19, TypeScript
- **Styling**: Tailwind CSS (Dark Mode)
- **Database**: SQLite mit Prisma ORM
- **Deployment**: Docker-ready

## Installation

### Lokal

```bash
# Dependencies installieren
npm install

# Datenbank initialisieren
npm run db:push

# Seed-Daten laden (Jenny, Eric, Melina, Matheo)
npm run db:seed

# Entwicklungsserver starten
npm run dev
```

Die App läuft dann auf [http://localhost:3000](http://localhost:3000)

### Docker

```bash
# Docker Image bauen
docker build -t haushaltsplan .

# Container starten
docker run -p 3000:3000 haushaltsplan
```

Oder mit Docker Compose:

```bash
docker-compose up
```

## Verwendung

### Ausgabe hinzufügen

1. Klicken Sie auf "Neue Ausgabe hinzufügen"
2. Geben Sie Betrag und Beschreibung ein
3. Wählen Sie den Zahler (Jenny, Eric, Melina oder Matheo)
4. Wählen Sie eine Kategorie (Lebensmittel, Miete, Transport, Kinderkosten, Sonstiges)
5. Wählen Sie die Aufteilungsmethode:
   - **Gleichmäßig**: 50:50 zwischen Jenny und Eric
   - **Gewichtet**: Nach Einkommen (Jenny 43.75%, Eric 56.25%)
   - **Zugewiesen**: Für bestimmte Personen (Kinderkosten werden automatisch 50:50 aufgeteilt)

### Abrechnung anzeigen

Die Abrechnung wird automatisch berechnet und zeigt, wer wem wie viel schuldet.

### Wiederkehrende Ausgaben

Wiederkehrende Ausgaben (z.B. Miete) werden automatisch beim Laden der App verarbeitet.

## Datenbank-Schema

- **Person**: Jenny, Eric (isParent=true, mit income), Melina, Matheo (isParent=false)
- **Category**: Lebensmittel, Miete, Transport, Kinderkosten, Sonstiges
- **Expense**: Ausgaben mit Betrag, Zahler, Kategorie, Aufteilungstyp
- **ExpenseAssignment**: Automatisch berechnete Anteile pro Person
- **RecurringExpense**: Wiederkehrende Ausgaben (täglich, wöchentlich, monatlich, jährlich)

## Skripte

```bash
npm run dev          # Entwicklungsserver
npm run build        # Production Build
npm run start        # Production Server
npm run db:push      # Datenbank-Schema aktualisieren
npm run db:seed      # Seed-Daten laden
```

## Lizenz

ISC
