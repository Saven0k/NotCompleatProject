const db = require('../db'); // Ваш pool соединений
const generateUniqueId = require('../utils/generateUniqueId');

/**
 * Асинхронно получает список всех городов из базы данных.
 * @returns {Promise<Array>} Промис, который разрешается массивом объектов городов
 * @throws {Error} Если произошла ошибка при выполнении запроса к базе данных
 */
async function getCities() {
    try {
        const [rows] = await db.query('SELECT * FROM cities');
        return rows;
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error("Ошибка при получении списка городов");
    }
}

/**
 * Добавляет новый город в базу данных.
 * @param {string} cityName - Название города для добавления
 * @returns {Promise<Object>} Промис, который разрешается объектом с ID созданного города
 * @throws {Error} Если произошла ошибка при добавлении города
 */
async function addCity(cityName) {
    const cityId = generateUniqueId('city');
    try {
        await db.query(
            'INSERT INTO cities (id, name) VALUES (?, ?)',
            [cityId, cityName]
        );
        
        console.log("Город успешно добавлен");
        return { cityId, cityName };
    } catch (err) {
        console.error('Ошибка базы данных:', err.message);
        throw new Error('Ошибка при добавлении города');
    }
}

/**
 * Обновляет информацию о городе в базе данных.
 * @param {string} id - ID города для обновления
 * @param {string} cityName - Новое название города
 * @returns {Promise<Object>} Промис, который разрешается обновленным объектом города
 * @throws {Error} Если произошла ошибка при обновлении или город не найден
 */
async function updateCity(id, cityName) {
    try {
        const [result] = await db.query(
            'UPDATE cities SET name = ? WHERE id = ?',
            [cityName, id]
        );

        if (result.affectedRows === 0) {
            throw new Error("Город не найден");
        }

        const [rows] = await db.query(
            'SELECT * FROM cities WHERE id = ?',
            [id]
        );

        if (!rows.length) {
            throw new Error("Город не найден после обновления");
        }

        console.log("Город успешно обновлен");
        return rows[0];
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error(err.message || "Ошибка при обновлении города");
    }
}

/**
 * Удаляет город из базы данных по указанному ID.
 * @param {string} id - ID города для удаления
 * @returns {Promise<string>} Промис, который разрешается строкой "OK" при успешном удалении
 * @throws {Error} Если произошла ошибка при удалении города
 */
async function deleteCity(id) {
    try {
        const [result] = await db.query(
            'DELETE FROM cities WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            throw new Error("Город не найден");
        }

        console.log(`Город с id ${id} успешно удален`);
        return "OK";
    } catch (err) {
        console.error("Ошибка базы данных:", err.message);
        throw new Error(`Ошибка при удалении города с id: ${id}`);
    }
}

module.exports = {
    getCities,
    addCity,
    updateCity,
    deleteCity,
};