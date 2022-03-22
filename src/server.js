import express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import res from 'express/lib/response';

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

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);
const nsp = wsServer.of('/nsp'); // 네임스페이스 설정

const getPublicRoomList = () => {
  const {
    adapter: { rooms, sids },
  } = nsp;

  const result = [];
  rooms.forEach((_, k) => {
    if (!sids.get(k)) result.push(k);
  });
  return result;
};

nsp.on('connection', (socket) => {
  console.log('🔥 Socket server / socket.id: ' + socket.id);

  socket.on('makeNickname', (nickname, done) => {
    console.log(`😆 ${socket.id}'s nickname: ${nickname}`);
    socket['nickname'] = nickname;
    done();
  });

  socket.on('makeRoom', (roomName, done) => {
    socket.join(roomName);
    const publicRoomList = getPublicRoomList();

    socket.to(roomName).emit('welcome', socket.nickname);
    nsp.emit('roomList', publicRoomList);

    done();
    // socket.to(room).emit('hello!');
  });
});

httpServer.listen(3000, () => {
  console.log('🔥 Listening on http://localhost:3000');
});
