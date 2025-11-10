async function decisionLogic(pool, quoteNumber, action) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const quoteRes = await client.query(
            `SELECT status FROM quotes WHERE quote_number = $1 FOR UPDATE`,
            [quoteNumber]
        );

        if (quoteRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return { status: 404, error: 'Quote not found' };
        }

        const currentStatus = quoteRes.rows[0].status;
        if (currentStatus !== 'Pending') {
            await client.query('ROLLBACK');
            return { status: 400, error: 'Quote is not pending' };
        }

        if (action === 'Reject') {
            await client.query(
                `UPDATE quotes SET status = 'Rejected' WHERE quote_number = $1`,
                [quoteNumber]
            );
            await client.query('COMMIT');
            return { status: 200, message: 'Quote rejected successfully' };
        }

        const itemsRes = await client.query(
            `SELECT quantity, quoted_price FROM quote_items WHERE quote_number = $1`,
            [quoteNumber]
        );

        const totalPrice = itemsRes.rows.reduce(
            (sum, item) =>
                sum + parseFloat(item.quantity) * parseFloat(item.quoted_price),
            0
        );

        await client.query(
            `UPDATE quotes SET status = 'Approved' WHERE quote_number = $1`,
            [quoteNumber]
        );

        await client.query(
            `INSERT INTO orders (quote_number, total_price, status, order_date)
       VALUES ($1, $2, $3, CURRENT_DATE)`,
            [quoteNumber, totalPrice, 'Waiting']
        );

        await client.query('COMMIT');
        return {
            status: 200,
            message: 'Quote approved and order created',
            quoteNumber,
            totalPrice
        };

    }

    catch (err) {
        await client.query('ROLLBACK');
        return { status: 500, error: 'Approval failed' };
    }

    finally {
        client.release();
    }
}

export default decisionLogic;