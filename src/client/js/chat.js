class Chat {
  constructor () {
    const io = require('socket.io-client');
    this.socket = io.connect('http://localhost:8082');
    this.zone_chat = document.querySelector('#zone_chat');
    this.inputSendMessage = document.querySelector('.input--send-message');
  }

  sendMessage () {
    this.inputSendMessage.addEventListener('keypress', (e) => {
      var key = e.keyCode;
      if (key === 13) {
        this.insereMessage(this.pseudo, this.inputSendMessage.value);
        this.socket.emit('message', this.inputSendMessage.value);
        this.inputSendMessage.value = '';
      }
    });
  }

  getInputMessage () {
    return document.querySelector('.input--send-message').value;
  }
  insereMessage (pseudo, message) {
    const p = document.createElement('p');

    p.textContent = this.pseudo + ' : ' + this.inputSendMessage.value;
    this.zone_chat.appendChild(p);
    return false;
  }

  init () {
    this.pseudo = prompt('Quel est votre pseudo ?');
    document.title = this.pseudo;
    this.socket.on('message', (data) => {
        this.insereMessage('',data.message);
    })


  }

  run () {
    this.init();
    this.sendMessage();
  } 





}
const chat = new Chat();
chat.run();


