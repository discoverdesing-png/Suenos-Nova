const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

module.exports = async (req, res) => {
    const { usuario, password, apodo, apellidos, edad, lugar_residencia, email, logo_elegido } = req.body;

    if (!usuario ||!password ||!apodo ||!email) {
        return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    try {
        // Verificar si usuario o email ya existen
        const [existing] = await db.query(
            'SELECT id FROM users WHERE usuario =? OR email =?',
            [usuario, email]
        );

        if (existing.length > 0) {
            return res.status(409).json({ error: 'Usuario o email ya registrado' });
        }

        const password_hash = await bcrypt.hash(password, 10);

        const [result] = await db.query(
            `INSERT INTO users (usuario, password_hash, apodo, apellidos, edad, lugar_residencia, email, logo_elegido) 
             VALUES (?,?,?,?,?,?,?,?)`,
            [usuario, password_hash, apodo, apellidos || null, edad || null, lugar_residencia || null, email, logo_elegido || 'Nova']
        );

        const userId = result.insertId;
        const token = jwt.sign({ userId, usuario }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({ 
            message: 'Usuario creado',
            userId,
            token,
            theme_color: '#00bfff'
        });

    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ error: 'Error en el servidor al registrar' });
    }
};
