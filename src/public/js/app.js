const socket = new WebSocket(`ws://${window.location.host}`);
const msgForm = document.querySelector('#msgForm');
const msgList = document.querySelector('#msgList');
const nickForm = document.querySelector('#nickForm');

const makeSendJson = (type, payload) => {
  return JSON.stringify({
    type,
    payload,
  });
};

socket.addEventListener('open', () => {
  console.log('Connected to Server ✅');
});

socket.addEventListener('message', (msg) => {
  const liElement = document.createElement('li');
  liElement.innerText = `${msg.data}`;
  msgList.appendChild(liElement);
});

socket.addEventListener('close', () => {
  console.log('Disconnected to Server ⛔️');
});

msgForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = msgForm.querySelector('input');
  socket.send(makeSendJson('msg', input.value));
  input.value = '';
});

nickForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const input = nickForm.querySelector('input');
  socket.send(makeSendJson('nickname', input.value));
  // input.value = '';
});
