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
import orderPayment from './orderPayment.js';
import allocateVehicle from './allocateVehicle.js';
import fetchInvoice from './fetchInvoice.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

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

  if (adminId == process.env.OWNER_ID && password == process.env.OWNER_PASSWORD)
    return res.status(200).json({ message: "Admin login success!" });

  return res.status(400).json({ error: "Admin login failed!" });

});

app.post('/api/sales-person/login', async (req, res) => {
  const { emailId, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM sales_person WHERE email_id = $1", [emailId]);
    if (result.rows.length == 0)
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
  await registerUser(pool, formData, res);
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.get('/api/rice-varieties', async (req, res) => {
  try {
    const result = await pool.query('SELECT rice_id, rice_name, description, stock_available, min_price, max_price, img_path FROM rice_details WHERE stock_available > 0 ORDER BY rice_id');
    const riceVarieties = result.rows.map(row => ({
      riceId: row.rice_id,
      riceName: row.rice_name,
      description: row.description,
      stockAvailable: parseFloat(row.stock_available),
      minPrice: parseFloat(row.min_price),
      maxPrice: parseFloat(row.max_price),
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
  await changeRiceDetails(pool, updates, res);
});

app.get('/api/sales-person/dashboard/:userId', async (req, res) => {
  const { userId } = req.params;
  await userDetails(pool, userId, res);
});

app.get('/api/admin/dashboard', async (req, res) => {
  await adminDetails(pool, res);
});

app.get('/api/admin/dashboard/salesperson', async (req, res) => {
  await salespersonDetails(pool, res);
});

app.post('/api/sales-person/:userId/quotes', async (req, res) => {
  const userId = req.params.userId;
  const quotedItems = req.body;
  await quoteLogic(pool, userId, quotedItems, res);
});

app.get('/api/admin/quotes', async (req, res) => {
  await adminFetchQuotes(pool, res);
});

app.post('/api/admin/quotes', async (req, res) => {
  const { action, quoteNumber } = req.body;
  await decisionLogic(pool, quoteNumber, action, res)
});

app.post('/api/sales-person/:userId/orders/transaction', async (req, res) => {
  const { userId } = req.params;
  const { action, orderId, addressId } = req.body;
  await orderPayment(pool, userId, orderId, action, addressId, res);
});

app.post('/api/sales-person/:userId/orders/allocate', async (req, res) => {
  const { orderId } = req.body;
  await allocateVehicle(pool, orderId, res);
});

app.get('/api/sales-person/:userId/:orderId', async (req, res) => {
  const { userId, orderId } = req.params;
  await fetchInvoice(pool, userId, orderId, res);
});

app.get('/api/admin/orders', async (req, res) => {
  const filterOption = req.query;
  await adminFetchOrders(pool, filterOption, res)
});

app.listen(process.env.BACKEND_PORT, () => {
  console.log(`Server is running on ${process.env.BACKEND_URL}`);
});