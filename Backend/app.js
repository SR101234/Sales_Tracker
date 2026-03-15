require("dotenv").config();
const express = require("express");
const router = require("./routers/router.js");
const cors = require("cors");
const pool = require('./DB/db.js');

const app = express();
app.use(express.json());

async function testConnection() {
  try {
    const connection = await pool.getConnection(); // get one connection from the pool
    console.log('✅ MySQL pool connected successfully');
    connection.release(); // always release back to pool
  } catch (err) {
    console.error('❌ MySQL pool connection failed:', err.message);
  }
}

testConnection();

const corsOption ={
    origin: process.env.CLIENT_URL,
    methods: "GET, PUT, PATCH, DELETE, POST, HEAD",
    credentials:true,
    allowedHeaders: ["Content-Type", "Authorization"]
}

app.use(cors(corsOption));
app.use("/",router);




app.listen(5000,"0.0.0.0",()=>{
    console.log("Runnig");
})
