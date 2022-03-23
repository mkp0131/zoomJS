import express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
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

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors: {
    origin: ['https://admin.socket.io'],
    credentials: true,
  },
});

// socket.io - admin 설정
instrument(wsServer, {
  auth: false,
});

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

const getRoomUserCnt = (room) => {
  return nsp.adapter.rooms.get(room).size;
};

let userTempNum = 1;
nsp.on('connection', (socket) => {
  console.log('🔥 Socket server / socket.id: ' + socket.id);

  // 처음접속시 설정
  socket['nickname'] = 'ghost' + userTempNum;
  userTempNum = userTempNum + 1;
  // socket.join('hello');

  socket.on('makeNickname', (nickname, done) => {
    console.log(`😆 ${socket.id}'s nickname: ${nickname}`);
    socket['nickname'] = nickname;
    done();
  });

  socket.on('makeRoom', (roomName, done) => {
    socket.join(roomName);
    socket.to(roomName).emit('welcome', socket.nickname);
    const publicRoomList = getPublicRoomList();
    const roomUserCnt = getRoomUserCnt(roomName);
    nsp.emit('roomList', publicRoomList);
    nsp.emit('roomUserCnt', roomUserCnt);

    done();
    // socket.to(room).emit('hello!');
  });

  socket.on('msg', (msg, roomName, done) => {
    socket.to(roomName).emit('msg', msg, socket.nickname);
    done();
  });
});

httpServer.listen(process.env.PORT, () => {
  console.log('🔥 Listening on http://localhost:' + process.env.PORT);
});
