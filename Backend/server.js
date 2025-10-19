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
import quoteLogic from './quoteLogic.js';
import adminFetchQuotes from './adminFetchQuotes.js';
import decisionLogic from './decisionLogic.js';
import adminFetchOrders from './adminFetchOrders.js';
import orderPayment from './orderPayment.js';
import fetchInvoice from './fetchInvoice.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

const app = express();
app.use(json());
app.use(cors({ origin: "http://localhost:5173" }));

app.get('/', (req, res) => { res.send("Server is running"); })

app.post('/api/admin/login', (req, res) => {
  const { adminId, password } = req.body;

  if (adminId == process.env.OWNER_ID && password == process.env.OWNER_PASSWORD)
    return res.status(200).json({ success: true, message: "Admin login success!" });

  return res.status(400).json({ success: false, error: "Admin login failed!" });

});

app.post('/api/sales-person/login', async (req, res) => {
  const { userId, password } = req.body;

  try {
    const result = await pool.query("SELECT * FROM sales_person WHERE user_id = $1", [userId]);
    if (result.rows.length == 0)
      return res.status(404).json({ success: false, error: 'Salesperson not found' });

    const user = result.rows[0];
    if (!(await compare(password, user.password)))
      return res.status(401).json({ success: false, error: 'Password did not match' });

    res.status(200).json({ success: true, message: 'Salesperson login successful' });
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
    const result = await pool.query('SELECT rice_id, rice_name, description, min_price, max_price, img_url FROM rice_details WHERE stock_available > 0 ORDER BY rice_id');
    const riceVarieties = result.rows.map(row => ({
      riceId: row.rice_id,
      riceName: row.rice_name,
      description: row.description,
      minPrice: parseFloat(row.min_price),
      maxPrice: parseFloat(row.max_price),
      imgUrl: `${req.protocol}://${req.get('host')}${row.img_url}`
    }));

    res.status(200).json(riceVarieties);
  }

  catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
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

app.get('/api/admin/dashboard/:userId', async (req, res) => {
  const { userId } = req.params;
  await userDetails(pool, userId, res);
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

app.post('/api/sales-person/:userId/orders', async (req, res) => {
  const { userId } = req.params;
  const { action, orderId, addressId } = req.body;
  await orderPayment(pool, userId, orderId, action, addressId, res);
});

app.get('/api/sales-person/:userId/:orderId', async (req, res) => {
  const { userId, orderId } = req.params;
  await fetchInvoice(pool, userId, orderId, res);
});

app.get('/api/admin/orders', async (req, res) => {
  const filterOption = req.query;
  await adminFetchOrders(pool, filterOption, res)
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});