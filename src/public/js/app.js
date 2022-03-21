const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener('open', () => {
    console.log('Connected to Server ✅');
})

socket.addEventListener('message', (msg) => {
    console.log(`This msg from the Server (${msg.data})`);
    console.log(msg)
})

socket.addEventListener('close', () => {
    console.log('Disconnected to Server ⛔️');
})

setTimeout(() => {
    socket.send("hello from the browser!");
}, 3 * 1000);