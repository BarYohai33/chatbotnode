const request = require('request');

class Carrefour {
  constructor (longitude, latitude) {
    this.longitude = longitude;
    this.latitude = latitude;
  }
  init (callback) {
    const options = {
      'method': 'GET',
      'url': 'https://api.fr.carrefour.io/v1/openapi/stores',
      'qs':
       {'longitude': this.longitude,
         'latitude': this.latitude,
         'radius': '3000',
         'format': 'PRX'
       },
      'headers':
       {'accept': 'application/json',
         'x-ibm-client-id': '0e1dce3d-f5a4-42ba-8f2d-bf68a531bc5e',
         'x-ibm-client-secret': 'T5wB2qS4uV0aN2fD4sK1iU4nS6hS8nF4wE0sO4aD8qL8hI6mG8'
       }
    };

    request(options, (error, response, body) => {
      if (error) {
        console.error('Failed: %s', error.message);
      }
      let myJson = JSON.parse(body);

      callback(myJson);

      // for (let i = 0; i < myJson.list.length; i ++) {
      //   socket.emit('addresses', myJson.list[i].address);
      // }
    });
  //   socket.on('position', coord1 => {
  //   getShopByPosition(coord1);
  // });
  }
  run () {
    var sync = true;

    this.init(result => {
      //console.log(result);
      this.setJson(result);
      sync = false;
    });
    while (sync) {
      require('deasync').sleep(100);
    }
  }

  setJson (json) {
    this.json = JSON.parse(json);
  }

  getJson () {
    return this.json;
  }
  getAddress (i) {
    return this.json.list[i].address;
  }
  getLongitude (i) {
    return this.json.list[i].longitude;
  }
  getLatitude (i) {
    return this.json.list[i].latitude;
  }
}
const carrefour = new Carrefour();

carrefour.run();
console.log(carrefour.getAddress());
