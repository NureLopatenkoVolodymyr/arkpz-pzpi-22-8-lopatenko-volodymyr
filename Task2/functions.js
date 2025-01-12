const client = require('./db'); // Підключення до бази даних

// Функція для реєстрації користувача
async function registerUser(username, password, role) {
  const query = 'INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING userid, username, role';
  const values = [username, password, role];
  
  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (err) {
    throw new Error('Помилка при реєстрації користувача: ' + err.message);
  }
}

// Функція для авторизації користувача
async function loginUser(username, password) {
  const query = 'SELECT * FROM users WHERE username = $1';
  const values = [username];
  
  try {
    const result = await client.query(query, values);
    if (result.rows.length === 0 || result.rows[0].password !== password) {
      throw new Error('Невірний логін або пароль');
    }
    return result.rows[0];
  } catch (err) {
    throw new Error('Помилка при авторизації: ' + err.message);
  }
}

module.exports = { 
  registerUser, 
  loginUser
};