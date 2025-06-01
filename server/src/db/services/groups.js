const db = require('../db'); // Ваш pool соединений MySQL
const generateUniqueId = require('../utils/generateUniqueId');

/**
 * Асинхронно получает список всех студенческих групп из базы данных.
 * @returns {Promise<Array>} Промис, который разрешается массивом объектов групп
 * @throws {Error} Если произошла ошибка при выполнении запроса к базе данных
 */
async function getStudentGroups() {
    try {
        const [rows] = await db.query('SELECT * FROM `groups`');
        return rows;
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error("Ошибка при получении списка групп");
    }
}

/**
 * Добавляет новую студенческую группу в базу данных.
 * @param {string} groupName - Название группы для добавления
 * @returns {Promise<Object>} Промис, который разрешается объектом с ID созданной группы
 * @throws {Error} Если произошла ошибка при добавлении группы
 */
async function addStudentGroup(groupName) {
    const groupId = generateUniqueId('group');
    try {
        await db.query(
            'INSERT INTO `groups` (id, name) VALUES (?, ?)',
            [groupId, groupName]
        );
        
        console.log("Группа успешно добавлена:", groupName);
        return { groupId, groupName };
    } catch (err) {
        console.error('Ошибка базы данных:', err.message);
        throw new Error('Ошибка при добавлении группы');
    }
}

/**
 * Обновляет информацию о студенческой группе в базе данных.
 * @param {string} id - ID группы для обновления
 * @param {string} groupName - Новое название группы
 * @returns {Promise<Object>} Промис, который разрешается обновленным объектом группы
 * @throws {Error} Если произошла ошибка при обновлении или группа не найдена
 */
async function updateGroup(id, groupName) {
    try {
        // Обновляем группу
        const [result] = await db.query(
            'UPDATE `groups` SET name = ? WHERE id = ?',
            [groupName, id]
        );

        // Проверяем, была ли обновлена хотя бы одна запись
        if (result.affectedRows === 0) {
            throw new Error("Группа не найдена");
        }

        // Получаем обновленные данные
        const [rows] = await db.query(
            'SELECT * FROM `groups` WHERE id = ?',
            [id]
        );

        if (!rows.length) {
            throw new Error("Группа не найдена после обновления");
        }

        console.log("Группа успешно обновлена");
        return rows[0];
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error(err.message || "Ошибка при обновлении группы");
    }
}

/**
 * Удаляет студенческую группу из базы данных по указанному ID.
 * @param {string} id - ID группы для удаления
 * @returns {Promise<string>} Промис, который разрешается строкой "OK" при успешном удалении
 * @throws {Error} Если произошла ошибка при удалении группы
 */
async function deleteGroup(id) {
    try {
        const [result] = await db.query(
            'DELETE FROM `groups` WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new Error("Группа не найдена");
        }

        console.log(`Группа с id ${id} успешно удалена`);
        return "OK";
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error(`Ошибка при удалении группы с id: ${id}`);
    }
}

module.exports = {
    addStudentGroup,
    getStudentGroups,
    updateGroup,
    deleteGroup,
};