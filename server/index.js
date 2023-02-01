const redis = require("redis");
const { Pool } = require("pg");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const keys = require("./keys");

// Express setup
const app = express();

app.use(cors());
app.use(bodyParser.json());

// Postgres client setup
const pgClient = new Pool({
  user: keys.pgUser,
  host: keys.pgHost,
  password: keys.pgPassword,
  database: keys.pgdatabase,
  port: keys.pgPort,
});

pgClient.on("error", () => console.log("Lost PG connection."));

pgClient.on("connect", (client) => {
  client
    .query("CREATE TABLE IF NOT EXISTS values (number INT)")
    .catch((err) => console.error(err));
});

// Redis client setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000,
});

const redisPublisher = redisClient.duplicate();

// express route handlers
app.get("/", (req, res) => {
  res.send("Hi");
});

app.get("/values/all", async (req, res) => {
  const values = await pgClient.query("SELECT * FROM values");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    res.send(values)
  })
});

app.post("/values", async (req, res) => {
  const index = req.body.index;

  if(parseInt(index) > 40) {
    return res.status(422).send("Index too high!")
  }
  redisClient.hset("values", index, "");
  redisPublisher.publish("insert", index);
  pgClient.query("INSERT INTO values(number) VALUES $1", [index]);

  res.status(200);
})

app.listen(5000, () => console.log(`Express server listening @ 5000`))