async function quoteLogic(pool, userId, quotedItems) {
    const client = await pool.connect();
    let isAutoApproved = true;
    let totalPrice = 0;
    const itemsToProcess = [];

    try {
        await client.query('BEGIN');

        for (const item of quotedItems) {
            const { riceId, quotedPrice, quantity } = item;
            const pricePer100kg = parseFloat(quotedPrice) * 4;
            const quantityKg = parseFloat(quantity) * 25;
            const quantityQuintals = quantityKg / 100;

            const riceResult = await client.query(
                `SELECT stock_available, min_price, max_price 
         FROM rice_details WHERE rice_id = $1 FOR UPDATE`,
                [riceId]
            );

            const { stock_available, min_price, max_price } = riceResult.rows[0];
            const currentStock = parseFloat(stock_available);
            const min = parseFloat(min_price);
            const max = parseFloat(max_price);

            if (currentStock < quantityQuintals) {
                await client.query('ROLLBACK');
                return {
                    status: 400, 
                    error: 'Quote rejected due to insufficient stock',
                    riceId,
                    reason: `Requested quantity (${quantityKg} kg) exceeds available stock (${currentStock * 100} kg)`
                };
            }

            if (pricePer100kg < min || pricePer100kg > max) {
                isAutoApproved = false;
            }

            totalPrice += pricePer100kg * quantityQuintals;

            itemsToProcess.push({
                riceId, 
                quotedPrice, 
                pricePer100kg,
                quantityKg, 
                quantityQuintals, 
                currentStock
            });
        }

        const quoteStatus = isAutoApproved ? 'Approved' : 'Pending';
        const quoteRes = await client.query(
            `INSERT INTO quotes (sales_person_id, status)
       VALUES ($1, $2) RETURNING quote_number`,
            [userId, quoteStatus]
        );
        const quoteNumber = quoteRes.rows[0].quote_number;

        for (const item of itemsToProcess) {
            await client.query(
                `INSERT INTO quote_items (quote_number, rice_id, quoted_price, quantity)
         VALUES ($1, $2, $3, $4)`,
                [quoteNumber, item.riceId, item.pricePer100kg, item.quantityQuintals]
            );
        }

        if (isAutoApproved) {
            await client.query(
                `INSERT INTO orders (quote_number, total_price, status, order_date)
         VALUES ($1, $2, $3, CURRENT_DATE)`,
                [quoteNumber, totalPrice, 'Waiting']
            );
        }

        await client.query('COMMIT');
        return {
            status: 201, 
            message: isAutoApproved
                ? 'Quote approved and order created'
                : 'Quote submitted for owner approval',
            quoteNumber,
            quoteStatus
        };

    }

    catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        return { status: 500, error: 'Database Error' };
    }

    finally {
        client.release();
    }
}

export default quoteLogic;