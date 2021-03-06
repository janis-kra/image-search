const MongoClient = require('mongodb').MongoClient;
const express = require('express');
const googleImages = require('google-images');
let config;
try {
  config = require('./searchengine');
} catch (e) {
  // try to use env variables
  config = {};
}
const app = express();
const PORT = process.env.PORT || 8084;
const CSE_ID = process.env.CSE_ID || config.searchEngineId;
const API_KEY = process.env.API_KEY || config.apiKey;
const dbCredentials = {
  login: process.env.DB_LOGIN || '',
  url: process.env.DB_URL || 'localhost:27017',
  name: process.env.DB_NAME || 'imagesearch'
}
const databaseUrl = 'mongodb://' +
  dbCredentials.login + '@' +
  dbCredentials.url + '/' +
  dbCredentials.name;

let searchCollection;

MongoClient.connect(databaseUrl, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', databaseUrl);
    searchCollection = db.collection('searchCollection');
  }
});

const google = googleImages(CSE_ID, API_KEY);

/* Database and Searching */

const saveSearch = (query) => {
  const search = {
    term: query,
    when: Date.now()
  };
  searchCollection.insert(search);
};

const imageSearch = (query, page = 0) => {
  saveSearch(query);
  return google.search(query, { page: page });
};

const latest = () => {
  return new Promise((resolve, reject) => {
    searchCollection.find({}).toArray((err, docs) => {
      if (err) {
        reject(err);
      } else {
        resolve(docs
          .sort((a, b) => b.when - a.when)
          .splice(0, 10)
          .map((doc) => {
            return { term: doc.term, when: doc.when };
          })
        );
      }
    });
  });
};

/* Routing */

app.get('/', (req, res) => res.send('Usage: /imagesearch and /latest/imagesearch'));

app.get('/imagesearch/:query', (req, res) => {
  imageSearch(req.params.query, req.query.page).then((images) => {
    res.json(JSON.stringify(images));
  }).catch((error) => {
    res.error(error);
  });
});

app.get('/latest/imagesearch', (req, res) => {
  latest().then((searches) => {
    res.json(JSON.stringify(searches));
  }).catch((error) => {
    res.error(error);
  });
});

app.listen(PORT, () => {
  console.log('Image service running on port ' + PORT);
});
