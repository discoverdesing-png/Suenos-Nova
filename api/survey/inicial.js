const db = require('../db');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
    if (req.method!== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'No autorizado' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user_id = decoded.userId;
        
        const {
            desperto_noche,
            primera_bebida,
            desayuno,
            tipo_trabajo,
            sociable,
            cena,
            satisfaccion_rutina
        } = req.body;

        // Verificar si ya contestó el cuestionario
        const [existe] = await db.query(
            'SELECT id FROM initial_surveys WHERE user_id =?',
            [user_id]
        );

        if (existe.length > 0) {
            return res.status(409).json({ error: 'Ya completaste el cuestionario inicial' });
        }

        await db.query(
            `INSERT INTO initial_surveys 
            (user_id, desperto_noche, primera_bebida, desayuno, tipo_trabajo, sociable, cena, satisfaccion_rutina) 
            VALUES (?,?,?,?,?,?,?,?)`,
            [user_id, desperto_noche, primera_bebida, desayuno, tipo_trabajo, sociable, cena, satisfaccion_rutina]
        );

        res.status(201).json({ message: 'Cuestionario guardado' });

    } catch (err) {
        console.error('Error survey:', err);
        res.status(401).json({ error: 'Token inválido o error de servidor' });
    }
};
