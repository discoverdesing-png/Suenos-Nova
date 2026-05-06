const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Rutas de API
app.use('/api/auth/registro', require('./api/auth/registro'));
app.use('/api/pago/crear-orden', require('./api/pago/crear-orden'));
app.use('/api/pago/capturar-orden', require('./api/pago/capturar-orden'));
app.use('/api/user/perfil', require('./api/user/perfil'));
app.use('/api/survey/inicial', require('./api/survey/inicial'));

// Ruta principal -> index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Sueños-Nova corriendo en puerto ${PORT}`);
});
