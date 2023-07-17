const mongoose = require('mongoose');

// connect to database
const uri = process.env.DATABASE_URI;

mongoose.connect(uri)
.then(()=>console.log('Connected to Database'))
.catch((err)=>console.log(err.message));

module.exports = mongoose;