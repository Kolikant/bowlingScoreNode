const { MongoClient, ServerApiVersion } = require("mongodb");
const express = require('express');
const { body, validationResult } = require('express-validator');
const bodyParser = require('body-parser');

const config = require("./config");
const { isStrikeOrSpare, calculateScore } = require("./logics")

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
  const games = await client.db("BowlingScore").collection("games");
  
  app.post(
    '/newPlayer', 
    body('playerName').isString(),
    async (req, res) => {
      games.deleteMany({ playerName: req.body.playerName })
      const emptyGameArray = new Array(9).fill({ rolls: [null, null] })
      emptyGameArray.push({ rolls: [null, null, null] })
      
      games.insertOne({ 
        playerName: req.body.playerName,
        currFrame: 1,
        frames: emptyGameArray
      })
      res.send('New Player Inserted!')
  })

  app.post(
    '/postRoll/:playerName',
    body('roll').isInt({ min: 0, max: 10}),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const game = await games.findOne({ playerName: req.params.playerName })
      let frameIndex = game.currFrame - 1
      if(frameIndex > 10) {
        return res.send("Game allready finisehd");
      }
      if(frameIndex == 10) {
        if(isStrikeOrSpare(game.frames[9])) {
          if(game.frames[9].rolls[1] == null) {
            game.frames[9].rolls[1] = req.body.roll
          } else {
            game.frames[9].rolls[2] = req.body.roll
            game.currFrame++;
          }
        } else {
          game.currFrame++;
          return res.send("Game allready finished");
        }
      } else {
        if (game.frames[frameIndex].rolls[0] == null) {
          game.frames[frameIndex].rolls[0] = req.body.roll
          if(game.frames[frameIndex].rolls[0] == 10) {
            game.currFrame++;
          }
        } else {
          game.frames[frameIndex].rolls[1] = req.body.roll
          game.currFrame++;
        }

      }
      
      games.updateOne({ playerName: req.params.playerName }, {$set: {
        frames: game.frames,
        currFrame: game.currFrame,
      }})

      const score = calculateScore(game.frames)
      return res.send({ frame: game.frames, score })
    })  

  app.listen(config.port, async () => {
    console.log(`Example app listening on port ${config.port}`)
  })
}

initServer().catch(console.dir)

