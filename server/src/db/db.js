const mysql = require('mysql2/promise');
const path = require('path');

const dbConfig = {
	host: 'localhost',
	user: 'hexletkb_usr',
	password: 'oB9mR6dJ1s',
	database: 'hexletkbdb',
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0
};

// Создаем пул соединений с автоматической инициализацией таблиц
async function createPoolWithInitialization() {
	const pool = mysql.createPool(dbConfig);

	try {
		console.log("Проверка и создание таблиц...");

		await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(255),
                email VARCHAR(255),
                password VARCHAR(255),
                countVisit INT,
                role VARCHAR(50)
            )`);
		console.log("Таблица users готова");

		await pool.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id VARCHAR(255),
                title VARCHAR(255),
                content TEXT,
                role VARCHAR(50),
                role_context VARCHAR(255),
                status VARCHAR(50),
                date_created VARCHAR(50),
                image_path VARCHAR(255)
            )`);
		console.log("Таблица posts готова");

		await pool.query(`
            CREATE TABLE IF NOT EXISTS \`groups\` (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255))
            `);
		console.log("Таблица groups готова");

		await pool.query(`
            CREATE TABLE IF NOT EXISTS cities (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255)
            )`);
		console.log("Таблица cities готова");

		await pool.query(`
            CREATE TABLE IF NOT EXISTS roles (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255)
            )`);
		console.log("Таблица roles готова");

		await pool.query(`
            CREATE TABLE IF NOT EXISTS visitors (
                id INT AUTO_INCREMENT PRIMARY KEY,
                date_visit VARCHAR(50)
            )`);
		console.log("Таблица visitors готова");

		return pool;
	} catch (err) {
		console.error("Ошибка при создании таблиц:", err);
		// Закрываем пул при ошибке
		await pool.end();
		throw err;
	}
}

// Создаем и экспортируем промис, который разрешится в инициализированный пул
const initializedPoolPromise = createPoolWithInitialization();

// Экспортируем функции для работы с БД
module.exports = {
	getPool: () => initializedPoolPromise,

	// Обертка для query, которая автоматически ждет инициализации
	query: async (sql, params) => {
		const pool = await initializedPoolPromise;
		return pool.query(sql, params);
	}
};