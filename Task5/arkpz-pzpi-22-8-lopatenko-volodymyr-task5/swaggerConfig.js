const swaggerJsDoc = require('swagger-jsdoc');

// Swagger options
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'SecureAccess API',
      version: '1.0.0',
      description: 'API для роботи з "Програмна система для контролю доступу на підприємствах"',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./routes.js'], // Шлях до файлів, де знаходяться ваші маршрути
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = swaggerDocs;
