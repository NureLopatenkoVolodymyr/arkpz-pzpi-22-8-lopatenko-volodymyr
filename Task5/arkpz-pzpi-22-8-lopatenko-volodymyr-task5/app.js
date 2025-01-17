const express = require('express');
const app = express();
const swaggerSetup = require('./swagger');
const routes = require('./routes');
const mqttClient = require('./mqttClient'); // Импорт MQTT-клиента

// Middleware для обробки JSON
app.use(express.json());

// Підключення маршрутів
app.use('/api', routes);

// Підключення Swagger
swaggerSetup(app);

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Сервер запущено на порті ${PORT}`);
});
