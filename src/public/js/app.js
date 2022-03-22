const nsp = io('/nsp'); // 네임스페이스 설정
const nickFormElement = document.querySelector('#nickForm');
const roomFormElement = document.querySelector('#roomForm');
const msgFormElement = document.querySelector('#msgForm');
const myNicknameElement = document.querySelector('#myNickname');
const myRoomElement = document.querySelector('#myRoom');
const roomListElement = document.querySelector('#roomList');

nsp.on('connect', () => {
  console.log(`id: ${nsp.id}`);
});

nsp.onAny((event, ...args) => {
  console.log(`got ${event}`);
});

nickFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const nickName =
    nickFormElement.querySelector('input[name="nickname"]')?.value ||
    'ghost 👻';
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
    roomFormElement.querySelector('input[name="roomName"]')?.value ||
    'Hello ✋';
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
});

const joinRoom = (roomName) => {
  nsp.emit('makeRoom', roomName, () => {
    myRoomElement.querySelector('span').innerText = roomName;

    roomFormElement.hidden = true;
    roomListElement.hidden = true;
    msgFormElement.hidden = false;
    myRoomElement.hidden = false;
  });
};
