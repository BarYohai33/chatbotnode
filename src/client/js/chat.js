class Chat {
  constructor () {
    const io = require('socket.io-client');

    this.socket = io.connect('http://localhost:8082');
    this.zoneChat = document.querySelector('#zone_chat');
    this.inputSendMessage = document.querySelector('.input--send-message');
    this.inputPseudo = document.querySelector('.input--pseudo');
  }
  init () {
    this.pseudo = '';
    this.socket.on('message', (data) => {
      this.insereMessage(data.pseudo, data.message);
    });
  }
  setPseudo () {
    this.inputPseudo.addEventListener('keypress', (e) => {
      var key = e.keyCode;

      if (key === 13) {
        this.pseudo = this.inputPseudo.value;
        this.inputPseudo.disabled = true;
      }
    });
  }
  sendMessage () {
    this.inputSendMessage.addEventListener('keypress', (e) => {
      var key = e.keyCode;

      if (key === 13) {
        this.insereMessage(this.pseudo, this.inputSendMessage.value);
        this.socket.emit('nouveau_client', this.pseudo);
        this.socket.emit('message', this.inputSendMessage.value);
        this.inputSendMessage.value = '';
      }
    });
  }
  insereMessage (pseudo, message) {
    const p = document.createElement('p');

    p.textContent = pseudo + ' : ' + message;
    this.zoneChat.prepend(p);
    return false;
  }
  run () {
    this.init();
    this.setPseudo();
    this.sendMessage();
  }
}
const chat = new Chat();

chat.run();
