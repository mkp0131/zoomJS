import express from 'express';
import * as http from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';

const app = express();

// static 폴더 설정(정적파일 경로 설정)
app.use('/public', express.static(path.join(__dirname, 'public')));

// view engine 설정
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

// 특정 페이지에 걸리지않은 모든 url index 로 redirect
app.get('/*', (req, res) => {
  res.redirect('/');
});

const server = http.createServer(app);
const ws = new WebSocketServer({ server });

let sockets = [];
ws.on('connection', (socket) => {
  console.log('Connected to Browser 👋');

  sockets.push(socket);
  socket['nickname'] = '🐤 newbie';
  console.log(sockets.length);

  socket.on('close', () => {
    sockets = sockets.filter((aSocket) => aSocket !== socket);
    console.log('Disconnected to Browser 👋');
  });

  socket.on('message', (msg) => {
    const msgJson = JSON.parse(msg);
    console.log(msgJson);

    switch (msgJson.type) {
      case 'msg':
        sockets.forEach((aSocket) => {
          aSocket.send(`${socket.nickname}: ${msgJson.payload}`);
        });
        break;
      case 'nickname':
        const nickname = msgJson.payload;
        socket['nickname'] = nickname;
        socket.send(`Nickname is '${nickname}'`);
        break;
    }
  });
});

server.listen(3000, () => {
  console.log('🔥 Listening on http://localhost:3000');
});
