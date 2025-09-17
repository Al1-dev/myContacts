const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const SERVER_URL = process.env.PUBLIC_URL || process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'myContacts API',
      version: '1.0.0',
    description: 'API for the myContacts application',
      contact: {
        name: 'Ali',
        email: 'ali@dev.com'
      }
    },
    servers: [
      {
        url: SERVER_URL,
        description: process.env.PUBLIC_URL || process.env.BASE_URL ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Contact: {
          type: 'object',
          required: ['firstName', 'lastName', 'phone'],
          properties: {
            _id: {
              type: 'string',
      description: 'Unique identifier of the contact'
            },
            firstName: {
              type: 'string',
      description: 'First name'
            },
            lastName: {
              type: 'string',
      description: 'Last name'
            },
            phone: {
              type: 'string',
      description: 'Phone number'
            },
            userId: {
              type: 'string',
      description: 'Owner user ID'
            }
          }
        },
        User: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            _id: {
              type: 'string',
      description: 'Unique identifier of the user'
            },
            email: {
              type: 'string',
              format: 'email',
      description: 'User email'
            },
            password: {
              type: 'string',
              format: 'password',
      description: 'User password'
            }
          }
        },
      },
      responses: {
        UnauthorizedError: {
        description: 'Missing or invalid access token',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  message: {
                    type: 'string',
                    example: 'Unauthorized'
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  apis: ['./routers/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
};