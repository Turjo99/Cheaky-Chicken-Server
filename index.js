//B35OpDvnFmXkM3rI
//chicken-db
const express = require("express");
const cors = require("cors");
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const port = process.env.PORT || 5000;
//middlewear
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xyxb77f.mongodb.net/?retryWrites=true&w=majority`;
console.log(process.env.DB_USER, process.env.DB_PASSWORD);
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    const collection = client.db("foodDB").collection("items");
    const reviewcollection = client.db("foodDB").collection("reviews");
    app.get("/items", async (req, res) => {
      const query = {};
      const cursor = collection.find(query).limit(3);
      const item = await cursor.toArray();
      res.send(item);
    });
    app.get("/allItems", async (req, res) => {
      const query = {};
      const cursor = collection.find(query);
      const item = await cursor.toArray();
      res.send(item);
    });
    app.get("/allItems/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const item = await collection.findOne(query);
      res.send(item);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewcollection.insertOne(review);
      res.send(result);
    });
    app.get("/user", async (req, res) => {
      let query = {};
      if (req.query.email) {
        query = {
          email: req.query.email,
        };
      }
      const cursor = reviewcollection.find(query);
      const userReview = await cursor.toArray();
      res.send(userReview);
    });
    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewcollection.deleteOne(query);
      res.send(result);
    });
  } finally {
  }
}
run().catch((err) => console.log(err));

app.get("/", (req, res) => {
  res.send("chicken Server Running");
});

app.listen(port, () => {
  console.log("node running");
});
