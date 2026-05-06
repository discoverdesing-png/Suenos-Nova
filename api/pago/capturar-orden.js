const paypal = require('@paypal/checkout-server-sdk');
const db = require('../db');

function environment() {
    return new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID, 
        process.env.PAYPAL_CLIENT_SECRET
    );
}

function client() {
    return new paypal.core.PayPalHttpClient(environment());
}

module.exports = async (req, res) => {
    if (req.method!== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { orderID, userId } = req.body;
    
    if (!orderID ||!userId) {
        return res.status(400).json({ error: 'Faltan datos' });
    }

    const request = new paypal.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    try {
        const capture = await client().execute(request);
        
        if (capture.result.status === 'COMPLETED') {
            // Activar plan del usuario
            await db.query(
                'UPDATE users SET plan_activo = TRUE, fecha_pago = NOW() WHERE id =?',
                [userId]
            );

            // Registrar pago
            await db.query(
                'INSERT INTO pagos (user_id, paypal_order_id, monto, estado) VALUES (?,?,?,?)',
                [userId, orderID, 0.99, 'completado']
            );

            res.status(200).json({ message: 'Pago completado. Plan activado.' });
        } else {
            res.status(400).json({ error: 'Pago no completado' });
        }
    } catch (err) {
        console.error('Error PayPal capturar:', err);
        res.status(500).json({ error: 'Error al capturar pago' });
    }
};
