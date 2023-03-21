const express=require('express');
const cors=require('cors');
const app= express();
require('dotenv').config()
const port=process.env.PORT || 5000;


app.use(express.json());
app.use(cors());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nuouh7o.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const categoryCollection=client.db('hero-hotel').collection('category');

async function run (){
    try{
        app.get('/categories', async(req, res)=>{
            const query={};
            const result= await categoryCollection.find(query).toArray();
            res.send(result)
        })

    }
    finally{

    }

}
run().catch(error=>console.error(error))

app.get('/', (req, res)=>{
    res.send('Hero Hotel Server is running')
})
app.listen(port, ()=>{
    console.log(`hero hotel server is running on port on ${port}`)
})

