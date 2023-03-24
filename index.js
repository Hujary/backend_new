 // App constants
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const pkg = require('./package.json');
const filename = __dirname + "/database.json";
const apiPrefix = '/api';
const port = process.env.PORT || 3000;

// Create the Express app & setup middlewares
const app = express();
const fs = require("fs");
const cors = require("cors");

//const port = 8080;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors({ origin: /http:\/\/(127(\.\d){3}|localhost)/}));
//app.options('*', cors()); //for configuring Cross-Origin Resource Sharing (CORS)

app.use(express.json()); //for parsing application/json
app.use(cors()); //for configuring Cross-Origin Resource Sharing (CORS)
function log(req, res, next) {
    console.log(req.method + " Request at" + req.url);
    next();
}
app.use(log);

// Configure routes
const router = express.Router();

                         
                              //Endpoints
// ***************************************************************************

app.get('/', function (req, res) {
    return res.send("Hello World!");
})

app.get("/product", function (req, res) {
  fs.readFile(filename, "utf8", function (err, data) {
      res.writeHead(200, {
          "Content-Type": "application/json",
      });
      res.end(data);
  });
});

app.get("/product/:id", function (req, res) {
  fs.readFile(filename, "utf8", function (err, data) {
      const dataAsObject = JSON.parse(data)[req.params.id];
      res.writeHead(200, {
          "Content-Type": "application/json",
      });
      res.end(data);
  });
});

app.post("/product", function (req, res) {
  fs.readFile(filename, "utf8", function (err, data) {
      let dataAsObject = JSON.parse(data);
      dataAsObject.push({
          id: dataAsObject.length,
          name: req.body.name,
          price: req.body.price,
          ean: req.body.ean,
          src: req.body.src,
      });
      fs.writeFile(filename, JSON.stringify(dataAsObject), () => {
          res.writeHead(200, {
              "Content-Type": "application/json",
          });
         return res.end(JSON.stringify(dataAsObject));
      });
  });
});










// ----------------------------------------------
  // Create an account
router.post('/accounts', (req, res) => {
    // Check mandatory request parameters
    if (!req.body.user || !req.body.currency) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    // Check if account already exists
    if (db[req.body.user]) {
      return res.status(409).json({ error: 'User already exists' });
    }
  
    // Convert balance to number if needed
    let balance = req.body.balance;
    if (balance && typeof balance !== 'number') {
      balance = parseFloat(balance);
      if (isNaN(balance)) {
        return res.status(400).json({ error: 'Balance must be a number' });  
      }
    }
  
    // Create account
    const account = {
      user: req.body.user,
      currency: req.body.currency,
      description: req.body.description || `${req.body.user}'s budget`,
      balance: balance || 0,
      transactions: [],
    };
    db[req.body.user] = account;
  
    return res.status(201).json(account);
  });
  
// ----------------------------------------------

// Get all data for the specified account
router.get('/accounts/:user', (req, res) => {
    const account = db[req.params.user];
  
    // Check if account exists
    if (!account) {
      return res.status(404).json({ error: 'User does not exist' });
    }
  
    return res.json(account);
  });
  
  // ----------------------------------------------
  
// Remove specified account
router.delete('/accounts/:user', (req, res) => {
    const account = db[req.params.user];
  
    // Check if account exists
    if (!account) {
      return res.status(404).json({ error: 'User does not exist' });
    }
  
    // Removed account
    delete db[req.params.user];
  
    res.sendStatus(204);
  });
  
  // ----------------------------------------------
  
  // Add a transaction to a specific account
  router.post('/accounts/:user/transactions', (req, res) => {
    const account = db[req.params.user];
  
    // Check if account exists
    if (!account) {
      return res.status(404).json({ error: 'User does not exist' });
    }
  
    // Check mandatory requests parameters
    if (!req.body.date || !req.body.object || !req.body.amount) {
      return res.status(400).json({ error: 'Missing parameters' });
    }
  
    // Convert amount to number if needed
    let amount = req.body.amount;
    if (amount && typeof amount !== 'number') {
      amount = parseFloat(amount);
    }
  
    // Check that amount is a valid number
    if (amount && isNaN(amount)) {
      return res.status(400).json({ error: 'Amount must be a number' });
    }
  
    // Generates an ID for the transaction
    const id = crypto
      .createHash('md5')
      .update(req.body.date + req.body.object + req.body.amount)
      .digest('hex');
  
    // Check that transaction does not already exist
    if (account.transactions.some((transaction) => transaction.id === id)) {
      return res.status(409).json({ error: 'Transaction already exists' });
    }
  
    // Add transaction
    const transaction = {
      id,
      date: req.body.date,
      object: req.body.object,
      amount,
    };
    account.transactions.push(transaction);
  
    // Update balance
    account.balance += transaction.amount;
  
    return res.status(201).json(transaction);
  });
  
  // ----------------------------------------------
  
  // Remove specified transaction from account
  router.delete('/accounts/:user/transactions/:id', (req, res) => {
    const account = db[req.params.user];
  
    // Check if account exists
    if (!account) {
      return res.status(404).json({ error: 'User does not exist' });
    }
  
    const transactionIndex = account.transactions.findIndex(
      (transaction) => transaction.id === req.params.id
    );
  
    // Check if transaction exists
    if (transactionIndex === -1) {
      return res.status(404).json({ error: 'Transaction does not exist' });
    }
  
    // Remove transaction
    account.transactions.splice(transactionIndex, 1);
  
    res.sendStatus(204);
  });
  
// ***************************************************************************

// Add 'api` prefix to all routes
app.use(apiPrefix, router);

// Start the server
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
  


