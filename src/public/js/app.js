const nsp = io('/nsp'); // 네임스페이스 설정
const msgFormElement = document.querySelector('.js-chatting-form');
const msgTextareaElement = document.querySelector('.js-chatting-textarea');
const roomUserListElement = document.querySelector('.js-room-user-list');

let mySid; // 채널명(방) 저장
let myRoomName; // 채널명(방) 저장

// 처음 연결
nsp.on('connect', () => {
  console.log(`id: ${nsp.id}`);
  mySid = nsp.id;
});

// 이벤트 확인 개발용 코드
// nsp.onAny((event, ...args) => {
//   console.log(`got ${event}`);
// });

// nickFormElement.addEventListener('submit', (event) => {
//   event.preventDefault();
//   const nickName =
//     nickFormElement.querySelector('input[name="nickname"]').value || 'ghost 👻';
//   nsp.emit('makeNickname', nickName, () => {
//     console.log(nickName);
//     myNicknameElement.querySelector('span').innerText = nickName;

//     nickFormElement.hidden = true;
//     roomFormElement.hidden = false;
//     myNicknameElement.hidden = false;
//     roomListElement.hidden = false;
//   });
// });

// roomFormElement.addEventListener('submit', (event) => {
//   event.preventDefault();
//   const roomName =
//     roomFormElement.querySelector('input[name="roomName"]').value || 'Hello ✋';
//   joinRoom(roomName);
// });

// const onClickChangeNickname = (event) => {
//   event.currentTarget.hidden = true;
//   const nicknameFormElement = document.querySelector('.js-my-nickname-form');
//   nicknameFormElement.classList.add('on');
//   const nicknameInputElement = document.querySelector('.js-my-nickname-input');
//   nicknameInputElement.focus();
//   const originTxt = nicknameInputElement.value;
//   nicknameInputElement.value = '';
//   nicknameInputElement.value = originTxt;
// };

// const onBlueChangeNickname = (event) => {};

roomUserListElement.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (event.target.classList.contains('js-my-nickname-btn')) {
    const myNicknameFormElement = document.querySelector(
      '.js-my-nickname-form'
    );
    myNicknameFormElement.classList.add('on');
    const myNicknameInputElement = document.querySelector(
      '.js-my-nickname-input'
    );

    myNicknameInputElement.focus();
    const originTxt = myNicknameInputElement.value;
    myNicknameInputElement.value = '';
    myNicknameInputElement.value = originTxt;

    myNicknameInputElement.addEventListener('keydown', (event) => {
      if (event.keyCode === 13) {
        myNicknameInputElement.blur();
      }

      const txt = myNicknameInputElement.value;
      if (txt.length > 10 && event.keyCode !== 8) {
        event.preventDefault();
      }
    });

    myNicknameInputElement.addEventListener('blur', () => {
      myNicknameFormElement.classList.remove('on');
      nsp.emit('changeNickname', myNicknameInputElement.value);
    });
  }
});

const appendChatElement = (type, msg, nickname) => {
  const chattingBodyElement = document.querySelector('.js-chatting-body');
  const liElement = document.createElement('li');
  if (type === 'chat-msg') {
    liElement.className = 'chatting-msg';
    liElement.innerHTML = `${msg}`;
  } else if (type === 'chat-me') {
    liElement.className = 'chatting-me';
    liElement.innerHTML = `<div class="chatting-me">
      <div class="chatting-nickname">${nickname}</div>
      <div class="speech-bubble">
        <div class="speech-bubble__txt">${msg}</div>
      </div>
    </div>`;
  } else if (type === 'chat-other') {
    liElement.innerHTML = `<div class="chatting-other">
      <div class="chatting-nickname">${nickname}</div>
      <div class="speech-bubble">
        <div class="speech-bubble__txt">${msg}</div>
      </div>
    </div>`;
  }
  chattingBodyElement.appendChild(liElement);
  chattingBodyElement.scrollTop = chattingBodyElement.scrollHeight;
};

const appendUserListInRoom = (user_list) => {
  roomUserListElement.innerHTML = '';

  user_list.forEach((user) => {
    const liElement = document.createElement('li');
    if (mySid === user.sid) {
      liElement.className = 'me';
      liElement.innerHTML = `<form class="js-my-nickname-form"><input value="${user.nickname}" class="js-my-nickname-input"><button type="submit" class="js-my-nickname-btn">설정</button></form>`;
    } else {
      liElement.innerHTML = `${user.nickname}`;
    }
    roomUserListElement.appendChild(liElement);
  });

  document.querySelector('.js-user-cnt').innerText = user_list.length;
};

// 방(채널)에 입장
nsp.on('welcome', (nickname, roomName, user_list) => {
  appendChatElement('chat-msg', `${nickname}님이 오셨습니다.`);
  myRoomName = roomName;
  document.querySelector('.js-channel-name').innerText = myRoomName;

  appendUserListInRoom(user_list);
});

// 채널(방)에서 나가거나 연결이 끊겼을때
nsp.on('bye', (nickname, user_list) => {
  appendChatElement('chat-msg', `${nickname}님이 떠나셨습니다.`);

  appendUserListInRoom(user_list);
});

nsp.on('changeNickname', (originNickname, nickname, user_list) => {
  appendChatElement(
    'chat-msg',
    `${originNickname}님이 ${nickname}님으로 변경하였습니다.`
  );
  appendUserListInRoom(user_list);
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

// 메세지 받기
nsp.on('msg', (msg, nickname) => {
  appendChatElement('chat-other', msg, nickname);
});

// 메세지 보내기
msgFormElement.addEventListener('submit', (event) => {
  event.preventDefault();
  const textareaElement = msgFormElement.querySelector('textarea');
  const msg = textareaElement.value;

  if (!msg) return;
  nsp.emit('msg', msg, myRoomName, (nickname) => {
    textareaElement.value = '';
    appendChatElement('chat-me', msg, nickname);
  });
});

// 채팅창 textarea 'Enter' 입력시 submit
msgTextareaElement.addEventListener('keydown', (event) => {
  if (event.keyCode == 13) {
    event.preventDefault();
    msgFormElement.querySelector('button[type="submit"]').click();
  }
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

// 모바일메뉴 이벤트
document.querySelector('.js-m-btn-menu').addEventListener('click', () => {
  document.querySelector('.js-menu-container').classList.add('on');
});
document.querySelector('.js-m-btn-close-menu').addEventListener('click', () => {
  document.querySelector('.js-menu-container').classList.remove('on');
});
