//B35OpDvnFmXkM3rI
//chicken-db
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
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
function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}
async function run() {
  try {
    const collection = client.db("foodDB").collection("items");
    const reviewcollection = client.db("foodDB").collection("reviews");
    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "30d",
      });
      res.send({ token });
    });
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
    app.post("/allItems", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await collection.insertOne(review);
      res.send(result);
    });
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      console.log(review);
      const result = await reviewcollection.insertOne(review);
      res.send(result);
    });

    // app.get("/reviews", async (req, res) => {
    //   const query = {};
    //   const cursor = reviewcollection.find(query);
    //   const item = await cursor.toArray();
    //   res.send(item);
    // });
    app.get("/reviews", async (req, res) => {
      let query = {};
      console.log(req.query.itemID);
      if (req.query.itemID) {
        query = {
          itemID: req.query.itemID,
        };
      }

      const cursor = reviewcollection.find(query).sort({ date: -1 });
      const userReview = await cursor.toArray();
      res.send(userReview);
    });
    app.get("/user", verifyJWT, async (req, res) => {
      const decoded = req.decoded;

      if (decoded.email !== req.query.email) {
        res.status(403).send({ message: "unauthorized access" });
      }
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
    app.patch("/user/:id", async (req, res) => {
      console.log(req.params);
      console.log(req.body);
      const id = req.params.id;
      const updatedReview = req.body.updatedReview;
      const query = { _id: ObjectId(id) };
      const updatedDoc = {
        $set: {
          userReview: updatedReview,
        },
      };
      const result = await reviewcollection.updateOne(query, updatedDoc);
      res.send(result);
      // console.log(result);
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
