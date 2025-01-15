const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_secret_key'; // Секретний ключ для підпису токенів

// Middleware для перевірки авторизації та ролі користувача
function isAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.status(401).json({ error: 'Токен відсутній' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Невірний токен' });

    // Перевірка, чи користувач має роль 'admin'
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Доступ заборонено. Необхідна роль admin' });
    }

    req.user = user;
    next();
  });
}

module.exports = isAdmin;