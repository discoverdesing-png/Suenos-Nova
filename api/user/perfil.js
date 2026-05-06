const db = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

        const [users] = await db.query(
            `SELECT id, usuario, apodo, theme_color, plan_activo, fecha_registro,
            (SELECT COUNT(*) FROM dreams WHERE user_id = users.id) as total_suenos,
            (SELECT COUNT(*) FROM dream_likes WHERE user_id = users.id) as total_likes
            FROM users WHERE id =?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.status(200).json(users[0]);
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
};
