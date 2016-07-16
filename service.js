const MongoClient = require('mongodb').MongoClient;
const express = require('express');

const app = express();
const PORT = process.env.PORT || 8084;
const databaseUrl = 'mongodb://localhost:27017/imagesearch';

MongoClient.connect(databaseUrl, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url);
  }
});

app.get('/', (req, res) => res.send('Usage: /imagesearch and /latest/imagesearch'));

app.get('/imagesearch/:query', (req, res) => {
  res.send('not yet implemented');
});

app.get('/latest/imagesearch', (req, res) => {
  res.send('not yet implemented');
});

app.listen(PORT, () => {
  console.log('Image service running on port ' + PORT);
});
