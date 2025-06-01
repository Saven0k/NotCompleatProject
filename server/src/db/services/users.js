const db = require('../db'); // Получаем pool соединений MySQL
const generateUniqueId = require('../utils/generateUniqueId');

/**
 * Создает нового пользователя
 */
async function createUser(email, password, role) {
    const userId = generateUniqueId('user');
    try {
        const [result] = await db.query(
            `INSERT INTO users (id, email, password, countVisit, role) 
             VALUES (?, ?, ?, ?, ?)`,
            [userId, email, password, 0, role]
        );

        console.log(`Пользователь добавлен: ${userId}, ${email}`);
        return {
            userId,
            message: "Пользователь успешно зарегистрирован"
        };
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error("Ошибка регистрации пользователя");
    }
}

/**
 * Получает всех пользователей
 */
async function getAllUsers() {
    try {
        const [rows] = await db.query('SELECT * FROM users');
        console.log("Пользователи выведены");
        return rows;
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error("Ошибка вывода всех пользователей");
    }
}

/**
 * Обновляет данные пользователя
 */
async function updateUser(id, email, password, countVisit, role) {
    try {
        const [result] = await db.query(
            `UPDATE users 
             SET email = ?, password = ?, countVisit = ?, role = ? 
             WHERE id = ?`,
            [email, password, countVisit, role, id]
        );

        if (result.affectedRows === 0) {
            throw new Error("Пользователь не найден");
        }

        console.log("Пользователь обновлен:", email, role);
        return "OK";
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error("Ошибка обновления пользователя");
    }
}

/**
 * Удаляет пользователя
 */
async function deleteUser(id) {
    try {
        const [result] = await db.query(
            'DELETE FROM users WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new Error("Пользователь не найден");
        }

        console.log(`Пользователь с id ${id} удален`);
        return "OK";
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error(`Ошибка удаления пользователя с id: ${id}`);
    }
}

/**
 * Находит пользователя по email и паролю
 */
async function findUser(email, password) {
    try {
        const [rows] = await db.query(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email, password]
        );

        if (rows.length > 0) {
            console.log("Пользователь был найден");
            return rows[0];
        }
        return null;
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw err;
    }
}

/**
 * Получает общее количество посещений всех пользователей
 */
async function getAllUsersVisits() {
    try {
        const [rows] = await db.query(
            'SELECT SUM(COALESCE(countVisit, 0)) as totalVisits FROM users'
        );
        return rows[0];
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error("Ошибка получения статистики посещений");
    }
}

/**
 * Получает количество посещений конкретного пользователя
 */
async function getUserVisists(email) {
    try {
        const [rows] = await db.query(
            'SELECT countVisit FROM users WHERE email = ?',
            [email]
        );

        if (rows.length === 0) {
            throw new Error("Пользователь не найден");
        }

        return rows[0];
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error(`Ошибка получения данных пользователя ${email}`);
    }
}

/**
 * Обновляет счетчик посещений пользователя
 */
async function updateUserVisits(email, countVisit) {
    try {
        const [result] = await db.query(
            'UPDATE users SET countVisit = ? WHERE email = ?',
            [countVisit, email]
        );

        if (result.affectedRows === 0) {
            throw new Error("Пользователь не найден");
        }

        return { success: true, changes: result.affectedRows };
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error("Ошибка обновления счетчика посещений");
    }
}

module.exports = {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    findUser,
    getAllUsersVisits,
    updateUserVisits,
    getUserVisists
};