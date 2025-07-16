import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { config } from '../src/config/config';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Nettoyer la base de données
  console.log('🧹 Nettoyage de la base de données...');
  await prisma.auditLogs.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreferences.deleteMany();
  await prisma.report.deleteMany();
  await prisma.factureLigne.deleteMany();
  await prisma.facture.deleteMany();
  await prisma.devisLigne.deleteMany();
  await prisma.devis.deleteMany();
  await prisma.technicienIntervention.deleteMany();
  await prisma.intervention.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.technicien.deleteMany();
  await prisma.specialite.deleteMany();
  await prisma.client.deleteMany();
  await prisma.utilisateur.deleteMany();
  await prisma.role.deleteMany();

  // Créer les rôles
  console.log('👑 Création des rôles...');
  const roles = await Promise.all([
    prisma.role.create({ data: { libelle: 'admin', description: 'Administrateur avec tous les droits' } }),
    prisma.role.create({ data: { libelle: 'user', description: 'Utilisateur standard' } }),
    prisma.role.create({ data: { libelle: 'manager', description: 'Gestionnaire avec droits de supervision' } }),
    prisma.role.create({ data: { libelle: 'technicien', description: 'Technicien avec droits d\'intervention' } }),
  ]);

  // Créer les utilisateurs
  console.log('👤 Création des utilisateurs...');
  const passwords = {
    admin: await bcrypt.hash('Kwt010100++@', config.security.bcryptRounds),
    user: await bcrypt.hash('user123', config.security.bcryptRounds),
    technicien: await bcrypt.hash('technicien123', config.security.bcryptRounds),
  };

  const emails = [
    { nom: 'Admin', prenom: 'System', email: 'admin@progiteck.com', roleId: roles[0].id },
    { nom: 'kabre', prenom: 'theodore', email: 'theogeoffroy5@gmail.com', roleId: roles[1].id },
    { nom: 'kabre', prenom: 'theodore', email: 'technicien@progiteck.com', roleId: roles[3].id }, // Utilisez un email unique
  ];

  const users = [];

  for (const user of emails) {
    const existingUser = await prisma.utilisateur.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      const newUser = await prisma.utilisateur.create({
        data: {
          nom: user.nom,
          prenom: user.prenom,
          email: user.email,
          motDePasse: passwords[user.roleId === roles[0].id ? 'admin' : user.roleId === roles[1].id ? 'user' : 'technicien'],
          phone: '+225 07 00 00 00 00', // Ajustez les numéros de téléphone si nécessaire
          roleId: user.roleId,
          status: 'active',
          emailStatus: 'verified',
        },
      });
      users.push(newUser);
    } else {
      console.log(`Utilisateur avec l'email ${user.email} existe déjà, saut de la création.`);
      users.push(existingUser);
    }
  }

  const [admin, user, technicien] = users;

  // Continuez avec le reste de votre script...

  // Créer les spécialités
  console.log('🔧 Création des spécialités...');
  const specialites = await Promise.all([
    prisma.specialite.create({
      data: {
        libelle: 'Réseau',
        description: 'Spécialiste en infrastructure réseau',
      },
    }),
    prisma.specialite.create({
      data: {
        libelle: 'développeur web',
        description: 'Développement d\'applications web',
      },
    }),
    prisma.specialite.create({
      data: {
        libelle: 'Hardware',
        description: 'Maintenance et réparation matérielle',
      },
    }),
    prisma.specialite.create({
      data: {
        libelle: 'DevOps',
        description: 'Déploiement et infrastructure',
      },
    }),
    prisma.specialite.create({
      data: {
        libelle: 'Software',
        description: 'Développement logiciel',
      },
    }),
  ]);

  // Créer les techniciens
  console.log('👨‍🔧 Création des techniciens...');
  const techniciens = await Promise.all([
    prisma.technicien.create({
      data: {
        nom: 'Konan',
        prenom: 'Yane',
        contact: '+225 06 12 34 56 78',
        specialiteId: specialites[0].id, // Réseau
      },
    }),
    prisma.technicien.create({
      data: {
        nom: 'Theodore',
        prenom: 'Kabres',
        contact: '+225 07 57 39 01 57',
        specialiteId: specialites[1].id, // développeur web
      },
    }),
    prisma.technicien.create({
      data: {
        nom: 'KOUASSI',
        prenom: 'BEIBRO',
        contact: '+225 07 00 22 18 60',
        specialiteId: specialites[2].id, // Hardware
      },
    }),
  ]);

  // Créer les clients
  console.log('🏢 Création des clients...');
  const clients = await Promise.all([
    prisma.client.create({
      data: {
        nom: 'INFAS',
        email: 'contact@infas.ci',
        telephone: '+225 27 22 48 61 22',
        entreprise: 'Institut National de Formation des Agents de Santé',
        typeDeCart: 'Premium',
        statut: 'active',
        localisation: 'Abidjan, Côte d\'Ivoire',
      },
    }),
    prisma.client.create({
      data: {
        nom: 'DataSys Industries',
        email: 'info@datasys.ci',
        telephone: '+225 27 22 50 30 40',
        entreprise: 'DataSys Industries',
        typeDeCart: 'Standard',
        statut: 'active',
        localisation: 'Abidjan, Côte d\'Ivoire',
      },
    }),
    prisma.client.create({
      data: {
        nom: 'InnovateTech',
        email: 'contact@innovatetech.ci',
        telephone: '+225 07 07 07 07 07',
        entreprise: 'InnovateTech Solutions',
        typeDeCart: 'VIP',
        statut: 'active',
        localisation: 'Abidjan, Côte d\'Ivoire',
      },
    }),
  ]);

  // Créer les missions
  console.log('📋 Création des missions...');
  const missions = await Promise.all([
    prisma.mission.create({
      data: {
        natureIntervention: 'Maintenance réseau',
        objectifDuContrat: 'Assurer le bon fonctionnement du réseau',
        description: 'Maintenance préventive du réseau informatique',
        dateSortieFicheIntervention: new Date('2024-01-15'),
        clientId: clients[0].id, // INFAS
      },
    }),
    prisma.mission.create({
      data: {
        natureIntervention: 'Installation serveur',
        objectifDuContrat: 'Mise en place d\'un nouveau serveur',
        description: 'Installation et configuration d\'un nouveau serveur',
        dateSortieFicheIntervention: new Date('2024-01-18'),
        clientId: clients[1].id, // DataSys Industries
      },
    }),
    prisma.mission.create({
      data: {
        natureIntervention: 'Audit développeur web',
        objectifDuContrat: 'Évaluer l\'infrastructure informatique',
        description: 'Audit complet de la développeur web informatique',
        dateSortieFicheIntervention: new Date('2024-01-20'),
        clientId: clients[2].id, // InnovateTech
      },
    }),
  ]);

  // Créer les interventions
  console.log('🛠️ Création des interventions...');
  const interventions = await Promise.all([
    prisma.intervention.create({
      data: {
        dateHeureDebut: new Date('2024-01-15T10:00:00Z'),
        dateHeureFin: new Date('2024-01-15T13:30:00Z'),
        duree: 210, // 3h30
        missionId: missions[0].numIntervention,
        technicienInterventions: {
          create: {
            technicienId: techniciens[0].id,
            role: 'principal'
          }
        }
      },
    }),
    prisma.intervention.create({
      data: {
        dateHeureDebut: new Date('2024-01-16T15:00:00Z'),
        missionId: missions[1].numIntervention,
        technicienInterventions: {
          create: {
            technicienId: techniciens[1].id,
            role: 'principal'
          }
        }
      },
    }),
    prisma.intervention.create({
      data: {
        dateHeureDebut: new Date('2024-01-18T11:00:00Z'),
        missionId: missions[2].numIntervention,
        technicienInterventions: {
          create: {
            technicienId: techniciens[2].id,
            role: 'principal'
          }
        }
      },
    }),
  ]);

  // Créer un devis
  console.log('📝 Création d\'un devis...');
  const devis = await prisma.devis.create({
    data: {
      numero: 'DEV-2024-0001',
      clientId: clients[0].id,
      missionId: missions[0].numIntervention,
      titre: 'Maintenance réseau annuelle',
      description: 'Contrat de maintenance réseau pour l\'année 2024',
      montantHT: 1500000,
      tauxTVA: 18,
      montantTTC: 1770000,
      statut: 'brouillon',
      dateCreation: new Date(),
      dateValidite: new Date('2024-02-15'),
      lignes: {
        create: [
          {
            designation: 'Maintenance préventive trimestrielle',
            quantite: 4,
            prixUnitaire: 250000,
            montantHT: 1000000,
            ordre: 1,
          },
          {
            designation: 'Intervention d\'urgence',
            quantite: 5,
            prixUnitaire: 100000,
            montantHT: 500000,
            ordre: 2,
          },
        ],
      },
    },
  });

  // Créer des notifications
  console.log('🔔 Création des notifications...');
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'info',
        message: 'Bienvenue sur Progitek System',
        createdAt: new Date(),
      },
    }),
    prisma.notification.create({
      data: {
        userId: user.id,
        type: 'info',
        message: 'Bienvenue sur Progitek System',
        createdAt: new Date(),
      },
    }),
    prisma.notification.create({
      data: {
        userId: admin.id,
        type: 'warning',
        message: 'Nouvelle mission assignée #1003',
        data: JSON.stringify({ missionId: missions[2].numIntervention }),
        createdAt: new Date(),
      },
    }),
  ]);

  // Créer des préférences de notification
  console.log('⚙️ Création des préférences de notification...');
  await Promise.all([
    prisma.notificationPreferences.create({
      data: {
        userId: admin.id,
        checkUnusualActivity: true,
        checkNewSignIn: true,
        notifyLatestNews: true,
        notifyFeatureUpdate: true,
        notifyAccountTips: false,
      },
    }),
    prisma.notificationPreferences.create({
      data: {
        userId: user.id,
        checkUnusualActivity: true,
        checkNewSignIn: true,
        notifyLatestNews: false,
        notifyFeatureUpdate: false,
        notifyAccountTips: false,
      },
    }),
  ]);

  // Créer des logs d'audit
  console.log('📝 Création des logs d\'audit...');
  await Promise.all([
    prisma.auditLogs.create({
      data: {
        userId: admin.id,
        actionType: 'LOGIN',
        entityType: 'USER',
        details: 'Connexion réussie',
        ipAddress: '192.168.1.100',
        timestamp: new Date(),
      },
    }),
    prisma.auditLogs.create({
      data: {
        userId: admin.id,
        actionType: 'CREATE',
        entityType: 'CLIENT',
        entityId: clients[0].id,
        details: `Client ${clients[0].nom} créé`,
        ipAddress: '192.168.1.100',
        timestamp: new Date(),
      },
    }),
    prisma.auditLogs.create({
      data: {
        userId: admin.id,
        actionType: 'CREATE',
        entityType: 'MISSION',
        entityId: missions[0].numIntervention,
        details: `Mission ${missions[0].natureIntervention} créée`,
        ipAddress: '192.168.1.100',
        timestamp: new Date(),
      },
    }),
  ]);

  console.log('✅ Seeding terminé avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });