const express = require('express');
const router = express.Router();
const { registerUser, loginUser, addDoor, deleteDoor, addAccessCode, replaceAccessCode, getAllUsers, deleteUser, getAllDoors } = require('./functions');
const isAdmin = require('./middleware'); // Middleware для перевірки ролі admin

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

/**
 * @swagger
 * /api/add-door:
 *   post:
 *     summary: Додавання нової двери (доступно тільки для адміністраторів)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doorName:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Двері успішно додані
 *       400:
 *         description: Помилка при додаванні дверей
 *       403:
 *         description: Доступ заборонено. Необхідна роль admin
 */
router.post('/add-door', isAdmin, async (req, res) => {
  try {
    const { doorName, location } = req.body;
    const door = await addDoor(doorName, location);
    res.status(200).json(door);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/delete-door/{doorId}:
 *   delete:
 *     summary: Видалення дверей (доступно тільки для адміністраторів)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doorId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID дверей, які потрібно видалити
 *     responses:
 *       200:
 *         description: Двері успішно видалені
 *       400:
 *         description: Помилка при видаленні дверей
 *       403:
 *         description: Доступ заборонено. Необхідна роль admin
 *       404:
 *         description: Двері з таким ID не знайдено
 */
router.delete('/delete-door/:doorId', isAdmin, async (req, res) => {
  try {
    const doorId = req.params.doorId;
    const deletedDoor = await deleteDoor(doorId);
    res.status(200).json(deletedDoor);
  } catch (err) {
    if (err.message.includes('не знайдено')) {
      res.status(404).json({ error: err.message });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

/**
 * @swagger
 * /api/add-access-code:
 *   post:
 *     summary: Додавання нового коду доступу для дверей (доступно тільки для адміністраторів)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doorId:
 *                 type: integer
 *               accessCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Код доступу успішно додано
 *       400:
 *         description: Помилка при додаванні коду доступу
 *       403:
 *         description: Доступ заборонено. Необхідна роль admin
 */
router.post('/add-access-code', isAdmin, async (req, res) => {
  try {
    const { doorId, accessCode } = req.body;
    const newAccessCode = await addAccessCode(doorId, accessCode);
    res.status(200).json(newAccessCode);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/replace-access-code:
 *   post:
 *     summary: Заміна коду доступу для дверей (доступно тільки для адміністраторів)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               doorId:
 *                 type: integer
 *               newAccessCode:
 *                 type: string
 *     responses:
 *       200:
 *         description: Код доступу успішно замінено
 *       400:
 *         description: Помилка при заміні коду доступу
 *       403:
 *         description: Доступ заборонено. Необхідна роль admin
 */
router.post('/replace-access-code', isAdmin, async (req, res) => {
  try {
    const { doorId, newAccessCode } = req.body;
    const replacedAccessCode = await replaceAccessCode(doorId, newAccessCode);
    res.status(200).json(replacedAccessCode);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/get-all-users:
 *   get:
 *     summary: Отримання списку всіх користувачів (доступно тільки для адміністраторів)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список користувачів успішно отримано
 *       403:
 *         description: Доступ заборонено. Необхідна роль admin
 */
router.get('/get-all-users', isAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/delete-user/{userId}:
 *   delete:
 *     summary: Видалення користувача за ID (доступно тільки для адміністраторів, адміністратор не може видалити іншого адміністратора)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID користувача, якого потрібно видалити
 *     responses:
 *       200:
 *         description: Користувач успішно видалений
 *       400:
 *         description: Помилка при видаленні користувача
 *       403:
 *         description: Доступ заборонено. Необхідна роль admin або неможливо видалити іншого адміністратора
 *       404:
 *         description: Користувача з таким ID не знайдено
 */
router.delete('/delete-user/:userId', isAdmin, async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserRole = req.user.role; // Роль поточного користувача (адміністратора)
    const deletedUser = await deleteUser(userId, currentUserRole);
    res.status(200).json(deletedUser);
  } catch (err) {
    if (err.message.includes('не знайдено')) {
      res.status(404).json({ error: err.message });
    } else if (err.message.includes('адміністратора')) {
      res.status(403).json({ error: err.message });
    } else {
      res.status(400).json({ error: err.message });
    }
  }
});

/**
 * @swagger
 * /api/get-all-doors:
 *   get:
 *     summary: Отримання списку всіх дверей (доступно тільки для адміністраторів)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список дверей успішно отримано
 *       400:
 *         description: Помилка при отриманні списку дверей
 *       403:
 *         description: Доступ заборонено. Необхідна роль admin
 */
router.get('/get-all-doors', isAdmin, async (req, res) => {
  try {
    const doors = await getAllDoors();
    res.status(200).json(doors);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;