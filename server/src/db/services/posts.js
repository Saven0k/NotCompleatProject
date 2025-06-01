const db = require('../db'); // Получаем pool соединений
const generateUniqueId = require('../utils/generateUniqueId');
const formatDate = require('../utils/formateData');
const path = require('path');
const fs = require('fs');

/**
 * Создает пост с прикрепленным изображением.
 */
async function createPostWithImage(title, content, role, status, role_context, image) {
    const postId = generateUniqueId('post');
    let image_path = '';
    
    try {
        if (image) {
            const ext = path.extname(image.originalname);
            const filename = `${Date.now()}${ext}`;
            image_path = path.join('uploads', filename);
            await fs.promises.writeFile(path.join(__dirname, image_path), image.buffer);
        }

        const [result] = await db.query(
            `INSERT INTO posts (id, title, content, role, role_context, status, date_created, image_path) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [postId, title, content, role, JSON.stringify(role_context.split(',')), status, formatDate(), image_path]
        );

        return {
            postId,
            message: `Запись успешно зарегистрирована: ${title}`,
        };
    } catch (error) {
        if (image_path) {
            try {
                await fs.promises.unlink(path.join(__dirname, image_path));
            } catch (unlinkError) {
                console.error('Ошибка удаления изображения:', unlinkError);
            }
        }
        throw error;
    }
}

/**
 * Получает все посты из базы данных.
 */
async function getAllPosts() {
    try {
        const [rows] = await db.query('SELECT * FROM posts');
        return rows;
    } catch (err) {
        throw new Error("Ошибка вывода всех постов");
    }
}

/**
 * Находит пост по его идентификатору.
 */
async function getPostById(id) {
    try {
        const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        return rows[0] || null;
    } catch (err) {
        throw new Error("Ошибка вывода поста");
    }
}

/**
 * Получает посты по роли, статусу и контексту.
 */
async function getPostsByRoleByStatusByContext(role, status, role_context) {
    try {
        const [rows] = await db.query(
            'SELECT * FROM posts WHERE role = ? AND status = ?',
            [role, status]
        );

        if (role !== 'all' && role !== 'teacher') {
            return rows.filter(post => {
                try {
                    if (!post.role_context || post.role_context === "null") return false;
                    const postContexts = JSON.parse(post.role_context);
                    return role_context.some(context => 
                        postContexts.includes(context)
                    );
                } catch (e) {
                    console.error(`Ошибка обработки контекста для поста ${post.id}:`, e);
                    return false;
                }
            });
        }
        return rows;
    } catch (err) {
        throw new Error("Ошибка получения студенческих постов");
    }
}

/**
 * Обновляет существующий пост.
 */
async function updatePost(id, title, content, role, status, role_context) {
    try {
        await db.query(
            `UPDATE posts 
             SET title = ?, content = ?, role = ?, role_context = ?, status = ?, date_created = ? 
             WHERE id = ?`,
            [title, content, role, JSON.stringify(role_context), status, formatDate(), id]
        );

        const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        if (!rows.length) throw new Error("Пост не найден");
        
        return rows[0];
    } catch (err) {
        throw new Error(err.message || "Ошибка обновления поста");
    }
}

/**
 * Обновляет статус поста.
 */
async function updatePostStatus(id, status) {
    try {
        await db.query(
            'UPDATE posts SET status = ? WHERE id = ?',
            [status, id]
        );

        const [rows] = await db.query('SELECT * FROM posts WHERE id = ?', [id]);
        if (!rows.length) throw new Error("Пост не найден");
        
        return rows[0];
    } catch (err) {
        throw new Error(err.message || "Ошибка обновления статуса поста");
    }
}

/**
 * Удаляет пост по его идентификатору.
 */
async function deletePost(id) {
    try {
        // Получаем информацию о посте
        const [rows] = await db.query(
            'SELECT image_path FROM posts WHERE id = ?',
            [id]
        );
        if (!rows.length) throw new Error(`Пост с id ${id} не найден`);

        // Удаляем изображение если есть
        const imagePath = rows[0].image_path;
        if (imagePath) {
            try {
                await fs.promises.unlink(path.join(__dirname, imagePath));
            } catch (unlinkError) {
                console.error('Ошибка удаления изображения:', unlinkError);
            }
        }

        // Удаляем сам пост
        const [result] = await db.query(
            'DELETE FROM posts WHERE id = ?',
            [id]
        );
        
        if (result.affectedRows === 0) {
            throw new Error(`Пост с id ${id} не найден`);
        }

        return "OK";
    } catch (err) {
        throw new Error(err.message || `Ошибка удаления поста с id: ${id}`);
    }
}

module.exports = {
    createPostWithImage,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    getPostsByRoleByStatusByContext,
    updatePostStatus
};