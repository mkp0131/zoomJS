import express from 'express';
import * as http from 'http';
import { Server } from 'socket.io';
import { instrument } from '@socket.io/admin-ui';
import path from 'path';

const PORT = process.env.PORT || 3000;
const DEFUALT_ROOM = 'HELLO'; // 기본 채널(방) 이름
let user_list = []; // [{sid: ..., nickname: ...}]: 유저의 sid와 nickname을 저장

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

const getRoomUsers = (room) => {
  const result = [];
  nsp.adapter.rooms.get(room).forEach((sid) => {
    user_list.forEach((user) => {
      if (user.sid === sid) {
        result.push(user);
      }
    });
  });
  return result;
};

const getRandomNickname = () => {
  const emoji = [
    '😀 Smile',
    '👻 Ghost',
    '🍎 Apple',
    '🐤 Chick',
    '🥕 Carrot',
    '🚌 Bus',
    '🦄 Unicorn',
  ];
  return emoji[Math.floor(Math.random() * 7)];
};

const pushUserList = (sid, nickname) => {
  let changeUserNickname = false;
  user_list.forEach((user) => {
    if (user.sid === sid) {
      user['nickname'] = nickname;
      changeUserNickname = true;
    }
  });
  if (!changeUserNickname) {
    user_list.push({ sid, nickname });
  }
};

nsp.on('connection', (socket) => {
  // 처음접속시 설정
  socket['nickname'] = getRandomNickname();
  pushUserList(socket.id, socket.nickname);
  socket.join(DEFUALT_ROOM); // 기본 방(채널) 입장
  // 같은 채널에 있는 사람들에게 welcome 보내기
  socket
    .to(DEFUALT_ROOM)
    .emit('welcome', socket.nickname, DEFUALT_ROOM, getRoomUsers(DEFUALT_ROOM)); // 방에 입장했을시 이벤트
  // 나에게 welcome 보내기
  socket.emit(
    'welcome',
    socket.nickname,
    DEFUALT_ROOM,
    getRoomUsers(DEFUALT_ROOM)
  ); // 방에 입장했을시 이벤트

  // 모든 이벤트 Log 남기기
  socket.onAny((event) => {
    console.log(`🟦 Socket Event: ${event}`);
  });

  socket.on('disconnecting', () => {
    let nickname;
    const roomName = [...socket.rooms][1];
    user_list = user_list.filter((user) => {
      if (user.sid === [...socket.rooms][0]) {
        nickname = user.nickname;
        return false;
      } else {
        return true;
      }
    });
    socket.to(roomName).emit('bye', nickname, user_list);
  });

  // 메세지 이벤트
  socket.on('msg', (msg, roomName, done) => {
    socket.to(roomName).emit('msg', msg, socket.nickname);
    done(socket.nickname);
  });

  socket.on('changeNickname', (nickname, done) => {
    const originNickname = socket.nickname;
    console.log(`😆 ${socket.id}'s nickname: ${nickname}`);
    socket['nickname'] = nickname;
    const roomName = [...socket.rooms][1];
    user_list.forEach((user) => {
      if (user.sid === [...socket.rooms][0]) user.nickname = nickname;
    });
    socket
      .to(roomName)
      .emit('changeNickname', originNickname, nickname, getRoomUsers(roomName));
    socket.emit(
      'changeNickname',
      originNickname,
      nickname,
      getRoomUsers(roomName)
    );
  });

  socket.on('makeRoom', (roomName, done) => {
    socket.join(roomName);
    socket.to(roomName).emit('welcome', socket.nickname);
    const publicRoomList = getPublicRoomList();
    const roomUserCnt = getRoomUserCnt(roomName);
    nsp.emit('roomList', publicRoomList);
    nsp.emit('roomUserCnt', roomUserCnt);

    done();
  });
});

httpServer.listen(PORT, () => {
  console.log('🔥 Listening on http://localhost:' + PORT);
});
