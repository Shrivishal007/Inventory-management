async function orderPayment(pool, userId, orderId, addressId) {
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
            return { status: 404, error: 'Order not found' };
        };

        const { status, sales_person_id, total_price } = orderRes.rows[0];
        if (parseInt(sales_person_id) !== parseInt(userId)) {
            await client.query('ROLLBACK');
            return { status: 403, error: 'Unauthorized access' };
        }

        if (status !== 'Waiting') {
            await client.query('ROLLBACK');
            return { status: 400, error: `Order is already ${status}` };
        }

        const itemsRes = await client.query(
            `SELECT qi.rice_id, qi.quantity, r.stock_available
            FROM orders o
            JOIN quote_items qi ON o.quote_number = qi.quote_number
            JOIN rice_details r ON qi.rice_id = r.rice_id
            WHERE o.order_id = $1`,
            [orderId]
        );
        
        for (const item of itemsRes.rows) {
            const quantityQuintals = parseFloat(item.quantity);
            const currentStock = parseFloat(item.stock_available);

            if (currentStock < quantityQuintals) {
                await client.query("ROLLBACK");
                return {
                    status: 400, 
                    error: "Insufficient stock. Please wait for 2 days",
                    riceId: item.rice_id,
                    reason: `Requested ${
                        quantityQuintals * 100
                    } kg exceeds available stock (${currentStock * 100} kg)`,
                };
            }

            await client.query(
                `UPDATE rice_details SET stock_available = stock_available - $1 WHERE rice_id = $2`,
                [quantityQuintals, item.rice_id]
            );
        }

        await client.query(
            `UPDATE orders 
        SET address_id = $1, status = 'Paid' WHERE order_id = $2`,
            [addressId, orderId]
        );

        await client.query('INSERT INTO payment_details (order_id, total_price, pay_date) VALUES ($1, $2, NOW()::TIMESTAMP(0))'
        , [orderId, total_price]);

        await client.query('COMMIT');
        return { status: 200, message: 'Payment successful' };
    }

    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        return { status: 500, error: 'Payment failed' };
    }

    finally {
        client.release();
    }
}

export default orderPayment;