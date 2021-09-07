import { WebSocketServer } from 'ws';
import * as fs from 'fs';
var ws = null;
var returnFile = function (err, data) {
    if (err)
        throw err;
    console.log(data);
    ws.send(data);
};
const wss = new WebSocketServer({ port: 8081 });
wss.on('connection', function connection(t) {
    ws = t;
    ws.on('message', (message) => {
        console.log('received: %s', message);
        let string = fs.readFile('index.html', 'utf8', returnFile);
    });
    ws.send('something!!');
});
/*
wss.on('connection', (ws: WebSocket) => {

    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {

        //log the received message and send it back to the client
        console.log('received: %s', message);
        ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server');
});
*/ 
