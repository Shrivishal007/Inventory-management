async function allocateVehicle(pool, orderId, res) {
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const quantityRes = await client.query(
            `SELECT SUM(qi.quantity) AS total_quantity
            FROM orders o
            JOIN quotes q ON o.quote_number = q.quote_number
            JOIN quote_items qi ON q.quote_number = qi.quote_number
            WHERE o.order_id = $1`,
            [orderId]
        );

        const totalQuantityQuintals = parseFloat(quantityRes.rows[0].total_quantity);

        const vehicleRes = await client.query(
            `SELECT vehicle_number FROM vehicle_details 
            WHERE status = 'Free' AND capacity >= $1::numeric 
            ORDER BY last_service_date DESC LIMIT 1 FOR UPDATE`,
            [totalQuantityQuintals]
        );
        if (vehicleRes.rows.length === 0) {
            await client.query("ROLLBACK");
            return res
                .status(400)
                .json({
                    error: "No suitable vehicle available. Expect delivery in a week.",
                });
        }
        const vehicleNumber = vehicleRes.rows[0].vehicle_number;

        const driverRes = await client.query(
            `SELECT driver_id FROM driver_details 
            WHERE status = 'Free' LIMIT 1 FOR UPDATE`
        );
        if (driverRes.rows.length === 0) {
            await client.query("ROLLBACK");
            return res
                .status(400)
                .json({
                    error: "No suitable driver available. Expect delivery in a week.",
                });
        }
        const driverId = driverRes.rows[0].driver_id;

        const startDate = new Date();
        const deliveryDate = new Date();
        deliveryDate.setDate(startDate.getDate() + 2);

        await client.query(
            `INSERT INTO dispatches (order_id, vehicle_number, driver_id, start_date, delivery_date)
            VALUES ($1, $2, $3, $4, $5)`,
            [orderId, vehicleNumber, driverId, startDate, deliveryDate]
        );

        await client.query(`UPDATE orders SET status = 'Allocated' WHERE order_id = $1`, [orderId]);
        await client.query(`UPDATE vehicle_details SET status = 'InTransit' WHERE vehicle_number = $1`, [vehicleNumber]);
        await client.query(`UPDATE driver_details SET status = 'InWork' WHERE driver_id = $1`, [driverId]);

        return res.status(200).json({
            message:
                "Vehicle and driver allocated successfully and Dispatch scheduled",
            vehicleNumber,
            driverId,
            startDate,
            deliveryDate,
        });
    } 
    
    catch (err) {
        console.error(err);
        return res.status(500).json({ error: "Dispatch allocation failed" });
    } 
    
    finally {
        client.release();
    }
}

export default allocateVehicle;