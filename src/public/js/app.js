const nsp = io('/nsp'); // 네임스페이스 설정
const nickFormElement = document.querySelector('#nickForm');
const roomFormElement = document.querySelector('#roomForm');
const msgFormElement = document.querySelector('#msgForm');
const myNicknameElement = document.querySelector('#myNickname');
const myRoomElement = document.querySelector('#myRoom');
const roomListElement = document.querySelector('#roomList');
const msgListElement = document.querySelector('#msgList');

nsp.on('connect', () => {
  console.log(`id: ${nsp.id}`);
});

// 이벤트 확인 개발용 코드
// nsp.onAny((event, ...args) => {
//   console.log(`got ${event}`);
// });

nickFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const nickName =
    nickFormElement.querySelector('input[name="nickname"]').value || 'ghost 👻';
  nsp.emit('makeNickname', nickName, () => {
    console.log(nickName);
    myNicknameElement.querySelector('span').innerText = nickName;

    nickFormElement.hidden = true;
    roomFormElement.hidden = false;
    myNicknameElement.hidden = false;
    roomListElement.hidden = false;
  });
});

roomFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const roomName =
    roomFormElement.querySelector('input[name="roomName"]').value || 'Hello ✋';
  joinRoom(roomName);
});

nsp.on('welcome', (nickname) => {
  console.log('welcome ' + nickname);
});

nsp.on('roomList', (roomList) => {
  const ulElement = roomListElement.querySelector('ul');
  roomList.forEach((room) => {
    const liElement = document.createElement('li');
    liElement.innerHTML = `<a href="javascript:void(0);" onclick="joinRoom('${room}')">${room}</a>`;
    ulElement.appendChild(liElement);
  });

  myRoomElement.querySelector('#myRoomCnt').innerText = roomList.length;
});

nsp.on('roomUserCnt', (roomUserCnt) => {
  myRoomElement.querySelector('#myRoomCnt').innerText = roomUserCnt;
});

nsp.on('msg', (msg, nickname) => {
  appendMsg(msg, nickname);
});

msgFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const inputElement = msgFormElement.querySelector('input');
  const msg = inputElement.value;

  if (!msg) return;
  nsp.emit('msg', msg, 'hello', () => {
    inputElement.value = '';
    appendMsg(msg, '나');
  });
});

const joinRoom = (roomName) => {
  nsp.emit('makeRoom', roomName, () => {
    myRoomElement.querySelector('#myRoomName').innerText = roomName;

    roomFormElement.hidden = true;
    roomListElement.hidden = true;
    msgFormElement.hidden = false;
    myRoomElement.hidden = false;
  });
};

const appendMsg = (msg, nickname) => {
  const liElement = document.createElement('li');
  liElement.innerText = `${nickname}: ${msg}`;
  msgListElement.appendChild(liElement);
};

// 개발용 코드
nickFormElement.hidden = true;
roomFormElement.hidden = true;
roomListElement.hidden = true;
msgFormElement.hidden = false;
myRoomElement.hidden = false;
nsp.emit('makeRoom', 'hello', () => {
  myRoomElement.querySelector('span').innerText = 'hello';
  roomFormElement.hidden = true;
  roomListElement.hidden = true;
  msgFormElement.hidden = false;
  myRoomElement.hidden = false;
});
