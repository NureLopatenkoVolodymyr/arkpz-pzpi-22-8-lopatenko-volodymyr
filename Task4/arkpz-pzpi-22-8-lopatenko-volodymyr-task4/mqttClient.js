const mqtt = require('mqtt');
const pool = require('./db'); // Підключення до бази даних

const mqttBroker = 'mqtt://broker.hivemq.com'; // Замініть на URL вашого MQTT-брокера
const topic = 'iot/sensor'; // Топік, на який буде підписаний клієнт

const mqttClient = mqtt.connect(mqttBroker);

mqttClient.on('connect', () => {
  console.log('Підключено до MQTT брокера');
  mqttClient.subscribe(topic, (err) => {
    if (!err) {
      console.log(`Підписка на топік: ${topic}`);
    } else {
      console.error('Помилка підписки:', err.message);
    }
  });
});

mqttClient.on('message', async (topic, message) => {
  try {
    const payload = JSON.parse(message.toString());
    const { doorId, accessCode, distance } = payload;

    // Перевіряємо, чи дані відносяться до дверей з ID 1
    if (doorId === 1) {
      // Перевірка коду доступу
      const accessCodeQuery = `
        SELECT * FROM AccessCodes 
        WHERE DoorID = $1 AND AccessCode = $2 AND IsActive = TRUE`;
      const accessCodeResult = await pool.query(accessCodeQuery, [doorId, accessCode]);

      if (accessCodeResult.rows.length > 0) {
        // Якщо код вірний і відстань >= 2 см, збільшуємо OpenCount
        if (distance >= 2) {
          const updateQuery = `
            UPDATE Doors 
            SET OpenCount = OpenCount + 1 
            WHERE DoorID = $1`;
          await pool.query(updateQuery, [doorId]);
          console.log('OpenCount збільшено на 1 для дверей з ID:', doorId);
        } else {
          console.log('Відстань менше 2 см, OpenCount не збільшено.');
        }
      } else {
        console.log('Невірний код доступу.');
      }

      // Логування спроби доступу
      const logQuery = `
        INSERT INTO AccessLogs (DoorID, AccessCode, AccessTime) 
        VALUES ($1, $2, NOW())`;
      await pool.query(logQuery, [doorId, accessCode]);

      console.log('Дані успішно оновлено');
    } else {
      console.log('Отримано дані для іншої дверей, ігноруємо.');
    }
  } catch (err) {
    console.error('Помилка при обробці повідомлення:', err.message);
  }
});

process.on('exit', () => {
  pool.end();
  mqttClient.end();
});

module.exports = mqttClient;
