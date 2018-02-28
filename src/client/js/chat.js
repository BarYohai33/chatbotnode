class Chat {
  constructor () {
    const io = require('socket.io-client');
    /*  ---  Checking Chat commands ---  */

    this.socket = io.connect('http://localhost:8082');
    this.zoneChat = document.querySelector('#zone_chat');
    this.inputSendMessage = document.querySelector('.input--send-message');
    this.inputPseudo = document.querySelector('.input--pseudo');
    this.mustStartBy = 'Salut, pour m\'utiliser : écrivez chatbot.';
    this.startChatbot = 'chatbot';
    this.pseudoChatBot = 'Chatbot';
    this.purpose = 'Veuillez écrire l\'une des commandes que vous voulez :';
    this.startUber = '/uber start';
    this.startYoutube = '/youtube start';
    this.startCarrefour = '/carrefour start';
    this.isLog = 'Veuillez saisir un pseudo afin de vous logger. Merci';
    this.interval = setInterval(() => {
      this.insereMessage(this.pseudoChatBot, this.mustStartBy);
    }, 30000);
    this.firstPrevention = setTimeout(() => {
      this.insereMessage(this.pseudoChatBot, this.mustStartBy);
    }, 5000);

    /* ---   Checking Uber commands --- */

    this.pseudoUber = 'Uber';
    this.welcomeUber = 'Bienvenue chez Uber vous pouvez : ';
    this.estimateUber = '/uber estimation : vous donne le trajet [origine] vers [destination]';
    this.uberStatus = '/uber status : vous donne le status de votre dernière estimation';
    this.originUber = 'Vous partez de ? (nom de la ville / ma position actuelle)';
    this.errorUber = 'Je ne comprend pas, suivez correctement les étapes ! On reprend : ';
    this.shortEstimateUber = this.estimateUber.split(' ').slice(0, 2).join(' ');
    this.shortUberStatus = this.uberStatus.split(' ').slice(0, 2).join(' ');
    this.fromUber;
    this.toUber;
    this.isValidFromTo;
  }
  init () {
    this.pseudo = '';
    this.socket.on('message', (data) => {
      this.insereMessage(data.pseudo, data.message);
    });
  }
  callUberServices () {
    if (this.inputSendMessage.value === this.startUber) {
      const cmdUber = {'estimate': this.estimateUber, 'user status': this.uberStatus};

      setTimeout(() => {
        this.insereMessage(this.pseudoUber, this.welcomeUber);
      }, 1000);

      for (let cmd in cmdUber) {
        this.insereMessage(this.pseudoUber, cmdUber[cmd]);
      }
    }
    if (this.inputSendMessage.value === this.shortEstimateUber) {
      setTimeout(() => {
        this.insereMessage(this.pseudoUber, this.originUber);
      }, 1000);
    }
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

  isValidCmd (instruction) {
    var that = this;

    if (instruction.startsWith(this.startChatbot)) {
      const cmds = {'cmdUber': this.startUber, 'cmdYoutube': this.startYoutube, 'cmdCarrefour': this.startCarrefour};

      clearInterval(this.interval);
      setTimeout(() => {
        that.insereMessage(this.pseudoChatBot, this.purpose);
      }, 1000);

      for (var cmd in cmds) {
        this.insereMessage(this.pseudoChatBot, cmds[cmd]);
      }
    } else if (instruction.startsWith('/')) {
      clearInterval(this.interval);
    }
  }
  sendMessage () {
    this.inputSendMessage.addEventListener('keypress', (e) => {
      var key = e.keyCode;

      if (key === 13) {
        if (this.pseudo === '') {
          this.insereMessage(this.pseudoChatBot, this.isLog);
          this.inputSendMessage.value = '';
        } else {
          this.insereMessage(this.pseudo, this.inputSendMessage.value);
          this.callUberServices();
          this.isValidCmd(this.inputSendMessage.value);
          this.socket.emit('nouveau_client', this.pseudo);
          this.socket.emit('message', this.inputSendMessage.value);
          this.inputSendMessage.value = '';
        }
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
