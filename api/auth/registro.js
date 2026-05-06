const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  if (req.method!== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { usuario, password, apodo, apellidos, edad, residencia, email, logo_id } = req.body;

  if (!usuario ||!password ||!apodo ||!email ||!logo_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    // Verificar si usuario o email ya existen
    const [existente] = await db.query(
      'SELECT id FROM users WHERE usuario =? OR email =?', 
      [usuario, email]
    );

    if (existente.length > 0) {
      return res.status(409).json({ error: 'Usuario o email ya registrado' });
    }

    // Encriptar password
    const password_hash = await bcrypt.hash(password, 10);

    // Insertar usuario
    const [result] = await db.query(
      `INSERT INTO users (usuario, password_hash, apodo, apellidos, edad, residencia, email, logo_id) 
       VALUES (?,?,?,?,?,?,?,?)`,
      [usuario, password_hash, apodo, apellidos, edad, residencia, email, logo_id]
    );

    const userId = result.insertId;

    // Crear token JWT
    const token = jwt.sign(
      { userId: userId, usuario: usuario }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

    res.status(201).json({ 
      message: 'Usuario registrado', 
      userId: userId, 
      token: token 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error en el servidor al registrar' });
  }
};
