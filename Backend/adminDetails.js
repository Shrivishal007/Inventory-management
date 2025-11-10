async function adminDetails(pool) {
    try {
        const totalRevenue = await pool.query('SELECT COALESCE(SUM(amount), 0) AS total_revenue FROM payment_details');
        const salespersonCount = await pool.query('SELECT COUNT(*) AS salesperson_count FROM sales_person');
        const orderCount = await pool.query('SELECT COUNT(*) AS order_count FROM orders');
        const pendingQuoteCount = await pool.query("SELECT COUNT(*) AS pending_quote_count FROM quotes WHERE status = 'Pending'");

        const stats = {
            totalRevenue: parseFloat(totalRevenue.rows[0].total_revenue),
            salespersonCount: parseInt(salespersonCount.rows[0].salesperson_count),
            orderCount: parseInt(orderCount.rows[0].order_count),
            pendingQuoteCount: parseInt(pendingQuoteCount.rows[0].pending_quote_count)
        };

        return { status: 200, stats };
    }

    catch (err) {
        console.error(err);
        return { status: 500, error: 'Database Error' };
    }
}

export default adminDetails;