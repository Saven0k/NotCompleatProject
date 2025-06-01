const db = require('../db'); // Получаем pool соединений MySQL
const generateUniqueId = require('../utils/generateUniqueId');

/**
 * Получает общее количество посещений студентов из базы данных.
 * @returns {Promise<number>} Промис с количеством посещений
 * @throws {Error} В случае ошибки SQL-запроса
 */
async function getAllStudentVisits() {
    try {
        const [rows] = await db.query('SELECT COUNT(*) as count FROM visitors');
        return rows[0].count;
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error("Ошибка получения количества посещений");
    }
}

/**
 * Добавляет новую запись о посещении студента.
 * @returns {Promise<Object>} Промис с объектом содержащим visitorId
 * @throws {Error} При ошибке вставки записи
 */
async function addStudentVisitor() {
    const visitorId = generateUniqueId('visitor');

    // Форматирование даты в формате DD.MM.YYYY
    const today = new Date();
    const formattedDate = [
        String(today.getDate()).padStart(2, '0'),
        String(today.getMonth() + 1).padStart(2, '0'),
        today.getFullYear()
    ].join('.');

    try {
        const [result] = await db.query(
            'INSERT INTO visitors (id, date_visit) VALUES (?, ?)',
            [visitorId, formattedDate]
        );

        console.log("Visitor added");
        return { visitorId };
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error("Ошибка добавления посетителя");
    }
}

module.exports = {
    getAllStudentVisits,
    addStudentVisitor,
};