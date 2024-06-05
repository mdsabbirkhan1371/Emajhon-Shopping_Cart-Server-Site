const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@emajohndb.gb0ncge.mongodb.net/?retryWrites=true&w=majority&appName=emaJohnDB`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client.db('emaJohnDB').collection('products');

    app.get('/products', async (req, res) => {
      console.log('items count and page', req.query);
      // for pagination second stem
      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      const result = await productCollection
        .find()
        // for pagination
        .skip(page * size)
        .limit(size)
        .toArray();
      res.send(result);
    });

    // for pagination first step
    app.get('/productsCount', async (req, res) => {
      const count = await productCollection.estimatedDocumentCount();
      res.send({ count });
    });

    // for searching product id api for orders section

    app.post('/productsIds', async (req, res) => {
      const ids = req.body;

      const idsWithObjectIds = ids.map(id => new ObjectId(id));
      console.log(idsWithObjectIds);
      const query = {
        _id: {
          $in: idsWithObjectIds,
        },
      };

      const result = await productCollection.find(query).toArray();

      res.send(result);
    });

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('john is busy shopping');
});

app.listen(port, () => {
  console.log(`ema john server is running on port: ${port}`);
});
