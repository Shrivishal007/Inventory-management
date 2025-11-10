async function adminFetchQuotes(pool) {
    try {
        const query = `
      SELECT 
        q.quote_number,
        q.sales_person_id,
        sp.name AS sales_person_name,
        qi.rice_id,
        r.rice_name,
        r.stock_available,
        r.min_price,
        r.max_price,
        qi.quoted_price,
        qi.quantity
      FROM quotes q
      JOIN sales_person sp ON q.sales_person_id = sp.user_id
      JOIN quote_items qi ON q.quote_number = qi.quote_number
      JOIN rice_details r ON qi.rice_id = r.rice_id
      WHERE q.status = 'Pending'
      ORDER BY q.quote_number;
    `;

        const result = await pool.query(query);

        if (result.rows.length === 0) {
            return { status: 200, pendingQuotes: [] };
        }

        const groupedQuotes = {};
        for (const row of result.rows) {
            const quoteNum = row.quote_number;
            if (!groupedQuotes[quoteNum]) {
                groupedQuotes[quoteNum] = {
                    quoteNumber: quoteNum,
                    salesPersonId: row.sales_person_id,
                    salesPersonName: row.sales_person_name,
                    items: []
                };
            }

            groupedQuotes[quoteNum].items.push({
                riceId: row.rice_id,
                riceName: row.rice_name,
                quotedPrice: parseFloat(row.quoted_price),
                quantity: parseFloat(row.quantity),
                stockAvailable: parseFloat(row.stock_available),
                minPrice: parseFloat(row.min_price),
                maxPrice: parseFloat(row.max_price)
            });
        }

        for (const quoteNum in groupedQuotes)
            groupedQuotes[quoteNum].items.sort((a, b) => a.riceId - b.riceId);

        return { status: 200, pendingQuotes: Object.values(groupedQuotes) };
    }

    catch (err) {
        console.error(err);
        return { status: 500, error: 'Failed to retrieve pending quotes' };
    }
}

export default adminFetchQuotes;