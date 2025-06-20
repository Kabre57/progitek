import { Options } from 'swagger-jsdoc';

export const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ProgiTek API',
      version: '1.0.0',
      description: 'API pour le système de gestion des interventions techniques ProgiTek',
      contact: {
        name: 'Équipe ProgiTek',
        email: 'support@progitek.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://api.progitek.com/api/v1'
          : `http://localhost:${process.env.PORT || 3000}/api/v1`,
        description: process.env.NODE_ENV === 'production' ? 'Serveur de production' : 'Serveur de développement'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Token JWT pour l\'authentification'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Message d\'erreur'
            },
            error: {
              type: 'string',
              example: 'Détails de l\'erreur'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              example: 'Opération réussie'
            },
            data: {
              type: 'object'
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            nom: {
              type: 'string',
              example: 'Dupont'
            },
            prenom: {
              type: 'string',
              example: 'Konan'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'Konan.dupont@progitek.com'
            },
            role_id: {
              type: 'integer',
              example: 1
            },
            created_at: {
              type: 'string',
              format: 'date-time'
            },
            updated_at: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Client: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              example: 1
            },
            nom: {
              type: 'string',
              example: 'INFAS'
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'contact@techcorp.com'
            },
            telephone: {
              type: 'string',
              example: '+225 07 07 07 07'
            },
            entreprise: {
              type: 'string',
              example: 'INFAS'
            },
            type_de_carte: {
              type: 'string',
              example: 'Premium'
            },
            statut: {
              type: 'string',
              example: 'active'
            },
            date_d_inscription: {
              type: 'string',
              format: 'date-time'
            },
            localisation: {
              type: 'string',
              example: "Abidjan, Côte d'ivoire"
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts'
  ]
};