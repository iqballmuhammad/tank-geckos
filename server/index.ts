import express from 'express';
import http from 'http';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import PhaserGame from './game/game';

const app = express();
const server = http.createServer(app);

const game = new PhaserGame(server);
const port = 1444;

app.use(cors());
app.use(compression());

app.use('/', express.static(path.join(__dirname, '../')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/getState', (req, res) => {
  try {
    let gameScene = game.scene.keys['GameScene'];
    return res.json({ state: gameScene.getState() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

server.listen(port, () => {
  console.log('Express is listening on http://localhost:' + port);
});
