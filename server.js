import express from "express";
import helmet from"helmet";
import stationData from "/var/www/html/public/3dpaws/stationdata.json" assert {type: "json" };
import bodyParser from "body-parser";
import fs from "fs";
import RateLimit from 'express-rate-limit';
import path from "path";
import http from "http";
import https from "https";
import users from "/var/www/html/public/3dpaws/users.json" assert {type: "json"};
import { authenticateKey } from "/var/www/html/public/3dpaws/apiAuth.js";
import { createUser } from "/var/www/html/public/3dpaws/apiAuth.js";

const app  = express();
const port = 3000;

const privateKey  = fs.readFileSync('/etc/letsencrypt/live/ewx3/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/ewx3/cert.pem', 'utf8');
const ca          = fs.readFileSync('/etc/letsencrypt/live/ewx3/chain.pem', 'utf8');

const credentials = {
    key:  privateKey,
    cert: certificate,
    ca:   ca
}

let sd = stationData

app.use(helmet());
app.use(express.json());

const limiter = RateLimit({
    windowMs: 15*60*1000, // 15 minutes
    max: 100, // limit of number of requests per IP
    delayMs: 0 // disables delays
})

app.get('/', (req, res) =>
   res.send(`Node and express server is running on port ${port}`)
);

//app.get("/data", authenticateKey, (req, res) => {
//  res.json(sd);
//});

app.get("/data", authenticateKey, (req, res) => {
  let today = new Date().toISOString().split('T')[0];
  console.log(today);
  res.status(200).send({
    data: sd,
  });
});

//app.get('/api/register', authenticateKey, (req, res) => {
//  res.json(users);
//});


// need to try adjusting to save data
app.post("/data", authenticateKey, bodyParser.json(), (req, res) => {
  console.log(req.query);
  sd.push(req.query);
  savedata();
  res.json({
    status: "success",
    term: req.query
  });
});

app.post('/api/register', (req, res) => {
  //create a new with "user:Username"
  let username = req.body.username;
  let user = createUser(username, req);
  saveusers();
  res.status(201).send({ data: user });
});

// need to change :term
//app.delete("/data/:term", (req, res) => {
//  sd.filter(({ term}) => term !== req.params.term);
//  save();
//  res.json({
//    status: "success",
//    removed: req.params.term,
//    newLength: sd.length
//  });
//});

const savedata = () => {
  fs.writeFile(
    "/var/www/html/public/3dpaws/stationdata.json",
    JSON.stringify(sd, null, 2),
    (err) => {
      if (err) {
        throw err;
      }
    }
  )
}


const saveusers = () => {
  fs.writeFile(
    "/var/www/html/public/3dpaws/users.json",
    JSON.stringify(users, null, 2),
    (err) => {
      if (err) {
        throw err;
      }
    }
  )
}


const httpsServer = https.createServer(credentials, app);

httpsServer.listen(port, function(err) {
    if (err) {
      console.error('Failure to launch server');
      return;
    }
    console.log(`HTTPS Server running on port ${port}`);
});

//app.listen(port, () =>
//  console.log(`server is running at http://localhost:${port}`)
//);
