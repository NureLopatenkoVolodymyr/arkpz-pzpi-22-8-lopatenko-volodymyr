const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('./functions');

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Реєстрація нового користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Користувач успішно зареєстрований
 *       400:
 *         description: Помилка при реєстрації користувача
 */
router.post('/register', async (req, res) => {
  try {
    const { username, password, role } = req.body;
    const user = await registerUser(username, password, role);
    res.status(200).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Авторизація користувача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Успішна авторизація
 *       401:
 *         description: Невірний логін або пароль
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await loginUser(username, password);
    res.status(200).json(user);
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
});

module.exports = router;