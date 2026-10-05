import 'temporal-polyfill/global'; // Ajout du polyfill Temporal
import { db, connectDB } from './db';

async function main() {
  // Connexion obligatoire en Prisma 8
  await connectDB();
  console.log('🔌 Connecté à la base, insertion des données...');

  // ===== 1. VACANCES SCOLAIRES NANTES (ZONE B) 2026-2027 =====
  await db.orm.public.Holiday.deleteAll();
  await db.orm.public.Holiday.createAll([
    { name: 'Vacances de la Toussaint', startDate: new Date('2026-10-17').toTemporalInstant(), endDate: new Date('2026-11-02').toTemporalInstant() },
    { name: 'Vacances de Noël', startDate: new Date('2026-12-19').toTemporalInstant(), endDate: new Date('2027-01-04').toTemporalInstant() },
    { name: "Vacances d'hiver", startDate: new Date('2027-02-20').toTemporalInstant(), endDate: new Date('2027-03-08').toTemporalInstant() },
    { name: 'Vacances de printemps', startDate: new Date('2027-04-17').toTemporalInstant(), endDate: new Date('2027-05-03').toTemporalInstant() },
    { name: "Vacances d'été", startDate: new Date('2027-07-03').toTemporalInstant(), endDate: new Date('2027-08-31').toTemporalInstant() },
  ]);
  console.log('✅ Vacances ajoutées');

  // ===== 2. COURS (MENU Emile 2026-2027) =====
  await db.orm.public.Course.deleteAll();
  await db.orm.public.Course.createAll([
    // LUNDI
    { title: 'ENS TECHNO TRANSVERS', dayOfWeek: 1, startTime: '08:00', endTime: '11:00', location: 'T.216 / T.218', color: '#f5c8a8' },
    { title: 'HISTOIRE-GEOGRAPHIE', dayOfWeek: 1, startTime: '13:40', endTime: '14:35', location: 'D.244', color: '#b8e0c8' },
    // MARDI
    { title: 'PHYSIQ.CHIMIE & MATHS', dayOfWeek: 2, startTime: '08:00', endTime: '10:55', location: 'D.250', color: '#e0a0d0' },
    { title: 'INNOV.TECHN.ECO-CONC', dayOfWeek: 2, startTime: '10:00', endTime: '11:50', location: 'T.015', color: '#90e090' },
    { title: 'ACCOMP PERSO & VIE CLASSE', dayOfWeek: 2, startTime: '13:40', endTime: '14:35', location: 'T.201', color: '#f0c8b0' },
    { title: 'ENS TECHNO EN LV1', dayOfWeek: 2, startTime: '14:35', endTime: '15:40', location: 'T.017', color: '#f5c8a8' },
    { title: 'PHYSIQ.CHIMIE & MATHS', dayOfWeek: 2, startTime: '15:40', endTime: '16:35', location: 'S.225', color: '#e0a0d0' },
    // MERCREDI
    { title: 'INNOV.TECHN.ECO-CONC', dayOfWeek: 3, startTime: '08:55', endTime: '11:50', location: 'T.015', color: '#90e090' },
    { title: 'PHILOSOPHIE', dayOfWeek: 3, startTime: '10:00', endTime: '11:50', location: 'D.048', color: '#e8e0d0' },
    { title: 'MATHEMATIQUES', dayOfWeek: 3, startTime: '10:00', endTime: '11:50', location: 'D.048', color: '#f0e0d0' },
    { title: 'ESPAGNOL LV2', dayOfWeek: 3, startTime: '13:40', endTime: '14:35', location: 'L.258', color: '#f0e0a0' },
    { title: 'HISTOIRE-GEO & EMC', dayOfWeek: 3, startTime: '14:35', endTime: '15:40', location: 'D.244', color: '#c8e0c0' },
    { title: 'MATHEMATIQUES', dayOfWeek: 3, startTime: '15:40', endTime: '16:35', location: 'D.140', color: '#f0e0d0' },
    { title: 'ANGLAIS LV1', dayOfWeek: 3, startTime: '16:35', endTime: '17:30', location: 'L.255', color: '#e0d0a0' },
    // JEUDI
    { title: 'INNOV.TECHN.ECO-CONC', dayOfWeek: 4, startTime: '08:00', endTime: '10:55', location: 'T.015', color: '#90e090' },
    { title: 'ESPAGNOL LV2', dayOfWeek: 4, startTime: '10:55', endTime: '11:50', location: 'L.258', color: '#f0e0a0' },
    { title: 'ENS TECHNO TRANSVERS', dayOfWeek: 4, startTime: '13:40', endTime: '14:35', location: 'T.017 / T.018', color: '#f5c8a8' },
    { title: 'PHYSIQ.CHIMIE & MATHS', dayOfWeek: 4, startTime: '14:35', endTime: '15:40', location: 'S.131', color: '#e0a0d0' },
    { title: 'MATHEMATIQUES', dayOfWeek: 4, startTime: '15:40', endTime: '16:35', location: 'D.151', color: '#f0e0d0' },
    { title: 'ANGLAIS LV1', dayOfWeek: 4, startTime: '16:35', endTime: '17:30', location: 'L.156', color: '#e0d0a0' },
    // VENDREDI
    { title: 'PHILOSOPHIE', dayOfWeek: 5, startTime: '08:00', endTime: '10:00', location: 'D.048', color: '#e8e0d0' },
    { title: 'MATHEMATIQUES', dayOfWeek: 5, startTime: '08:55', endTime: '09:50', location: 'D.144', color: '#f0e0d0' },
    { title: 'ED.PHYSIQUE & SPORT', dayOfWeek: 5, startTime: '10:00', endTime: '11:50', location: 'M3 M4', color: '#e8d060' },
    { title: 'INNOV.TECHN.ECO-CONC', dayOfWeek: 5, startTime: '13:40', endTime: '15:40', location: 'T.015', color: '#90e090' },
    { title: 'PHYSIQ.CHIMIE & MATHS', dayOfWeek: 5, startTime: '15:40', endTime: '16:35', location: 'Salles TP Phy', color: '#e0a0d0' },
  ]);
  console.log('✅ Cours ajoutés');

  // ===== 3. SPORT (programme hockey) =====
  await db.orm.public.SportSession.deleteAll();
  await db.orm.public.SportSession.createAll([
    { activity: 'Badminton loisir', dayOfWeek: 1, startTime: '18:00', endTime: '19:30', location: 'Gymnase', color: '#22c55e' },
    { activity: 'Séance 1 : Puissance bas du corps', dayOfWeek: 1, startTime: '19:45', endTime: '20:45', location: 'Maison / Haltères', color: '#ef4444' },
    { activity: 'Séance 2 : Pré-activation + Glace', dayOfWeek: 2, startTime: '18:00', endTime: '20:00', location: 'Patinoire', color: '#3b82f6' },
    { activity: 'Séance 3 : Haut du corps + Cardio-shift', dayOfWeek: 3, startTime: '18:00', endTime: '19:00', location: 'Maison / Rameur', color: '#ef4444' },
    { activity: 'Volley + Entraînement Glace', dayOfWeek: 4, startTime: '18:00', endTime: '21:00', location: 'Gymnase + Patinoire', color: '#3b82f6' },
    { activity: 'Semaine A : SuperDeker + Glace', dayOfWeek: 5, startTime: '18:00', endTime: '20:00', location: 'Patinoire', color: '#3b82f6' },
    { activity: 'Semaine B : Cardio rameur / Piscine', dayOfWeek: 5, startTime: '18:00', endTime: '18:50', location: 'Maison / Piscine', color: '#22c55e' },
    { activity: 'Séance 5 : Ateliers finition attaquant', dayOfWeek: 6, startTime: '10:00', endTime: '11:00', location: 'Patinoire', color: '#ef4444' },
    { activity: 'Masterclass finition + Bilan', dayOfWeek: 7, startTime: '10:00', endTime: '11:30', location: 'Maison / Vidéo', color: '#8b5cf6' },
  ]);
  console.log('✅ Sport ajouté');

  console.log('🎉 Base remplie avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
    process.exit(1);
  });