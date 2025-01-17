const { Pool } = require('pg');

// Підключення до PostgreSQL
const pool = new Pool({
  user: 'postgres',  // ваше ім'я користувача
  host: 'localhost',
  database: 'SecureAccess1',  // назва вашої бази даних
  password: '1234',  // ваш пароль
  port: 5432,
});

// Перевірка підключення до бази даних
pool.connect()
  .then(() => {
    console.log('Підключено до бази даних');
  })
  .catch(err => {
    console.error('Помилка при підключенні до бази даних:', err.message);
  });

  if (!pool) {
    console.error('Pool не визначено. Перевірте підключення до бази даних.');
    return res.status(500).json({ error: 'Проблема з підключенням до бази даних' });
  }
 

module.exports = pool;
