const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());
// console.log(mysql);

// Create MySQL connection pool
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "poorna@209",
  database: "businessquant",
});

db.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Define routes
app.get("/search", (req, res) => {
  const { ticker, revenue, gp, period } = req.query;
  const periodInYears = period ? period.slice(0, 1) : 0;
  const get_search_qry = `select * from businessquant_info where ticker like '${
    ticker || "%%"
  }'and revenue>=${revenue || "revenue"} and gp>=${
    Array.isArray(gp) ? gp[0] : 0
  } and date<=DATE_SUB(NOW(), INTERVAL ${periodInYears} YEAR);`;
  console.log(get_search_qry, "poorna search qry is printing");

  db.query(get_search_qry, (err, results) => {
    if (err) {
      console.error("Error querying MySQL database:", err);
      res.status(500).send("Server Error");
      return;
    }
    res.json(results);
  });
});

// // Route to fetch data from MySQL
// app.get("/insert/", async (req, res) => {
//   console.log("poo");
//   try {
//     const get_search_qry = `select * from businessquant_info where ticker like '${
//       ticker || "%%"
//     }'and revenue>=${revenue || "revenue"} and gp>=${
//       Array.isArray(gp) ? gp[0] : 0
//     } and date<=DATE_SUB(NOW(), INTERVAL ${periodInYears} YEAR);`;
//     console.log(get_search_qry, "poorna search qry is printing");

//     const response = await connection.query(get_search_qry);
//     console.log(response, "response");

//     // res.json(rows);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server Error");
//   }
// });

// Start the Express server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
