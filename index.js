const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.8nrjrgb.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


const run = async () => {
  try {

    const db = await client.db("pc-whiz-builder")
    const productsCollection = db.collection("products");
    const categoriesCollection = db.collection("categories");

    app.get('/', (req, res) => {
      res.send({ status: 'Server running...' })
    })
    app.get('/categories', async (req, res) => {
      const categories = await categoriesCollection.find({}).toArray();
      res.status(200).json(categories);
    })
    app.get('/categories/:categoryId', async (req, res) => {
      const products = await productsCollection.aggregate([{
        $match: {
          category: req.params.categoryId
        }
      }, {
        $project: {
          _id: 1,
          image: 1,
          productName: 1,
          category: 1,
          price: 1,
          status: 1,
          rating: 1,
        }
      }
      ]).toArray();
      res.status(200).json(products)
    })
    app.get('/products/random-products', async (req, res) => {
      const products = await productsCollection.aggregate([
        { $sample: { size: 6 } }, {
          $project: {
            _id: 1,
            image: 1,
            productName: 1,
            category: 1,
            price: 1,
            status: 1,
            rating: 1,
          }
        }
      ]).toArray();
    })
    app.get('/products', async (req, res) => {
      const product = await productsCollection.find().toArray()
      res.status(200).json(product);
    })
    app.get('/products/:productId', async (req, res) => {
      const product = await productsCollection.findOne({ _id: new ObjectId(req.params.productId) })
      res.status(200).json(product);
    })
  }
  finally { }
}


run()

app.listen(port, () => {
  console.log('PORT', port)
})