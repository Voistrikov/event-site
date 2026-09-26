import { prisma } from '../src/config/prisma.js';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';

dotenv.config({ path: path.join(process.cwd(), '.env') });
dotenv.config({ path: path.join(process.cwd(), '../.env') });

const eventCategories = [
  'Music', 'Sports', 'Theater', 'Conference', 'Seminar', 'Workshop',
  'Festival', 'Exhibition', 'Live Performance', 'Comedy', 'Cultural',
  'Networking', 'Education', 'Charity',
];

const events = [
  {
    id: 'event-contemporary-music', title: 'Συναυλία Σύγχρονης Μουσικής', eventType: 'CONCERT', venue: 'Θέατρο Πόλης', address: 'Λεωφόρος Κεντρική 25', city: 'Αθήνα', country: 'Greece', latitude: 37.9838, longitude: 23.7275,
    startDateTime: new Date('2026-12-12T20:30:00'), endDateTime: new Date('2026-12-12T23:00:00'), capacity: 350,
    description: 'Βραδιά με έργα σύγχρονων δημιουργών και καλεσμένους μουσικούς.',
    ticketTypes: [
      { id: 'ticket-contemporary-music-general', name: 'General Admission', price: 18, quantity: 250, available: 250 },
      { id: 'ticket-contemporary-music-student', name: 'Student', price: 12, quantity: 100, available: 100 },
    ], categories: ['Music', 'Live Performance'],
  },
  {
    id: 'event-ai-conference', title: 'Ημερίδα Τεχνητής Νοημοσύνης', eventType: 'CONFERENCE', venue: 'Εθνικό Μετσόβιο Πολυτεχνείο', address: 'Ηρώων Πολυτεχνείου 9', city: 'Αθήνα', country: 'Greece', latitude: 37.9784, longitude: 23.783,
    startDateTime: new Date('2026-11-15T09:00:00'), endDateTime: new Date('2026-11-15T18:00:00'), capacity: 200,
    description: 'Ημερίδα για τις τελευταίες εξελίξεις στην τεχνητή νοημοσύνη.',
    ticketTypes: [
      { id: 'ticket-ai-conference-standard', name: 'Standard', price: 25, quantity: 150, available: 150 },
      { id: 'ticket-ai-conference-vip', name: 'VIP', price: 50, quantity: 50, available: 50 },
    ], categories: ['Conference', 'Education'],
  },
  {
    id: 'event-antigone', title: 'Θεατρική Παράσταση: Αντιγόνη', eventType: 'THEATER', venue: 'Θέατρο Ηρώδου Αττικού', address: 'Διονυσίου Αρεοπαγίτου', city: 'Αθήνα', country: 'Greece', latitude: 37.9708, longitude: 23.7243,
    startDateTime: new Date('2026-10-20T21:00:00'), endDateTime: new Date('2026-10-20T23:30:00'), capacity: 500,
    description: 'Η κλασική τραγωδία του Σοφοκλή σε σύγχρονη σκηνοθεσία.',
    ticketTypes: [
      { id: 'ticket-antigone-regular', name: 'Κανονικό', price: 30, quantity: 300, available: 300 },
      { id: 'ticket-antigone-student', name: 'Φοιτητικό', price: 15, quantity: 100, available: 100 },
      { id: 'ticket-antigone-vip', name: 'VIP', price: 60, quantity: 100, available: 100 },
    ], categories: ['Theater', 'Cultural'],
  },
  {
    id: 'event-rock-under-sky', title: 'Rock Under the Sky', eventType: 'CONCERT', venue: 'Στάδιο Ειρήνης και Φιλίας', address: 'Εθνάρχου Μακαρίου 1', city: 'Πειραιάς', country: 'Greece', latitude: 37.9364, longitude: 23.6467,
    startDateTime: new Date('2026-10-05T20:00:00'), endDateTime: new Date('2026-10-05T23:30:00'), capacity: 3000,
    description: 'Μεγάλη υπαίθρια συναυλία με τα καλύτερα ελληνικά και διεθνή rock συγκροτήματα.',
    ticketTypes: [
      { id: 'ticket-rock-general', name: 'Γενική Είσοδος', price: 25, quantity: 2200, available: 2200 },
      { id: 'ticket-rock-vip', name: 'VIP', price: 60, quantity: 800, available: 800 },
    ], categories: ['Music', 'Live Performance'],
  },
  {
    id: 'event-standup-comedy', title: 'Βραδιά Stand-up Comedy', eventType: 'OTHER', venue: 'Comedy Club Αθήνα', address: 'Ερμού 45', city: 'Αθήνα', country: 'Greece', latitude: 37.9755, longitude: 23.7348,
    startDateTime: new Date('2026-10-10T21:00:00'), endDateTime: new Date('2026-10-10T23:00:00'), capacity: 150,
    description: 'Μια βραδιά γεμάτη γέλιο με τους καλύτερους stand-up κωμικούς της Αθήνας.',
    ticketTypes: [
      { id: 'ticket-comedy-regular', name: 'Κανονικό', price: 15, quantity: 150, available: 150 },
    ], categories: ['Comedy'],
  },
  {
    id: 'event-film-festival', title: 'Φεστιβάλ Κινηματογράφου Αθηνών', eventType: 'FESTIVAL', venue: 'Δημοτικός Κινηματογράφος Αθηνών', address: 'Λεωφόρος Αλεξάνδρας 12', city: 'Αθήνα', country: 'Greece', latitude: 37.9908, longitude: 23.737,
    startDateTime: new Date('2026-10-15T18:00:00'), endDateTime: new Date('2026-10-18T23:59:00'), capacity: 500,
    description: 'Τετραήμερο φεστιβάλ με προβολές ανεξάρτητου ελληνικού και διεθνούς κινηματογράφου.',
    ticketTypes: [
      { id: 'ticket-film-daily', name: 'Ημερήσιο', price: 10, quantity: 350, available: 350 },
      { id: 'ticket-film-pass', name: 'Πλήρες Πάσο', price: 35, quantity: 150, available: 150 },
    ], categories: ['Festival', 'Cultural'],
  },
  {
    id: 'event-web-seminar', title: 'Σεμινάριο Σύγχρονης Ανάπτυξης Ιστοσελίδων', eventType: 'SEMINAR', venue: 'ΟΤΕ Academy', address: 'Λεωφόρος Κηφισίας 99', city: 'Αθήνα', country: 'Greece', latitude: 38.0009, longitude: 23.7719,
    startDateTime: new Date('2026-10-22T10:00:00'), endDateTime: new Date('2026-10-22T17:00:00'), capacity: 80,
    description: 'Πρακτικό σεμινάριο για σύγχρονες τεχνολογίες ανάπτυξης web εφαρμογών.',
    ticketTypes: [
      { id: 'ticket-webseminar-standard', name: 'Στάνταρ', price: 20, quantity: 60, available: 60 },
      { id: 'ticket-webseminar-student', name: 'Φοιτητικό', price: 10, quantity: 20, available: 20 },
    ], categories: ['Seminar', 'Education', 'Workshop'],
  },
  {
    id: 'event-basketball', title: 'Αγώνας Μπάσκετ: Παναθηναϊκός - Ολυμπιακός', eventType: 'SPORTS', venue: 'OAKA', address: 'Λεωφόρος Κηφισίας 37', city: 'Μαρούσι', country: 'Greece', latitude: 38.0295, longitude: 23.7898,
    startDateTime: new Date('2026-11-01T19:00:00'), endDateTime: new Date('2026-11-01T21:30:00'), capacity: 15000,
    description: 'Το κορυφαίο ντέρμπι της ελληνικής μπασκετικής σκηνής.',
    ticketTypes: [
      { id: 'ticket-basketball-general', name: 'Γενική Είσοδος', price: 25, quantity: 12000, available: 12000 },
      { id: 'ticket-basketball-vip', name: 'VIP', price: 100, quantity: 3000, available: 3000 },
    ], categories: ['Sports'],
  },
  {
    id: 'event-modern-art', title: 'Έκθεση Σύγχρονης Τέχνης: Νέες Τάσεις', eventType: 'EXHIBITION', venue: 'Εθνική Πινακοθήκη', address: 'Λεωφόρος Βασιλέως Κωνσταντίνου 50', city: 'Αθήνα', country: 'Greece', latitude: 37.9707, longitude: 23.7517,
    startDateTime: new Date('2026-10-25T10:00:00'), endDateTime: new Date('2026-12-20T20:00:00'), capacity: 1000,
    description: 'Έκθεση έργων νέων Ελλήνων καλλιτεχνών σύγχρονης τέχνης.',
    ticketTypes: [
      { id: 'ticket-modernart-entry', name: 'Εισιτήριο', price: 8, quantity: 800, available: 800 },
      { id: 'ticket-modernart-reduced', name: 'Μειωμένο', price: 5, quantity: 200, available: 200 },
    ], categories: ['Exhibition', 'Cultural'],
  },
  {
    id: 'event-charity-gala', title: 'Φιλανθρωπικό Δείπνο Αλληλεγγύης', eventType: 'OTHER', venue: 'Ξενοδοχείο Μεγάλη Βρεταννία', address: 'Πλατεία Συντάγματος 1', city: 'Αθήνα', country: 'Greece', latitude: 37.9765, longitude: 23.7332,
    startDateTime: new Date('2026-11-20T20:00:00'), endDateTime: new Date('2026-11-20T23:59:00'), capacity: 300,
    description: 'Φιλανθρωπική εκδήλωση με στόχο την ενίσχυση κοινωνικών δομών στήριξης.',
    ticketTypes: [
      { id: 'ticket-charitygala-ticket', name: 'Εισιτήριο', price: 100, quantity: 250, available: 250 },
      { id: 'ticket-charitygala-table', name: 'VIP Τραπέζι', price: 500, quantity: 50, available: 50 },
    ], categories: ['Charity', 'Networking'],
  },
  {
    id: 'event-startup-networking', title: 'Networking Βραδιά για Startups', eventType: 'OTHER', venue: 'The Cube Athens', address: 'Λεωφόρος Κηφισίας 340', city: 'Αθήνα', country: 'Greece', latitude: 38.0209, longitude: 23.8022,
    startDateTime: new Date('2026-10-08T19:00:00'), endDateTime: new Date('2026-10-08T22:00:00'), capacity: 200,
    description: 'Βραδιά γνωριμίας και δικτύωσης για startups, επενδυτές και επαγγελματίες τεχνολογίας.',
    ticketTypes: [
      { id: 'ticket-startupnet-free', name: 'Δωρεάν Συμμετοχή', price: 0, quantity: 200, available: 200 },
    ], categories: ['Networking', 'Education'],
  },
  {
    id: 'event-jazz-festival', title: 'Φεστιβάλ Τζαζ Θεσσαλονίκης', eventType: 'FESTIVAL', venue: 'Παραλία Θεσσαλονίκης', address: 'Λεωφόρος Νίκης', city: 'Θεσσαλονίκη', country: 'Greece', latitude: 40.628, longitude: 22.949,
    startDateTime: new Date('2026-11-05T19:00:00'), endDateTime: new Date('2026-11-07T23:59:00'), capacity: 2000,
    description: 'Τριήμερο φεστιβάλ τζαζ μουσικής με Έλληνες και διεθνείς καλλιτέχνες.',
    ticketTypes: [
      { id: 'ticket-jazzfest-daily', name: 'Ημερήσιο', price: 20, quantity: 1500, available: 1500 },
      { id: 'ticket-jazzfest-pass', name: 'Πάσο 3 Ημερών', price: 50, quantity: 500, available: 500 },
    ], categories: ['Music', 'Festival', 'Live Performance'],
  },
  {
    id: 'event-photography-workshop', title: 'Εργαστήριο Φωτογραφίας: Η Τέχνη του Φωτός', eventType: 'WORKSHOP', venue: 'Φωτογραφικός Κύκλος Αθηνών', address: 'Σόλωνος 15', city: 'Αθήνα', country: 'Greece', latitude: 37.9795, longitude: 23.736,
    startDateTime: new Date('2026-10-12T10:00:00'), endDateTime: new Date('2026-10-12T16:00:00'), capacity: 30,
    description: 'Πρακτικό εργαστήριο φωτογραφίας για αρχάριους και προχωρημένους.',
    ticketTypes: [
      { id: 'ticket-photoworkshop-participation', name: 'Συμμετοχή', price: 40, quantity: 30, available: 30 },
    ], categories: ['Workshop', 'Education'],
  },
  {
    id: 'event-misanthrope', title: 'Θεατρικό Έργο: Ο Μισάνθρωπος', eventType: 'THEATER', venue: 'Εθνικό Θέατρο', address: 'Αγίου Κωνσταντίνου 22', city: 'Αθήνα', country: 'Greece', latitude: 37.9838, longitude: 23.728,
    startDateTime: new Date('2026-11-08T21:00:00'), endDateTime: new Date('2026-11-08T23:15:00'), capacity: 400,
    description: 'Το κλασικό έργο του Μολιέρου σε σύγχρονη ανάγνωση.',
    ticketTypes: [
      { id: 'ticket-misanthrope-regular', name: 'Κανονικό', price: 25, quantity: 250, available: 250 },
      { id: 'ticket-misanthrope-student', name: 'Φοιτητικό', price: 12, quantity: 100, available: 100 },
      { id: 'ticket-misanthrope-vip', name: 'VIP', price: 45, quantity: 50, available: 50 },
    ], categories: ['Theater', 'Cultural'],
  },
  {
    id: 'event-cybersecurity-conf', title: 'Συνέδριο Κυβερνοασφάλειας', eventType: 'CONFERENCE', venue: 'Ξενοδοχείο Hilton Αθηνών', address: 'Λεωφόρος Βασιλίσσης Σοφίας 46', city: 'Αθήνα', country: 'Greece', latitude: 37.9718, longitude: 23.7484,
    startDateTime: new Date('2026-11-25T09:00:00'), endDateTime: new Date('2026-11-25T18:00:00'), capacity: 250,
    description: 'Συνέδριο με ειδικούς στην κυβερνοασφάλεια και την προστασία δεδομένων.',
    ticketTypes: [
      { id: 'ticket-cybersec-standard', name: 'Στάνταρ', price: 40, quantity: 180, available: 180 },
      { id: 'ticket-cybersec-vip', name: 'VIP', price: 80, quantity: 70, available: 70 },
    ], categories: ['Conference', 'Education'],
  },
  {
    id: 'event-athens-marathon', title: 'Μαραθώνιος Αθήνας: Ο Αυθεντικός', eventType: 'SPORTS', venue: 'Αφετηρία Μαραθώνα', address: 'Πλατεία Μαραθώνα', city: 'Μαραθώνας', country: 'Greece', latitude: 38.15, longitude: 23.9667,
    startDateTime: new Date('2026-11-08T09:00:00'), endDateTime: new Date('2026-11-08T15:00:00'), capacity: 18000,
    description: 'Ο αυθεντικός Μαραθώνιος Αθήνας, ένας από τους πιο ιστορικούς αγώνες δρόμου στον κόσμο.',
    ticketTypes: [
      { id: 'ticket-marathon-5k', name: 'Συμμετοχή 5χλμ', price: 15, quantity: 8000, available: 8000 },
      { id: 'ticket-marathon-full', name: 'Συμμετοχή Μαραθώνιος', price: 40, quantity: 10000, available: 10000 },
    ], categories: ['Sports', 'Charity'],
  },
  {
    id: 'event-book-fair', title: 'Έκθεση Βιβλίου Αθηνών', eventType: 'EXHIBITION', venue: 'Ζάππειο Μέγαρο', address: 'Λεωφόρος Βασιλέως Όλγας', city: 'Αθήνα', country: 'Greece', latitude: 37.9701, longitude: 23.7364,
    startDateTime: new Date('2026-12-03T10:00:00'), endDateTime: new Date('2026-12-07T21:00:00'), capacity: 5000,
    description: 'Η μεγαλύτερη έκθεση βιβλίου της χρονιάς με εκδοτικούς οίκους από όλη την Ελλάδα.',
    ticketTypes: [
      { id: 'ticket-bookfair-entry', name: 'Είσοδος', price: 3, quantity: 4500, available: 4500 },
      { id: 'ticket-bookfair-student', name: 'Δωρεάν για Φοιτητές', price: 0, quantity: 500, available: 500 },
    ], categories: ['Exhibition', 'Education', 'Cultural'],
  },
  {
    id: 'event-jazz-night-bar', title: 'Ζωντανή Μουσική: Jazz Night', eventType: 'CONCERT', venue: 'Half Note Jazz Club', address: 'Τρίβωνος 17', city: 'Αθήνα', country: 'Greece', latitude: 37.9598, longitude: 23.7392,
    startDateTime: new Date('2026-10-17T21:30:00'), endDateTime: new Date('2026-10-17T23:59:00'), capacity: 120,
    description: 'Καθιστή jazz βραδιά με ζωντανή μουσική σε μια κλασική αθηναϊκή σκηνή.',
    ticketTypes: [
      { id: 'ticket-jazznight-entry', name: 'Είσοδος + 1 Ποτό', price: 18, quantity: 120, available: 120 },
    ], categories: ['Music', 'Live Performance'],
  },
];

// Formalizes the currently-uploaded photos of the two demo events into the
// seed so a fresh clone/DB ends up with the same images without relying on
// manual uploads through the UI. Source files live in prisma/seed-assets
// (tracked by git) and are copied into uploads/events (gitignored) at seed
// time, mirroring how the photo-upload endpoint stores files.
const eventPhotoSeeds = [
  { id: 'photo-antigone-1', eventId: 'event-antigone', file: 'antigone-1.png', isMain: true, sortOrder: 0 },
  { id: 'photo-antigone-2', eventId: 'event-antigone', file: 'antigone-2.png', isMain: false, sortOrder: 1 },
  { id: 'photo-antigone-3', eventId: 'event-antigone', file: 'antigone-3.png', isMain: false, sortOrder: 2 },
  { id: 'photo-ai-conference-1', eventId: 'event-ai-conference', file: 'ai-conference-1.png', isMain: true, sortOrder: 0 },
];

// Extra ATTENDEE test accounts (password '123', same as the other seeded
// users) purely to carry recommender interactions. The admin account is
// intentionally left out of this data: it is a platform role, not a
// shopper, so it should never influence or receive recommendations.
const attendeeUsers = [
  { username: 'customer2', firstName: 'Nikos', lastName: 'Papadopoulos', email: 'customer2@events.local', phone: '3333333333', address: 'Test Street 2', city: 'Athens', country: 'GR', taxId: '333333333', role: 'ATTENDEE' as const },
  { username: 'customer3', firstName: 'Eleni', lastName: 'Georgiou', email: 'customer3@events.local', phone: '4444444444', address: 'Test Street 3', city: 'Athens', country: 'GR', taxId: '444444444', role: 'ATTENDEE' as const },
  { username: 'customer4', firstName: 'Dimitris', lastName: 'Ioannou', email: 'customer4@events.local', phone: '5555555555', address: 'Test Street 4', city: 'Athens', country: 'GR', taxId: '555555555', role: 'ATTENDEE' as const },
  { username: 'customer5', firstName: 'Maria', lastName: 'Nikolaou', email: 'customer5@events.local', phone: '6666666666', address: 'Test Street 5', city: 'Athens', country: 'GR', taxId: '666666666', role: 'ATTENDEE' as const },
];

// Implicit-feedback seed data for the attendee test users, so the
// recommendation model has enough signal to demonstrate personalised
// results (bookings = strong feedback, views = weak feedback) as well as
// popularity-based fallback for events nobody has interacted with yet.
//
// Five personas: 'customer' (Music/Theater/Culture) and 'customer2'
// (Sports/Tech) anchor two tastes, 'customer3' and 'customer4' each bridge a
// different pair of clusters, and 'customer5' is a broad culture/misc
// browser. Each event is BOOKED by at most one persona — stacking several
// strong (rating 5) bookings from different users onto the same event was
// tried first and made item popularity dominate every user's ranking even
// harder, since that shared bias swamps the far smaller per-user factor
// signal. Cross-persona overlap instead comes entirely from VIEWS (weak,
// rating 2): every persona also views a few events the OTHER personas
// booked, which is what actually gives the model shared co-occurrence to
// learn a cross-user correlation from, without inflating any single item's
// bias into something everyone gets recommended regardless of their taste.
const bookingSeeds = [
  // customer — Music/Theater/Culture
  { id: 'booking-customer-rockundersky', username: 'customer', eventId: 'event-rock-under-sky', ticketTypeId: 'ticket-rock-general', numberOfTickets: 1, totalCost: 25 },
  { id: 'booking-customer-jazznightbar', username: 'customer', eventId: 'event-jazz-night-bar', ticketTypeId: 'ticket-jazznight-entry', numberOfTickets: 1, totalCost: 18 },
  { id: 'booking-customer-antigone', username: 'customer', eventId: 'event-antigone', ticketTypeId: 'ticket-antigone-regular', numberOfTickets: 1, totalCost: 30 },
  // customer2 — Sports/Tech
  { id: 'booking-customer2-basketball', username: 'customer2', eventId: 'event-basketball', ticketTypeId: 'ticket-basketball-general', numberOfTickets: 1, totalCost: 25 },
  { id: 'booking-customer2-marathon', username: 'customer2', eventId: 'event-athens-marathon', ticketTypeId: 'ticket-marathon-full', numberOfTickets: 1, totalCost: 40 },
  { id: 'booking-customer2-cybersecconf', username: 'customer2', eventId: 'event-cybersecurity-conf', ticketTypeId: 'ticket-cybersec-standard', numberOfTickets: 1, totalCost: 40 },
  // customer3 — bridges Music/Tech via their own taste
  { id: 'booking-customer3-jazzfestival', username: 'customer3', eventId: 'event-jazz-festival', ticketTypeId: 'ticket-jazzfest-daily', numberOfTickets: 1, totalCost: 20 },
  { id: 'booking-customer3-startupnet', username: 'customer3', eventId: 'event-startup-networking', ticketTypeId: 'ticket-startupnet-free', numberOfTickets: 1, totalCost: 0 },
  // customer4 — bridges Theater/Tech via their own taste
  { id: 'booking-customer4-misanthrope', username: 'customer4', eventId: 'event-misanthrope', ticketTypeId: 'ticket-misanthrope-regular', numberOfTickets: 1, totalCost: 25 },
  { id: 'booking-customer4-aiconference', username: 'customer4', eventId: 'event-ai-conference', ticketTypeId: 'ticket-ai-conference-standard', numberOfTickets: 1, totalCost: 25 },
  // customer5 — broad culture/misc browser
  { id: 'booking-customer5-modernart', username: 'customer5', eventId: 'event-modern-art', ticketTypeId: 'ticket-modernart-entry', numberOfTickets: 1, totalCost: 8 },
  { id: 'booking-customer5-charitygala', username: 'customer5', eventId: 'event-charity-gala', ticketTypeId: 'ticket-charitygala-ticket', numberOfTickets: 1, totalCost: 100 },
  { id: 'booking-customer5-bookfair', username: 'customer5', eventId: 'event-book-fair', ticketTypeId: 'ticket-bookfair-entry', numberOfTickets: 1, totalCost: 3 },
];

const eventViewSeeds = [
  // customer — own cluster plus a peek at events others booked
  { id: 'view-customer-jazzfestival', username: 'customer', eventId: 'event-jazz-festival' },
  { id: 'view-customer-filmfestival', username: 'customer', eventId: 'event-film-festival' },
  { id: 'view-customer-bookfair', username: 'customer', eventId: 'event-book-fair' },
  { id: 'view-customer-modernart', username: 'customer', eventId: 'event-modern-art' },
  { id: 'view-customer-misanthrope', username: 'customer', eventId: 'event-misanthrope' },
  // customer2 — own cluster plus a peek at events others booked
  { id: 'view-customer2-webseminar', username: 'customer2', eventId: 'event-web-seminar' },
  { id: 'view-customer2-aiconference', username: 'customer2', eventId: 'event-ai-conference' },
  { id: 'view-customer2-startupnet', username: 'customer2', eventId: 'event-startup-networking' },
  { id: 'view-customer2-photoworkshop', username: 'customer2', eventId: 'event-photography-workshop' },
  { id: 'view-customer2-standupcomedy', username: 'customer2', eventId: 'event-standup-comedy' },
  // customer3 — bridges by viewing into both the Music and Sports clusters
  { id: 'view-customer3-rockundersky', username: 'customer3', eventId: 'event-rock-under-sky' },
  { id: 'view-customer3-antigone', username: 'customer3', eventId: 'event-antigone' },
  { id: 'view-customer3-basketball', username: 'customer3', eventId: 'event-basketball' },
  { id: 'view-customer3-cybersecconf', username: 'customer3', eventId: 'event-cybersecurity-conf' },
  { id: 'view-customer3-standupcomedy', username: 'customer3', eventId: 'event-standup-comedy' },
  { id: 'view-customer3-charitygala', username: 'customer3', eventId: 'event-charity-gala' },
  // customer4 — bridges by viewing into both the Theater/Culture and Sports/Tech clusters
  { id: 'view-customer4-rockundersky', username: 'customer4', eventId: 'event-rock-under-sky' },
  { id: 'view-customer4-jazznightbar', username: 'customer4', eventId: 'event-jazz-night-bar' },
  { id: 'view-customer4-bookfair', username: 'customer4', eventId: 'event-book-fair' },
  { id: 'view-customer4-webseminar', username: 'customer4', eventId: 'event-web-seminar' },
  { id: 'view-customer4-basketball', username: 'customer4', eventId: 'event-basketball' },
  { id: 'view-customer4-filmfestival', username: 'customer4', eventId: 'event-film-festival' },
  // customer5 — broad browser, samples cold items plus a few from each cluster
  { id: 'view-customer5-standupcomedy', username: 'customer5', eventId: 'event-standup-comedy' },
  { id: 'view-customer5-filmfestival', username: 'customer5', eventId: 'event-film-festival' },
  { id: 'view-customer5-photoworkshop', username: 'customer5', eventId: 'event-photography-workshop' },
  { id: 'view-customer5-startupnet', username: 'customer5', eventId: 'event-startup-networking' },
  { id: 'view-customer5-marathon', username: 'customer5', eventId: 'event-athens-marathon' },
  { id: 'view-customer5-cybersecconf', username: 'customer5', eventId: 'event-cybersecurity-conf' },
  { id: 'view-customer5-antigone', username: 'customer5', eventId: 'event-antigone' },
];

async function seedEventPhotos(): Promise<void> {
  const sourceDir = path.join(process.cwd(), 'prisma', 'seed-assets', 'events');
  const targetDir = path.join(process.cwd(), 'uploads', 'events');
  await fs.mkdir(targetDir, { recursive: true });

  const photosByEvent = new Map<string, typeof eventPhotoSeeds>();
  for (const photo of eventPhotoSeeds) {
    if (!photosByEvent.has(photo.eventId)) photosByEvent.set(photo.eventId, []);
    photosByEvent.get(photo.eventId)!.push(photo);
  }

  for (const [eventId, photos] of photosByEvent) {
    await prisma.eventPhoto.deleteMany({ where: { eventId } });
    for (const photo of photos) {
      const targetFilename = `seed-${photo.file}`;
      await fs.copyFile(path.join(sourceDir, photo.file), path.join(targetDir, targetFilename));
      await prisma.eventPhoto.create({
        data: { id: photo.id, eventId: photo.eventId, filename: `/uploads/events/${targetFilename}`, isMain: photo.isMain, sortOrder: photo.sortOrder },
      });
    }
  }
}

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash('123', 12);
  const users = [
    { username: 'admin', firstName: 'System', lastName: 'Admin', email: 'admin@events.local', phone: '0000000000', address: 'N/A', city: 'N/A', country: 'GR', taxId: '000000000', role: 'ADMIN' as const },
    { username: 'organizer', firstName: 'Event', lastName: 'Organizer', email: 'organizer@events.local', phone: '2222222222', address: 'Organizer Street 1', city: 'Athens', country: 'GR', taxId: '222222222', role: 'ORGANIZER' as const },
    { username: 'customer', firstName: 'Customer', lastName: 'Test', email: 'customer@events.local', phone: '1111111111', address: 'Test Street 1', city: 'Athens', country: 'GR', taxId: '111111111', role: 'ATTENDEE' as const },
    ...attendeeUsers,
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { username: user.username },
      update: { passwordHash, role: user.role, status: 'APPROVED' },
      create: { ...user, passwordHash, status: 'APPROVED' },
    });
  }
  for (const name of eventCategories) {
    await prisma.category.upsert({ where: { name }, update: {}, create: { name } });
  }

  const organizer = await prisma.user.findUniqueOrThrow({ where: { username: 'organizer' } });
  const categoryIds = new Map((await prisma.category.findMany({ where: { name: { in: eventCategories } } })).map(({ id, name }) => [name, id]));

  for (const event of events) {
    const { ticketTypes, categories, ...eventData } = event;
    await prisma.event.upsert({
      where: { id: event.id },
      update: { ...eventData, status: 'PUBLISHED', organizerId: organizer.id },
      create: { ...eventData, status: 'PUBLISHED', organizerId: organizer.id },
    });
    for (const ticketType of ticketTypes) {
      await prisma.ticketType.upsert({
        where: { id: ticketType.id }, update: { ...ticketType, eventId: event.id }, create: { ...ticketType, eventId: event.id },
      });
    }
    await prisma.eventCategory.deleteMany({ where: { eventId: event.id } });
    await prisma.eventCategory.createMany({ data: categories.map((name) => ({ eventId: event.id, categoryId: categoryIds.get(name)! })) });
  }

  await seedEventPhotos();

  const userIdByUsername = new Map(
    (await prisma.user.findMany({ where: { username: { in: ['customer', 'customer2', 'customer3', 'customer4', 'customer5'] } } })).map(({ id, username }) => [username, id]),
  );

  for (const view of eventViewSeeds) {
    await prisma.eventView.upsert({
      where: { id: view.id },
      update: {},
      create: { id: view.id, userId: userIdByUsername.get(view.username)!, eventId: view.eventId },
    });
  }

  for (const booking of bookingSeeds) {
    await prisma.booking.upsert({
      where: { id: booking.id },
      update: {},
      create: {
        id: booking.id,
        eventId: booking.eventId,
        userId: userIdByUsername.get(booking.username)!,
        ticketTypeId: booking.ticketTypeId,
        numberOfTickets: booking.numberOfTickets,
        totalCost: booking.totalCost,
        status: 'CONFIRMED',
      },
    });
  }

  console.log('Seed complete: event users, categories, events, photos, and recommender interactions created with password 123.');
}

main()
  .catch((error: unknown) => { console.error(error); process.exit(1); })
  .finally(() => { void prisma.$disconnect(); });
