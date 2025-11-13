const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.json());

const vouchersRoute = require('./backend/routes/vouchers');
app.use('/api/vouchers', vouchersRoute);

const distDir = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  console.warn('Frontend build not found. Run "npm run build" first if you need static assets.');
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Voucher API running on ${PORT}`);
});
