const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require('express');
const bodyParser = require('body-parser');

const config = require("./config");
const { addRoll } = require("./logics")

const app = express()
app.use(bodyParser.json({ extended: true }));
const client = new MongoClient(config.mongoUri,  {
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
    games.deleteMany({ playerName: req.body.playerName })
    games.insertOne({ 
      playerName: req.body.playerName,
      currFrame: 1,
      frames: []
    })
    res.send('New Player Inserted!')
  })

  app.post('/postRoll/:playerName', async (req, res) => {
    const game = await games.findOne({ playerName: req.params.playerName })
    frameIndex = game.currFrame - 1
    if(frameIndex > 10) {
      return res.send("Game allready finisehd");
    }
    if(frameIndex == 10) {
      if(typeof game.frames[9].bonusRoll == 'undefined' && (game.frames[9].roll1 == 10 || game.frames[9].roll1 + game.frames[9].roll2 == 10)) {
        game.frames[9].bonusRoll = req.body.roll
      } else {
        game.currFrame++;
        return res.send("Game allready finished");
      }
    } else {
      if(typeof game.frames[frameIndex] == 'undefined') {
        game.frames[frameIndex] = { roll1: req.body.roll }
      } else {
        game.frames[frameIndex].roll2 = req.body.roll
      }
      if("roll2" in game.frames[frameIndex] || game.frames[frameIndex].roll1 == 10) {
        game.currFrame++;
      }
    }
    
    games.updateOne({ playerName: req.params.playerName }, {$set: {
      frames: game.frames,
      currFrame: game.currFrame,
    }})
    return res.send(game.frames)
  })  
  
  app.listen(config.port, async () => {
    console.log(`Example app listening on port ${config.port}`)
  })
}

initServer().catch(console.dir)

