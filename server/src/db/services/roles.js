const db = require('../db'); // Получаем pool соединений MySQL
const generateUniqueId = require('../utils/generateUniqueId');

/**
 * Асинхронно получает все роли из базы данных.
 * @returns {Promise<Array>} Промис, который разрешается массивом объектов ролей
 * @throws {Error} Если произошла ошибка при запросе к базе данных
 */
async function getRoles() {
    try {
        const [rows] = await db.query('SELECT * FROM roles');
        return rows;
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error("Ошибка вывода всех ролей");
    }
}

/**
 * Добавляет новую роль в базу данных.
 * @param {string} roleName - Название новой роли
 * @returns {Promise<Object>} Промис, который разрешается объектом с ID созданной роли
 * @throws {Error} Если произошла ошибка при добавлении роли
 */
async function addRole(roleName) {
    const roleId = generateUniqueId('role');
    try {
        const [result] = await db.query(
            'INSERT INTO roles (id, name) VALUES (?, ?)',
            [roleId, roleName]
        );
        
        console.log("Role added:", roleName);
        return {
            roleId: roleId,
            roleName: roleName,
            role: roleName
        };
    } catch (err) {
        console.error('Ошибка базы данных:', err.message);
        throw new Error('Ошибка добавления роли');
    }
}

/**
 * Обновляет существующую роль в базе данных.
 * @param {string} id - ID роли для обновления
 * @param {string} role - Новое название роли
 * @returns {Promise<Object>} Промис, который разрешается обновленным объектом роли
 * @throws {Error} Если произошла ошибка при обновлении или роль не найдена
 */
async function updateRole(id, role) {
    try {
        // Обновляем роль
        const [updateResult] = await db.query(
            'UPDATE roles SET name = ? WHERE id = ?',
            [role, id]
        );

        // Проверяем, была ли обновлена хотя бы одна запись
        if (updateResult.affectedRows === 0) {
            throw new Error("Роль не найдена");
        }

        // Получаем обновленные данные
        const [rows] = await db.query(
            'SELECT * FROM roles WHERE id = ?',
            [id]
        );

        if (!rows.length) {
            throw new Error("Роль не найдена после обновления");
        }

        console.log("Роль обновлена и возвращена");
        return rows[0];
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error(err.message || "Ошибка обновления роли");
    }
}

/**
 * Удаляет роль из базы данных по указанному ID.
 * @param {string} id - ID роли для удаления
 * @returns {Promise<string>} Промис, который разрешается строкой "OK" при успешном удалении
 * @throws {Error} Если произошла ошибка при удалении роли
 */
async function deleteRole(id) {
    try {
        const [result] = await db.query(
            'DELETE FROM roles WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new Error("Роль не найдена");
        }

        console.log(`Роль с id ${id} удалена`);
        return "OK";
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error(`Ошибка удаления роли с id: ${id}`);
    }
}

module.exports = {
    getRoles,
    addRole,
    updateRole,
    deleteRole,
};