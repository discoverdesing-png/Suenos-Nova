const paypal = require('@paypal/checkout-server-sdk');

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

    const { userId } = req.body;
    if (!userId) {
        return res.status(400).json({ error: 'Falta userId' });
    }

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
            amount: {
                currency_code: 'USD',
                value: '0.99'
            },
            description: 'Plan Nova - Sueños-Nova Mensual'
        }]
    });

    try {
        const order = await client().execute(request);
        res.status(200).json({ orderID: order.result.id });
    } catch (err) {
        console.error('Error PayPal crear orden:', err);
        res.status(500).json({ error: 'Error al crear orden de PayPal' });
    }
};
