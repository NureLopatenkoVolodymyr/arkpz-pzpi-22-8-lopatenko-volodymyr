const client = require('./db'); // Підключення до бази даних
const jwt = require('jsonwebtoken'); // Підключення бібліотеки для роботи з JWT

const SECRET_KEY = 'your_secret_key'; // Секретний ключ для підпису токенів

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
    const user = result.rows[0];

    // Генерація токена, який діє 24 години
    const token = jwt.sign({ userId: user.userid, username: user.username, role: user.role }, SECRET_KEY, { expiresIn: '24h' });

    // Повертаємо користувача разом з токеном
    return { ...user, token };
  } catch (err) {
    throw new Error('Помилка при авторизації: ' + err.message);
  }
}

// Функція для додавання двері (admin only)
async function addDoor(doorName, location) {
  const query = 'INSERT INTO Doors (DoorName, Location) VALUES ($1, $2) RETURNING DoorID, DoorName, Location';
  const values = [doorName, location];

  try {
    const result = await client.query(query, values);
    return result.rows[0];
  } catch (err) {
    throw new Error('Помилка при додаванні двери: ' + err.message);
  }
}

// Функція для видалення дверей (admin only)
async function deleteDoor(doorId) {
  const query = 'DELETE FROM Doors WHERE DoorID = $1 RETURNING DoorID, DoorName, Location';
  const values = [doorId];

  try {
    const result = await client.query(query, values);
    if (result.rows.length === 0) {
      throw new Error('Двері з таким ID не знайдено');
    }
    return result.rows[0]; // Повертаємо видалену дверь
  } catch (err) {
    throw new Error('Помилка при видаленні дверей: ' + err.message);
  }
}

// Функція для додавання нового коду доступу для дверей (admin only)
async function addAccessCode(doorId, accessCode) {
  // Перевірка, чи вже існує активний код для цієї дверей
  const checkQuery = `
    SELECT CodeID FROM AccessCodes
    WHERE DoorID = $1 AND IsActive = TRUE
  `;
  const checkValues = [doorId];

  try {
    // Перевіряємо, чи існує активний код
    const checkResult = await client.query(checkQuery, checkValues);
    if (checkResult.rows.length > 0) {
      throw new Error('Для цієї дверей вже існує активний код доступу. Спочатку деактивуйте його або замініть.');
    }

    // Якщо активного коду немає, додаємо новий
    const insertQuery = `
      INSERT INTO AccessCodes (DoorID, AccessCode, IsActive)
      VALUES ($1, $2, TRUE)
      RETURNING CodeID, DoorID, AccessCode, IsActive
    `;
    const insertValues = [doorId, accessCode];

    const result = await client.query(insertQuery, insertValues);
    return result.rows[0];
  } catch (err) {
    throw new Error('Помилка при додаванні коду доступу: ' + err.message);
  }
}

// Функція для заміни коду доступу для дверей
async function replaceAccessCode(doorId, newAccessCode) {
  // Деактивуємо попередній активний код
  const deactivateQuery = `
    UPDATE AccessCodes
    SET IsActive = FALSE
    WHERE DoorID = $1 AND IsActive = TRUE
  `;
  const deactivateValues = [doorId];

  // Додаємо новий активний код
  const addQuery = `
    INSERT INTO AccessCodes (DoorID, AccessCode, IsActive)
    VALUES ($1, $2, TRUE)
    RETURNING CodeID, DoorID, AccessCode, IsActive
  `;
  const addValues = [doorId, newAccessCode];

  try {
    // Деактивуємо попередній код
    await client.query(deactivateQuery, deactivateValues);

    // Додаємо новий код
    const result = await client.query(addQuery, addValues);
    return result.rows[0];
  } catch (err) {
    throw new Error('Помилка при заміні коду доступу: ' + err.message);
  }
}

// Функція для отримання списку всіх користувачів (admin only)
async function getAllUsers() {
  const query = 'SELECT UserID, Username, Role FROM Users';

  try {
    const result = await client.query(query);
    return result.rows;
  } catch (err) {
    throw new Error('Помилка при отриманні списку користувачів: ' + err.message);
  }
}

// Функція для видалення користувача за ID (admin only, адміністратор не може видалити іншого адміністратора)
async function deleteUser(userId, currentUserRole) {
  // Перевірка, чи поточний користувач є адміністратором
  if (currentUserRole !== 'admin') {
    throw new Error('Доступ заборонено. Необхідна роль admin');
  }

  // Перевірка, чи користувач, якого видаляють, не є адміністратором
  const checkQuery = 'SELECT Role FROM Users WHERE UserID = $1';
  const checkValues = [userId];

  try {
    const checkResult = await client.query(checkQuery, checkValues);
    if (checkResult.rows.length === 0) {
      throw new Error('Користувача з таким ID не знайдено');
    }

    const userToDelete = checkResult.rows[0];
    if (userToDelete.role === 'admin') {
      throw new Error('Неможливо видалити іншого адміністратора');
    }

    // Видалення користувача
    const deleteQuery = 'DELETE FROM Users WHERE UserID = $1 RETURNING UserID, Username, Role';
    const deleteValues = [userId];

    const result = await client.query(deleteQuery, deleteValues);
    return result.rows[0];
  } catch (err) {
    throw new Error('Помилка при видаленні користувача: ' + err.message);
  }
}

// Функція для отримання списку всіх дверей (admin only)
async function getAllDoors() {
  const query = 'SELECT DoorID, DoorName, Location, OpenCount, OpenTime FROM Doors';

  try {
    const result = await client.query(query);
    return result.rows;
  } catch (err) {
    throw new Error('Помилка при отриманні списку дверей: ' + err.message);
  }
}

module.exports = { 
  registerUser, 
  loginUser,
  addDoor,
  deleteDoor,
  addAccessCode,
  replaceAccessCode,
  getAllUsers,
  deleteUser,
  getAllDoors
};
