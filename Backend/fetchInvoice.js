async function fetchInvoice(pool, userId, orderId, res) {
    try {
        const personalQuery = await pool.query('SELECT name, email_id FROM sales_person WHERE user_id = $1', [userId]);
        const contactQuery = await pool.query('SELECT contact_number FROM contact_details WHERE user_id = $1', [userId]);
        const addressQuery = await pool.query('SELECT street, city, pincode FROM address_details WHERE user_id = $1', [userId]);
        const orderQuery = await pool.query(`
            SELECT o.order_id, o.total_price, 
            o.total_price * 0.05 AS cgst, o.total_price * 0.05 AS sgst, 
            o.order_date, a.street, a.city, a.pincode, p.payment_id, p.pay_date
            FROM orders o LEFT JOIN address_details a ON o.address_id = a.address_id
            JOIN payment_details p ON o.order_id = p.order_id
            WHERE o.order_id = $1`
            , [orderId]);
        const itemsQuery = await pool.query(`
            SELECT r.rice_name, qi.quoted_price, qi.quantity, (qi.quantity * qi.quoted_price) as amount
            FROM orders o JOIN quotes q ON o.quote_number = q.quote_number
            JOIN quote_items qi ON q.quote_number = qi.quote_number
            JOIN rice_details r ON qi.rice_id = r.rice_id
            WHERE o.order_id = $1
        `, [orderId]);
        const dispatchQuery = await pool.query(
            `SELECT d.vehicle_number, dd.driver_name,
            dd.contact_number, d.start_date, d.delivery_date
            FROM orders o JOIN dispatches d ON o.order_id = d.order_id
            JOIN driver_details dd ON d.driver_id = dd.driver_id
            WHERE o.order_id = $1`
            , [orderId]);


        const salesperson = {
            name: personalQuery.rows[0].name,
            emailId: personalQuery.rows[0].email_id,
            contacts: contactQuery.rows.map(c => c.contact_number),
            addresses: addressQuery.rows.map(a => ({
                street: a.street,
                city: a.city,
                pincode: a.pincode
            }))
        };

        const order = {
            orderId: orderQuery.rows[0].order_id,
            totalPrice: parseFloat(orderQuery.rows[0].total_price),
            cgst: parseFloat(orderQuery.rows[0].cgst),
            sgst: parseFloat(orderQuery.rows[0].sgst),
            orderDate: orderQuery.rows[0].order_date,
            paymentId: orderQuery.rows[0].payment_id,
            payDate: orderQuery.rows[0].pay_date,

            billingAddress: {
                street: orderQuery.rows[0].street,
                city: orderQuery.rows[0].city,
                pincode: orderQuery.rows[0].pincode
            }
        };

        order.grandTotal = order.totalPrice + order.cgst + order.sgst;

        const items = itemsQuery.rows.map(row => ({
            riceName: row.rice_name,
            quotedPrice: parseFloat(row.quoted_price),
            quantity: parseFloat(row.quantity),
            amount: parseFloat(row.amount)
        }));

        const dispatch = dispatchQuery.rowCount > 0 ? {
            vehicleNumber: dispatchQuery.rows[0].vehicle_number,
            driverName: dispatchQuery.rows[0].driver_name,
            driverContact: dispatchQuery.rows[0].contact_number,
            startDate: dispatchQuery.rows[0].start_date,
            deliveryDate: dispatchQuery.rows[0].delivery_date
        } : null;

        const invoiceData = { salesperson, order, items, dispatch };
        return res.status(200).json(invoiceData);
    }

    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to generate invoice' });
    }
}

export default fetchInvoice;