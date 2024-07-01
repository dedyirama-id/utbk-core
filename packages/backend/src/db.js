const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({
  path: path.join(__dirname, '../../../.env'),
});

async function connect() {
  if (process.env.NODE_ENV === 'production') await mongoose.connect(process.env.DATABASE_URI);
  else await mongoose.connect(process.env.TEST_DATABASE_URI);
}

try {
  connect();
} catch (error) {
  console.log(error);
}
