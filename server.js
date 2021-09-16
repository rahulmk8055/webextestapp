/**
* This is the main Node.js server script for your project
* Check out the two endpoints this back-end API provides in fastify.get and fastify.post below
*/
const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const moment = require('moment');
const handler = require('./src/handler.js');
const { getStatus, initStatus } = require('./src/status');

const webSocket = new WebSocket.Server({ noServer: true, maxPayload: 16000 });

terminateNonLiveConnection(webSocket);

function terminateNonLiveConnection(hbInterval) {
	webSocket.clients.forEach(function each (ws) {
		if (ws.isAlive === false) {
      clearInterval(ws.timer);
			return ws.terminate();
		}
		ws.isAlive = false;
		ws.ping();
	});
	setTimeout(() => terminateNonLiveConnection(hbInterval), 5 * 1000);
};

webSocket.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
  ws.on('message', async message => {
    message = JSON.parse(message);
    const { method, meetingId, ...args } = message;
    if (!ws.meetingId) {
      ws.meetingId = meetingId;
      initStatus(meetingId);
      ws.timer = setInterval(() => {
        const now = moment().unix();
        const bucket = now - (now % 5);
        ws.send(JSON.stringify({ method, ts: bucket, status: getStatus(meetingId) }));
      }, 5 * 1000);
    }
    console.log("meeting id is "+ meetingId)
    handler[method]({ meetingId, args });
  });
  ws.on('error', (e) => {
    console.log('error', e);
  });
});

const app = express();
app.use('/', express.static('public'));

const server = http.createServer(app);

server.on('upgrade', async (req, socket, head) => {
  webSocket.handleUpgrade(req, socket, head, (ws) => {
    webSocket.emit('connection', ws);
  });
});

server.listen(process.env.PORT || 8000, 'localhost', () => {
  console.info(`Listening to http://localhost:8000`);
});
