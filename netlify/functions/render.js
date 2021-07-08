'use strict'; 
const express = require('express');
const serverless = require('serverless-http');
const app = express();
const axios = require('axios')
const morgan = require('morgan');

const XDAI_SUBGRAPH_URL = process.env.REACT_APP_XDAI_SUBGRAPH_URL;
const MAINNET_SUBGRAPH_URL = process.env.REACT_APP_MAINNET_SUBGRAPH_URL;

async function getLayerTokens(eventId, url) {
  const res = await axios.post(url, JSON.stringify({
      query: `
        {
          event(id: "${eventId}"){
            tokenCount
          }
        }
        `
		}));
	return res;
}

async function getxDaiTokens(eventId) {
  return getLayerTokens(eventId, XDAI_SUBGRAPH_URL);
}

async function getMainnetTokens(eventId) {
	return getLayerTokens(eventId, MAINNET_SUBGRAPH_URL);
}

async function fulfillWithTimeLimit(timeLimit, task, failureValue){
  let timeout;
  const timeoutPromise = new Promise((resolve, reject) => {
      timeout = setTimeout(() => {
          resolve(failureValue);
      }, timeLimit)
  });
  const response = await Promise.race([task, timeoutPromise]);
  if(timeout){ //the code works without this but let's be safe and clean up the timeout
      clearTimeout(timeout);
  }
  return response;
}

function dectectBot(userAgent) {
  const bots = [
    'bingbot',
    'yandexbot',
    'duckduckbot',
    'slurp',
    'twitterbot',
    'facebookexternalhit',
    'linkedinbot',
    'embedly',
    'baiduspider',
    'pinterest',
    'slackbot',
    'vkShare',
    'facebot',
    'outbrain',
    'W3C_Validator',
    'whatsapp',
    'telegrambot',
    'discordbot'
  ];
  const agent = userAgent.toLowerCase();
  console.log(agent, 'agent');
  for (const bot of bots) {
    if (agent.indexOf(bot) > -1) {
      console.log('bot detected', bot, agent);
      return true;
    }
  }

  console.log('no bots found');
  return false;
}

const getEvent = async (id) => {
  try {
    return await axios.get('https://api.poap.xyz/events/id/'+id)
  } catch (error) {
    console.error(error)
  }
}

const router = express.Router();
router.get('/', async (req, res) => {
  const isBot = dectectBot(req.headers['user-agent']);
  const eventId = req.baseUrl.split('/')[2];

  if (isBot) {
    const event = await getEvent(eventId);

    const { data } = event;

    const [xdai, main] = await Promise.all([fulfillWithTimeLimit(1000, getxDaiTokens(eventId), null), await fulfillWithTimeLimit(1000, getMainnetTokens(eventId), null)])

    let tokenCount = 0;
    let description = data.description;

    if (xdai && xdai.data && xdai.data.data && xdai.data.data.event) {
      tokenCount+=parseInt(xdai.data.data.event.tokenCount, 10)
    }

    if (main && main.data && main.data.data && main.data.data.event) {
      tokenCount+=parseInt(main.data.data.event.tokenCount, 10)
    }

    if (tokenCount > 0) {
      description = '[ Supply: ' + tokenCount + ' ] ' + description;
    }

    if (data) {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.write(`
      <!doctype html>
      <head>
            <title>POAP Gallery</title>
            <meta name="title" content="${data.name}">
            <meta name="description" content="${description}">
            <meta property="og:type" content="article">
            <meta property="og:site_name" content="POAP Gallery">
            <meta property="og:title" content="${data.name}">
            <meta property="og:description" content="${description}">
            <meta property="og:image" content="${data.image_url}">
            <meta property="og:image:height" content="200">
            <meta property="og:image:width" content="200">
            <meta property="twitter:card" content="summary">
            <meta property="twitter:site" content="@poapxyz">
            <meta property="twitter:title" content="${data.name}">
            <meta property="twitter:description" content="${description}">
            <meta property="twitter:image" content="${data.image_url}">
      </head>
      <body>
        <article>
          <div>
            <h1>${data.name}</h1>
          </div>
          <div>
            <p>${description}</p>
          </div>
        </article>
      </body>
      </html>`);
      res.end();
    } else {
      res.redirect('http://' + req.hostname)
    }
  } else {
    res.redirect('http://' + req.hostname + '/r/event/' + eventId)
  }
});
app.use(morgan(function (tokens, req, res) {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ].join(' ')
}))
app.use(['/.netlify/functions/render/*', '/.netlify/functions/render/','/.netlify/functions/render/event/*', '/event/*', '/render/*'], router);  // path must route to lambda

module.exports.handler = serverless(app);



