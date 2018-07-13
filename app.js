const fetch = require('node-fetch');
const fs = require('fs');

const artists = [];

if (process.argv[2]) {
  const token = process.argv[2];
  const authorization = `Bearer ${token}`;
  const contentType = 'application/json';

  const doRecursiveFetch = (_next, _limit) => {
    fetch(_next, {
      method: 'GET',
      headers: {
        Authorization: authorization,
        'Content-Type': contentType
      }
    }).then(data => data.json())
      .then((data) => {
        data.artists.items.map(artistObject => artists.push(artistObject.name));
        if (_limit > 0) {
          doRecursiveFetch(data.artists.next, _limit - 1);
        } else {
          const textOutput = artists.reduce((accumulator, currentValue) => `${accumulator}\n${currentValue}`);
          fs.writeFile('results/one-per-line.txt', textOutput, (err) => {
            if (err) {
              return console.log(err);
            }

            console.log('The artists were saved to results/one-per-line.txt.');
          });
        }
      });
  };

  fetch('https://api.spotify.com/v1/me/following?type=artist&limit=50', {
    method: 'GET',
    headers: {
      Authorization: authorization,
      'Content-Type': contentType
    }
  }).then(data => data.json())
    .then((data) => {
      data.artists.items.map(artistObject => artists.push(artistObject.name));
      doRecursiveFetch(data.artists.next, ((data.artists.total - (data.artists.total % 50)) / 50) - 1);
    });
} else {
  console.log('Please provide a valid OAuth Token.');
}
