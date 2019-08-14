'use strict';

// Import all libraries
const line = require('@line/bot-sdk');
const express = require('express');
const chatbot = require('./lib/bot');

// Construct Chatbot Instances
let bot = new chatbot();

// create LINE SDK config from env variables
const config = {
    channelAccessToken: "Lzt8NjJ6tjr9wHnkaI6J3CVo9YOH+Dgjtpdf0aOcdz2p7SPvdkWVKRmwrHtE4h122F26VQ0QCNeHC5VpaE+YRyB2wrJ44Scy7Gw4XCnQLegksp5O7Wn770IsuGwuu0jlFgx1xwgRfly2w1BLRuu1DwdB04t89/1O/w1cDnyilFU=",
    channelSecret: "bb3bea559d5ffdb9b31c36b5c30d7044"
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

// event handler
function handleEvent(event) {

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
