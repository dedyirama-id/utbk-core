const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../../../.env'),
});

async function connect() {
  await mongoose.connect(process.env.DATABASE_URL);
}

try {
  connect();
} catch (error) {
  console.log(error, 'from log');
}
