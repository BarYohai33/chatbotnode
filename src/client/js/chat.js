class Chat {
  constructor () {
    const io = require('socket.io-client');
    /*  ---  Checking Chat commands ---  */

    this.socket = io.connect('http://localhost:8082');
    this.zoneChat = document.querySelector('#zone_chat');
    this.inputSendMessage = document.querySelector('.input--send-message');
    this.inputSendVideo = document.querySelector('.input--send-video');
    this.container = document.querySelector('.container').style.visibility = 'hidden';
    this.inputPseudo = document.querySelector('.input--pseudo');
    this.mustStartBy = 'Salut, pour m\'utiliser : écrivez chatbot.';
    this.startChatbot = 'chatbot';
    this.pseudoChatBot = 'Chatbot';
    this.purpose = 'Veuillez écrire l\'une des commandes que vous voulez :';
    this.startUber = '/uber start';
    this.startYoutube = '/youtube start';
    this.startCarrefour = '/carrefour start';
    this.startTranslation = '/translation start';
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

    /* --- Checking Youtube commands --- */

    this.pseudoYoutube = 'youtube';
    this.welcomeYoutube = 'Bienvenue chez youtube vous pouvez :';
    this.searchVideo = '/search video : vous permet de rechercher la vidéo que vous voulez';
    this.askYoutube = '/search video';
    this.nameVideo = 'Entrez le nom de la video';

    /* --- Checking Translate commands --- */
    this.alertEnglish = 'la traduction est activé';
    this.tradActive = false;
    this.stopTranslation = '/stop translation';
    this.toStopTranslation = 'pour arrêter la traduction entrer :  /stop translation';
    this.translationPseudo = 'Traduction';
  }
  init () {
    this.pseudo = '';
    this.socket.on('message', (data) => {
      this.insereMessage(data.pseudo, data.message);
    });
    this.socket.on('newVideo', id => {
      let maxResults = id.length;

      for (let i = 0; i < maxResults; i ++) {
        if (typeof id[i] === 'string') {
          this.launchVideo(id[i]);
        }
      }
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
  callYoutubeServices () {
    if (this.inputSendMessage.value === this.startYoutube) {
      setTimeout(() => {
        this.insereMessage(this.pseudoYoutube, this.searchVideo);
        this.insereMessage(this.pseudoYoutube, this.welcomeYoutube);
      }, 1000);
    }
    if (this.inputSendMessage.value === this.askYoutube) {
      this.insereMessage(this.pseudoYoutube, this.nameVideo);
      document.querySelector('.container').style.visibility = '';
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
      const cmds = {'cmdUber': this.startUber, 'cmdYoutube': this.startYoutube, 'cmdCarrefour': this.startCarrefour, 'cmdTranslation': this.startTranslation};

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
  getVideo () {
    this.inputSendVideo.addEventListener('keypress', (e) => {
      var key = e.keyCode;

      if (key === 13) {
        this.socket.emit('video', this.inputSendVideo.value);
        this.inputSendVideo.value = '';
      }
    });
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
          this.callYoutubeServices();
          this.callTranslateEnglish();
          this.callTranslateGerman();
          this.callTranslateSpanish();
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
  callTranslateEnglish () {
    if (this.inputSendMessage.value === this.startTranslation) {
      this.insereMessage(this.pseudoChatBot, this.toStopTranslation);
      this.insereMessage(this.pseudo, this.alertEnglish);
      this.socket.on('trad', (data) => {
        this.insereMessage(this.translationPseudo, data);
      });
    }
  }
  callTranslateGerman () {
    if (this.inputSendMessage.value === this.startTranslation) {
      this.insereMessage(this.pseudoChatBot, this.toStopTranslation);
      // this.insereMessage(this.pseudo, this.alertEnglish);
      this.socket.on('trad1', (data) => {
        this.insereMessage(this.translationPseudo, data);
      });
    }
  }
  callTranslateSpanish () {
    if (this.inputSendMessage.value === this.startTranslation) {
      this.insereMessage(this.pseudoChatBot, this.toStopTranslation);
      //this.insereMessage(this.pseudo, this.alertEnglish);
      this.socket.on('trad2', (data) => {
        this.insereMessage(this.translationPseudo, data);
      });
    }
  }
  launchVideo (id) {
    const iFrame = document.createElement('iframe');

    iFrame.setAttribute('id', 'player');
    iFrame.setAttribute('type', 'text/html');
    iFrame.setAttribute('width', '640');
    iFrame.setAttribute('height', '360');
    iFrame.setAttribute('src', `http://www.youtube.com/embed/${id}`);

    this.zoneChat.appendChild(iFrame);
  }
  run () {
    this.init();
    this.setPseudo();
    this.sendMessage();
    this.getVideo();
  }
}
const chat = new Chat();

chat.run();
