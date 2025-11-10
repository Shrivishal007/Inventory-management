async function salespersonDetails(pool) {
    try {
        const salespersonsObject = {};

        const personalQuery = await pool.query(
            "SELECT user_id, name, email_id FROM sales_person"
        );
        personalQuery.rows.forEach((row) => {
            salespersonsObject[row.user_id] = {
                userId: row.user_id,
                name: row.name,
                emailId: row.email_id,
                contactNumbers: [],
                quotes: [],
                orders: [],
            };
        });

        const contactRes = await pool.query(
            "SELECT user_id, contact_number FROM contact_details"
        );
        contactRes.rows.forEach((row) => {
            if (salespersonsObject[row.user_id]) {
                salespersonsObject[row.user_id].contactNumbers.push(
                    row.contact_number
                );
            }
        });

        const quoteQuery = `
            SELECT 
             q.sales_person_id,
             q.quote_number,
             r.rice_name,
             qi.quantity,
             qi.quoted_price * qi.quantity AS price,
             q.status
            FROM quotes q
            JOIN quote_items qi ON q.quote_number = qi.quote_number
            JOIN rice_details r ON qi.rice_id = r.rice_id
            ORDER BY q.quote_number;
        `;
        const quoteRes = await pool.query(quoteQuery);
        const quotes = Object.values(
            quoteRes.rows.reduce((acc, row) => {
                if (!acc[row.quote_number])
                    acc[row.quote_number] = {
                        salesPersonId: row.sales_person_id,
                        quoteNumber: row.quote_number,
                        items: [],
                        status: row.status,
                    };

                acc[row.quote_number].items.push({
                    riceName: row.rice_name,
                    quantity: parseFloat(row.quantity),
                    price: parseFloat(row.price),
                });

                return acc;
            }, {})
        );

        quotes.forEach((quote) => {
            if (salespersonsObject[quote.salesPersonId]) {
                if (!salespersonsObject[quote.salesPersonId].quotes)
                    salespersonsObject[quote.salesPersonId].quotes = [];
                salespersonsObject[quote.salesPersonId].quotes.push(quote);
            }
        });

        const orderQuery = `
            SELECT 
             q.sales_person_id,
             o.order_id,
             o.quote_number,
             o.total_price,
             o.order_date,
             dd.driver_name,
             d.vehicle_number,
             o.status
             FROM orders o
             JOIN quotes q ON o.quote_number = q.quote_number
             LEFT JOIN dispatches d ON o.order_id = d.order_id
             LEFT JOIN driver_details dd ON d.driver_id = dd.driver_id
             ORDER BY o.order_id
        `;
        const orderRes = await pool.query(orderQuery);
        orderRes.rows.forEach((row) => {
            if (salespersonsObject[row.sales_person_id]) {
                salespersonsObject[row.sales_person_id].orders.push({
                    orderId: row.order_id,
                    quoteNumber: row.quote_number,
                    totalPrice: parseFloat(row.total_price),
                    orderDate: row.order_date,
                    driverName: row.driver_name,
                    vehicleNumber: row.vehicle_number,
                    status: row.status,
                });
            }
        });

        const salespersons = Object.values(salespersonsObject);

        return { status: 200, salespersons };
    } catch (err) {
        console.error(err);
        return {
            status: 500,
            error: "Failed to retrieve salesperson information",
        };
    }
}

export default salespersonDetails;
