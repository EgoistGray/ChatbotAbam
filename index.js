'use strict';

// Import all libraries
const line = require('@line/bot-sdk');
const express = require('express');
const chatbot = require('./lib/bot.js');
const path = require('path');

// Construct Chatbot Instances
let bot = new chatbot();

// create LINE SDK config from env variables
const config = {
    channelAccessToken: "/+pSt6W5v64okfj0XQ8MnkhLW7QSDesdY0yOKX/iZbE7BKisDUO41O+GDKQaZzwmZjKTYt4AbKvw6WN1tckedtsgVqAiiwAvQqezwZ/fQg06EHZ/qojJ7Uo5MVL388JtSieqpYcjBsZ7P69Xdw/PEAdB04t89/1O/w1cDnyilFU=",
    channelSecret: "f3e08d975b3cd57051f8aeae76ca4677"
}

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
line.middleware(config);
app.post('/callback', line.middleware(config), (req, res) => {
  console.log(req.body.event);
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});
app.get('/getDatabase', (req, res) => {
  res.sendFile(path.join(__dirname, './database.txt'));
  res.setHeader('Content-type', 'application/json');
  return;
});
app.get('/database', (req, res) => {
  res.send(bot.currentDatabase);
  return 200;
});

app.use(require('body-parser').json());
app.post('/updateDatabase', (req, res) => {
  // If there is no task send
  if(Object.keys(req.body) === 0) return;
  // Otherwise update the database
  console.log(req.body);
  bot._updateDatabase(req.body);
  
  return 200;
});
app.post('/broadcast', (req, res) => {
  bot.broadcastSchedule();
  res.sendStatus(200);
  return 200;
});

app.use('/', express.static('manager'));

// event handler
function handleEvent(event) {
  bot.setGlobal(client,event);
  if(event.type === 'follow'){
    bot.subscribe(event.source.userId, client);
  }
  if(event.type === 'unfollow'){
    bot.unsubscribe(event.source.userId, client);
  }

  if (event.type !== 'message' || event.message.type !== 'text') {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  // Chatbot processing
  bot.process(client, event);
  
  // return good condition
  return 200;
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
