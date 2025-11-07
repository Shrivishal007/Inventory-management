async function adminFetchOrders(pool, filterOption, res) {

    try {
        let query = `
      SELECT o.order_id, o.quote_number, o.total_price, o.status, o.order_date,
        s.name AS salesperson, s.user_id
      FROM orders o
      JOIN quotes q ON o.quote_number = q.quote_number
      JOIN sales_person s ON q.sales_person_id = s.user_id
      WHERE 1=1
    `;
        const { status, salespersonId } = filterOption;
        const params = [];
        let i = 1;
        
        if (status) {
            query += ` AND o.status = $${i++}`;
            params.push(status);
        }
        if (salespersonId) {
            query += ` AND q.sales_person_id = $${i++}`;
            params.push(salespersonId);
        }

        query += ` ORDER BY o.order_date DESC`;

        const result = await pool.query(query, params);
        const orders = result.rows.map(row => ({
            orderId: row.order_id,
            quoteNumber: row.quote_number,
            totalPrice: parseFloat(row.total_price),
            orderStatus: row.status,
            orderDate: row.order_date,
            salesperson: row.salesperson,
            salespersonId: row.user_id
        }));

        res.status(200).json(orders);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
}

export default adminFetchOrders;