


class Chat {
  constructor () {
    this.socket = io.connect('http://localhost:8082');
    this.zone_chat = document.querySelector('#zone_chat');
    this.inputSendMessage = document.querySelector('.input--send-message');
    this.btnSendMessage = document.querySelector('.btn--send-message');
    this.input = document.querySelector('.input--send-message');
  }

  sendButton () {
  // Lorsqu'on envoie le formulaire, on transmet le message et on l'affiche sur la page
  this.btnSendMessage.addEventListener('click',() => {
  this.socket.emit('message', this.inputSendMessage.value); // Transmet le message aux autres sur le chat
  this.insereMessage(this.pseudo, this.inputSendMessage.value); // Affiche le message aussi sur 
  this.inputSendMessage.value = '';
  // notre page
  return false; // Permet de bloquer l'envoi "classique" du formulaire
  });

  return this;
  };

  entranceKey () {
    this.input.addEventListener('keypress', (e) => {
      var key = e.keyCode;

      if (key === 13) {
        this.socket.emit('message', this.inputSendMessage.value);
        this.insereMessage(this.pseudo, this.inputSendMessage.value);
        this.inputSendMessage.value = '';
      }
    });
  }

  insereMessage (pseudo, message) {
    const p = document.createElement('p');

    p.textContent = pseudo + ' : ' + message;
    this.zone_chat.appendChild(p);
    this.socket.emit('nouveau_client', pseudo);
    
  }

  displayMessage () {
  // Quand on reçoit un message, on l'insère dans la page
    this.socket.on('message', (data) => {
    this.insereMessage(data.pseudo, data.message);
    });
    // Quand un nouveau client se connecte, on affiche l'information
    this.socket.on('nouveau_client', (pseudo) => {
    this.insereMessage(pseudo, ' a rejoint le Chat !');
    });
  }
  run () {
    this.pseudo = prompt('Quel est votre pseudo ?');
    this.sendButton();
    this.insereMessage();
    this.entranceKey();
    this.displayMessage();
    
  }
}
const chat = new Chat();
chat.run();
