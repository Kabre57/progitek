import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding de la base de données...');

  // Créer les rôles
  console.log('📝 Création des rôles...');
  const adminRole = await prisma.role.upsert({
    where: { libelle: 'Administrator' },
    update: {},
    create: {
      libelle: 'Administrator',
      description: 'Administrateur système avec tous les droits'
    }
  });

  const technicianRole = await prisma.role.upsert({
    where: { libelle: 'Technician' },
    update: {},
    create: {
      libelle: 'Technician',
      description: 'Technicien pouvant gérer les interventions'
    }
  });

  const clientRole = await prisma.role.upsert({
    where: { libelle: 'Client' },
    update: {},
    create: {
      libelle: 'Client',
      description: 'Client pouvant consulter ses missions'
    }
  });

  // Créer les spécialités
  console.log('🔧 Création des spécialités...');
  const specialites = [
    { libelle: 'Réseau', description: 'Spécialiste en infrastructure réseau' },
    { libelle: 'Sécurité', description: 'Spécialiste en sécurité informatique' },
    { libelle: 'Hardware', description: 'Spécialiste en matériel informatique' },
    { libelle: 'Cloud', description: 'Spécialiste en solutions cloud' },
    { libelle: 'Software', description: 'Spécialiste en développement logiciel' }
  ];

  for (const spec of specialites) {
    await prisma.specialite.upsert({
      where: { libelle: spec.libelle },
      update: {},
      create: spec
    });
  }

  // Créer les utilisateurs par défaut
  console.log('👥 Création des utilisateurs par défaut...');
  
  // Hasher les mots de passe
  const adminPassword = await bcrypt.hash('admin123', 12);
  const techPassword = await bcrypt.hash('tech123', 12);

  const adminUser = await prisma.utilisateur.upsert({
    where: { email: 'admin@progitek.com' },
    update: {},
    create: {
      nom: 'Admin',
      prenom: 'System',
      email: 'admin@progitek.com',
      motDePasse: adminPassword,
      roleId: adminRole.id,
      status: 'active',
      phone: '+33 1 00 00 00 00'
    }
  });

  const techUser = await prisma.utilisateur.upsert({
    where: { email: 'technicien@progitek.com' },
    update: {},
    create: {
      nom: 'Technicien',
      prenom: 'Demo',
      email: 'technicien@progitek.com',
      motDePasse: techPassword,
      roleId: technicianRole.id,
      status: 'active',
      phone: '+33 1 11 11 11 11'
    }
  });

  // Créer des clients de démonstration
  console.log('🏢 Création des clients de démonstration...');
  const clients = [
    {
      nom: 'TechCorp Solutions',
      email: 'contact@techcorp.com',
      telephone: '+33 1 23 45 67 89',
      entreprise: 'TechCorp Solutions',
      typeDeCarte: 'Premium',
      statut: 'active',
      localisation: 'Paris, France'
    },
    {
      nom: 'DataSys Industries',
      email: 'info@datasys.fr',
      telephone: '+33 1 98 76 54 32',
      entreprise: 'DataSys Industries',
      typeDeCarte: 'Standard',
      statut: 'active',
      localisation: 'Lyon, France'
    },
    {
      nom: 'InnovateTech',
      email: 'hello@innovatetech.com',
      telephone: '+33 1 11 22 33 44',
      entreprise: 'InnovateTech',
      typeDeCarte: 'Enterprise',
      statut: 'pending',
      localisation: 'Marseille, France'
    }
  ];

  const createdClients = [];
  for (const client of clients) {
    const createdClient = await prisma.client.upsert({
      where: { email: client.email },
      update: {},
      create: client
    });
    createdClients.push(createdClient);
  }

  // Créer des techniciens de démonstration
  console.log('👨‍🔧 Création des techniciens de démonstration...');
  const techniciens = [
    {
      nom: 'Martin',
      prenom: 'Jean',
      contact: '+33 6 12 34 56 78',
      specialiteId: 1 // Réseau
    },
    {
      nom: 'Dubois',
      prenom: 'Marie',
      contact: '+33 6 98 76 54 32',
      specialiteId: 2 // Sécurité
    },
    {
      nom: 'Leroy',
      prenom: 'Pierre',
      contact: '+33 6 11 22 33 44',
      specialiteId: 3 // Hardware
    }
  ];

  const createdTechniciens = [];
  for (const tech of techniciens) {
    const createdTech = await prisma.technicien.upsert({
      where: { 
        id: await prisma.technicien.findFirst({ 
          where: { nom: tech.nom, prenom: tech.prenom } 
        }).then(t => t?.id || -1) 
      },
      update: {},
      create: tech
    });
    createdTechniciens.push(createdTech);
  }

  // Créer des missions de démonstration
  console.log('📋 Création des missions de démonstration...');
  const missions = [
    {
      natureIntervention: 'Maintenance réseau',
      objectifDuContrat: 'Maintenance préventive du réseau informatique',
      description: 'Vérification et maintenance complète de l\'infrastructure réseau, mise à jour des équipements et optimisation des performances.',
      dateSortieFicheIntervention: new Date('2024-01-15'),
      clientId: createdClients[0].id
    },
    {
      natureIntervention: 'Installation serveur',
      objectifDuContrat: 'Installation et configuration d\'un nouveau serveur',
      description: 'Installation complète d\'un serveur Dell PowerEdge, configuration du système d\'exploitation et mise en place des services de base.',
      dateSortieFicheIntervention: new Date('2024-01-18'),
      clientId: createdClients[1].id
    },
    {
      natureIntervention: 'Audit sécurité',
      objectifDuContrat: 'Audit complet de la sécurité informatique',
      description: 'Évaluation complète de la sécurité du système d\'information, test de pénétration et recommandations d\'amélioration.',
      dateSortieFicheIntervention: new Date('2024-01-20'),
      clientId: createdClients[2].id
    }
  ];

  const createdMissions = [];
  for (const mission of missions) {
    const createdMission = await prisma.mission.create({
      data: mission
    });
    createdMissions.push(createdMission);
  }

  // Créer des interventions de démonstration
  console.log('🔧 Création des interventions de démonstration...');
  const interventions = [
    {
      dateHeureDebut: new Date('2024-01-15T09:00:00Z'),
      dateHeureFin: new Date('2024-01-15T12:30:00Z'),
      duree: 3.5,
      missionId: createdMissions[0].numIntervention,
      technicienId: createdTechniciens[0].id
    },
    {
      dateHeureDebut: new Date('2024-01-16T14:00:00Z'),
      dateHeureFin: null,
      duree: null,
      missionId: createdMissions[1].numIntervention,
      technicienId: createdTechniciens[1].id
    },
    {
      dateHeureDebut: new Date('2024-01-18T10:00:00Z'),
      dateHeureFin: null,
      duree: null,
      missionId: createdMissions[2].numIntervention,
      technicienId: createdTechniciens[2].id
    }
  ];

  for (const intervention of interventions) {
    await prisma.intervention.create({
      data: intervention
    });
  }

  // Créer des notifications de démonstration
  console.log('🔔 Création des notifications de démonstration...');
  const notifications = [
    {
      userId: adminUser.id,
      type: 'info',
      message: 'Bienvenue sur ProgiTek ! Découvrez les fonctionnalités du système.',
      data: { action: 'welcome' },
      readAt: null
    },
    {
      userId: techUser.id,
      type: 'info',
      message: 'Nouvelle mission assignée: Maintenance réseau chez TechCorp',
      data: { missionId: createdMissions[0].numIntervention },
      readAt: null
    },
    {
      userId: techUser.id,
      type: 'success',
      message: 'Intervention terminée avec succès pour DataSys Industries',
      data: { interventionId: 1 },
      readAt: new Date()
    }
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification
    });
  }

  // Créer des préférences de notification
  console.log('⚙️ Création des préférences de notification...');
  await prisma.notificationPreferences.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      checkUnusualActivity: true,
      checkNewSignIn: true,
      notifyLatestNews: true,
      notifyFeatureUpdate: true,
      notifyAccountTips: true
    }
  });

  await prisma.notificationPreferences.upsert({
    where: { userId: techUser.id },
    update: {},
    create: {
      userId: techUser.id,
      checkUnusualActivity: true,
      checkNewSignIn: false,
      notifyLatestNews: true,
      notifyFeatureUpdate: false,
      notifyAccountTips: true
    }
  });

  console.log('✅ Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur pendant le seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });