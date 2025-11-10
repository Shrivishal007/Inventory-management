import express, { json } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { compare } from 'bcrypt';
import registerUser from './registerUser.js';
import changeRiceDetails from './changeRiceDetails.js';
import userDetails from './userDetails.js';
import adminDetails from './adminDetails.js';
import salespersonDetails from './salespersonDetails.js';
import quoteLogic from './quoteLogic.js';
import adminFetchQuotes from './adminFetchQuotes.js';
import decisionLogic from './decisionLogic.js';
import adminFetchOrders from './adminFetchOrders.js';
import payOrder from './payOrder.js';
import allocateVehicle from './allocateVehicle.js';
import fetchInvoice from './fetchInvoice.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const app = express();
app.use(json());
app.use(cors({ origin: process.env.FRONTEND_URL }));

app.get('/', (req, res) => { res.send("Server is running"); })

app.post('/api/admin/login', (req, res) => {
  const { adminId, password } = req.body;

  if (adminId === process.env.OWNER_ID && password === process.env.OWNER_PASSWORD)
    return res.status(200).json({ message: "Admin login success!" });

  return res.status(400).json({ error: "Admin login failed!" });

});

app.post('/api/sales-person/login', async (req, res) => {
  const { emailId, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM sales_person WHERE email_id = $1", [emailId]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Salesperson not found' });

    const user = result.rows[0];
    if (!(await compare(password, user.password)))
      return res.status(401).json({ error: 'Password did not match' });

    res.status(200).json({ userId: user.user_id, message: 'Salesperson login successful' });
  }

  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

app.post('/api/sales-person/register', async (req, res) => {
  const formData = req.body;
  const result = await registerUser(pool, formData);
  res.status(result.status).json(
      result.status === 201
          ? { userId: result.userId, message: result.message }
          : { error: result.error },
  );
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.get('/api/rice-varieties', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM rice_details ORDER BY rice_id');
    const riceVarieties = result.rows.map(row => ({
      riceId: row.rice_id,
      riceName: row.rice_name,
      description: row.description,
      stockAvailable: parseFloat(row.stock_available),
      minPrice: parseFloat(row.min_price),
      maxPrice: parseFloat(row.max_price),
      lastChangedDate: row.last_changed_date,
      imgUrl: `${req.protocol}://${req.get('host')}${row.img_path}`
    }));

    res.status(200).json(riceVarieties);
  }

  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/api/set-prices', async (req, res) => {
  const updates = req.body;
  const result = await changeRiceDetails(pool, updates);

  res.status(result.status).json(
      result.status === 200
          ? { message: result.message, updatedCount: result.updatedCount }
          : { error: result.error },
  );
});

app.get('/api/sales-person/dashboard/:userId', async (req, res) => {
  const { userId } = req.params;
  const result = await userDetails(pool, userId);

  res.status(result.status).json(
        result.status === 200 ? { salesperson: result.salesperson } : { error: result.error },
    );
});

app.get('/api/admin/dashboard', async (req, res) => {
  const result = await adminDetails(pool);

  res.status(result.status).json(
      result.status === 200 ? result.stats : { error: result.error },
  );
});

app.get('/api/admin/dashboard/salesperson', async (req, res) => {
  const result = await salespersonDetails(pool);

  res.status(result.status).json(
        result.status === 200 ? result.salespersons : { error: result.error },
    );
});

app.post('/api/sales-person/:userId/quotes', async (req, res) => {
  const userId = req.params.userId;
  const quotedItems = req.body;
  const result = await quoteLogic(pool, userId, quotedItems);

  res.status(result.status).json(
      result.status === 201
          ? {
                message: result.message,
                quoteNumber: result.quoteNumber,
                quoteStatus: result.quoteStatus,
            }
          : result.status === 400
            ? {
                  riceId: result.riceId,
                  reason: result.reason,
                  error: result.error,
              }
            : { error: result.error },
  );
});

app.get('/api/admin/quotes', async (req, res) => {
  const result = await adminFetchQuotes(pool);

  res.status(result.status).json(
        result.status === 200 ? { pendingQuotes: result.pendingQuotes } : { error: result.error },
    );
});

app.post('/api/admin/quotes', async (req, res) => {
  const { action, quoteNumber } = req.body;
  const result = await decisionLogic(pool, quoteNumber, action);

  res.status(result.status).json(
      result.status === 200
          ? action === "Reject"
              ? { message: result.message }
              : {
                    message: result.message,
                    quoteNumber: result.quoteNumber,
                    totalprice: result.totalPrice,
                }
          : { error: result.error },
  );
});

app.post('/api/sales-person/:userId/orders/pay', async (req, res) => {
  const { userId } = req.params;
  const { orderId, addressId } = req.body;
  const result = await payOrder(pool, userId, orderId, addressId);
  res.status(result.status).json(
      result.status === 200
          ? { message: result.message }
          : result.status === 400 && result.riceId
            ? {
                  riceId: result.riceId,
                  reason: result.reason,
                  error: result.error,
              }
            : { error: result.error },
  );
});

app.post('/api/sales-person/:userId/orders/cancel', async (req, res) => {
  const { orderId } = req.body;
  try {
    const result = await pool.query('DELETE FROM orders WHERE order_id = $1', [orderId]);
    if (result.rowCount === 0)
      return res.status(400).json({ error: 'Order not found' });
        
    return res.status(200).json({ message: 'Cancellation successful' });
  } 

  catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Cancellation failed' });
  } 
});

app.post('/api/sales-person/:userId/orders/allocate', async (req, res) => {
  const { orderId } = req.body;
  const result = await allocateVehicle(pool, orderId);

  res.status(result.status).json(
      result.status === 200
          ? {
                message: result.message,
                vehicleNumber: result.vehicleNumber,
                driverId: result.driverId,
                startDate: result.startDate,
                deliveryDate: result.deliveryDate,
            }
          : { error: result.error },
  );
});

app.get('/api/sales-person/:userId/:orderId', async (req, res) => {
    const { userId, orderId } = req.params;
    const result = await fetchInvoice(pool, userId, orderId);

    res.status(result.status).json(
        result.status === 200
            ?  result.invoiceData
            : { error: result.error },
    );
});

app.get('/api/admin/orders', async (req, res) => {
    const filterOption = req.query;
    const result = await adminFetchOrders(pool, filterOption);

    res.status(result.status).json(
        result.status === 200 ? result.orders : { error: result.error },
    );
});

app.listen(process.env.BACKEND_PORT, () => {
  console.log(`Server is running on ${process.env.BACKEND_URL}`);
});