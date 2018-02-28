let fetch = require('node-fetch');

fetch('https://api.fr.carrefour.io/v1/openapi/stores/3020180044301', {
  'method': 'GET',
  'headers': {'Content-Type': 'application/json',
    'x-ibm-client-id': '0e1dce3d-f5a4-42ba-8f2d-bf68a531bc5e',
    'x-ibm-client-secret': 'D4gW5gC8aI1cI2aQ4wT8oX7fJ2bV1yC3wN3wN1wL4yK8bF5yP1'}
  // body: '{}'
}).then(response => {
  console.log(response.json());
  console.log('test');
  return response.json();
}).catch(err => {
  console.log(err);
});
