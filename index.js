const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require('express')
const bodyParser = require('body-parser');

const port = 3000
const uri = "mongodb+srv://user:user@cluster0.xt7dhak.mongodb.net/?retryWrites=true&w=majority";

const app = express()
app.use(bodyParser.json({ extended: true }));
const client = new MongoClient(uri,  {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  }
);

async function initServer() {
  await client.connect();
  games = await client.db("BowlingScore").collection("games");
  
  //TODO: validate input is name
  app.post('/newPlayer', async (req, res) => {
    games.insertOne({ playerName: req.body.playerName })
    res.send('New Player Inserted!')
  })

  app.post('/postRoll/:playerName', async (req, res) => {
    const game = await games.findOne({ playerName: req.params.playerName })
    res.send(game)
  })  
  
  app.listen(port, async () => {
    console.log(`Example app listening on port ${port}`)
  })
}

initServer().catch(console.dir)

