async function orderPayment(pool, userId, orderId, action, addressId, res) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const orderRes = await client.query(
            `SELECT o.status, q.sales_person_id, o.total_price
            FROM orders o
            JOIN quotes q ON o.quote_number = q.quote_number
            WHERE o.order_id = $1 FOR UPDATE`,
            [orderId]
        );

        if (orderRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Order not found' });
        };

        const { status, sales_person_id, total_price } = orderRes.rows[0];
        if (parseInt(sales_person_id) !== parseInt(userId)) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Unauthorized access' });
        }

        if (action === 'Pay') {
            if (status !== 'Waiting') {
                await client.query('ROLLBACK');
                return res.status(400).json({ error: `Order is already ${status}` });
            }

            await client.query(
                `UPDATE orders 
            SET address_id = $1, status = 'Paid' WHERE order_id = $2`,
                [addressId, orderId]
            );

            const paymentRes = await client.query('INSERT INTO payment_details (order_id, amount, pay_date) VALUES ($1, $2, NOW()::TIMESTAMP(0)) RETURNING payment_id'
            , [orderId, total_price]);
            const paymentId = paymentRes.rows[0].payment_id;

            await client.query('COMMIT');
            return res.status(200).json({ message: 'Payment successful', paymentId });
        }
    }

    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ error: 'Action failed' });
    }

    finally {
        client.release();
    }
}

export default orderPayment;