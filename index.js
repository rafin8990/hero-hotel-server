const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

const stripe = require("stripe")(process.env.STRIPE_SECRET);


app.use(express.json());
app.use(cors());



const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nuouh7o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const categoryCollection = client.db('hero-hotel').collection('category');
const itemsCollection = client.db('hero-hotel').collection('items');
const bookingCollection = client.db('hero-hotel').collection('bookings');
const paymentCollection = client.db('hero-hotel').collection('payments');


async function run() {
    try {

        // stripe payment 
        app.post('/create-payment-intent', async (req, res) => {
            const paymentData = req.body;
            const price = paymentData.price;
            const amount = price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: "usd",
                amount: amount,
                "payment_method_types": [
                    "card"
                ],

            })

            res.send({
                clientSecret: paymentIntent.client_secret,
            })
        });
        app.post('/payments', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment)
            const id = payment.bookingId;
            const filter = { _id: new ObjectId(id) }

            const updatedDoc = {
                $set: {
                    paid: true,
                    transictionId:payment.transictionID
                }
            }
            const updateResult= await bookingCollection.updateOne(filter, updatedDoc)
            res.send(result)

        })

        app.get('/categories', async (req, res) => {
            const query = {};
            const result = await categoryCollection.find(query).toArray();
            res.send(result)
        });

        app.get('/category', async (req, res) => {
            const category = req.query.categoryName;
            const query = { categoryName: category };
            const result = await itemsCollection.find(query).toArray();
            res.send(result)
        });

        app.get('/booking/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await itemsCollection.findOne(query);
            res.send(result);
        });

        app.post('/bookings', async (req, res) => {
            const data = req.body;
            const result = await bookingCollection.insertOne(data);
            res.send(result);
        });

        app.get('/allbooking', async (req, res) => {
            const query = {};
            const result = await bookingCollection.find(query).toArray();
            res.send(result)
        });

        app.get('/payment/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.findOne(query);
            res.send(result);
        });

    }
    finally {

    }

}
run().catch(error => console.error(error))

app.get('/', (req, res) => {
    res.send('Hero Hotel Server is running')
})
app.listen(port, () => {
    console.log(`hero hotel server is running on port on ${port}`)
})

