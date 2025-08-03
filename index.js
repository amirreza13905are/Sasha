import express from 'express';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(express.json());

app.get('/caller/:phone', async (req, res) => {
  const phone = req.params.phone;
  const result = await pool.query('SELECT * FROM callers WHERE phone_number = $1', [phone]);
  if (result.rows.length > 0) {
    res.json({ found: true, data: result.rows[0] });
  } else {
    res.json({ found: false });
  }
});

app.post('/caller', async (req, res) => {
  const { phone_number, company_name, role, city } = req.body;
  try {
    await pool.query(
      'INSERT INTO callers (phone_number, company_name, role, city, verified, added_by_user) VALUES ($1, $2, $3, $4, false, true)',
      [phone_number, company_name, role, city]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/report', async (req, res) => {
  const { phone_number, report_type, user_note } = req.body;
  try {
    await pool.query(
      'INSERT INTO user_reports (phone_number, report_type, user_note) VALUES ($1, $2, $3)',
      [phone_number, report_type, user_note]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Shenasa API running on port ${port}`);
});