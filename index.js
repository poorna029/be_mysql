const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const fs = require("fs");
const csv = require("csv-parser");

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
  const { ticker, revenue, gp, period, order_by } = req.query;
  const periodInYears = period ? period.slice(0, 1) : 0;
  const givenDate = new Date();
  givenDate.setFullYear(givenDate.getFullYear() - periodInYears);
  const month = givenDate.getMonth() + 1; // Month is zero-based, so add 1
  const day = givenDate.getDate();
  const year = givenDate.getFullYear();
  const req_date = `${year}-${month}-${day}`;
  //   console.log(req_date);

  const get_search_qry = `select * from businessquant_data where ticker like '${
    ticker || "%%"
  }' 
  and revenue>=${revenue || 0} and
   gp>=${Array.isArray(gp) ? gp[0] : 0} 
  and 
  ${
    periodInYears
      ? `YEAR(date) >=${year} and (YEAR(date) >= ${year} and MONTH(date) >= ${month})OR (YEAR(date) >=${year}  AND MONTH(date) >=${month} AND DAY(date) >=${day})`
      : `date=date`
  }  ${
    order_by
      ? `order by ${order_by}`
      : "order by ticker, date, revenue desc,gp desc "
  }; `;
  //   console.log(get_search_qry, "poorna search qry is printing");

  db.query(get_search_qry, (err, results) => {
    if (err) {
      console.error("Error querying MySQL database:", err);
      res.status(500).send("Server Error");
      return;
    }
    res.json(results);
  });
});

const data = [];

// Path to your CSV file
const csvFilePath = "data.csv";

// Read the CSV file and parse its contents
fs.createReadStream("./Sample-Data-Historic.csv")
  .pipe(csv())
  .on("data", (row) => {
    // Process each row of CSV data
    const a = Object.values(row);
    data.push({ ...row, ticker: a[0] });
  })
  .on("end", () => {
    // All rows have been processed
    // create_rows(data);
    console.log("qry insertion started at :", new Date().toLocaleTimeString());
  });

// Start the Express server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});

function create_rows(aar) {
  aar.forEach((element, ind) => {
    value = ind;
    const { ticker, date, revenue, gp, fcf, capex } = element;
    // console.log(ticker, date, revenue, gp, fcf, capex);
    const newdate = date.split("/");
    const date_format = `${newdate[2]}-${newdate[0]}-${newdate[1]}`; // YYYY-MM-DD

    const qry = `insert into businessquant_data(ticker,date,revenue,gp,fcf,capex) values('${ticker}','${date_format}',${
      revenue || 0
    },${gp || 0},${fcf || 0},${capex || 0} );`;

    console.log(qry);

    db.query(qry, (err) => {
      if (err) {
        console.error("Error fetching users:", err);
        // res.status(500);
        // res.send("Error fetching users");
        throw new Error("Something went wrong!");
        return;
      }
    });
  });
  console.log("qry insertion finised at :", new Date().toLocaleTimeString());
}
