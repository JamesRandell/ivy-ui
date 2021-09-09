import { WebSocketServer } from 'ws';
import * as fs from 'fs';
var registry = {
    timeout: null,
    ws: {} // holds the websocket connection
};
var ws = null;
const wss = new WebSocketServer({ port: 8081 });
var returnFile = function (err, data) {
    if (err)
        throw err;
};
var broadcast = function (data) {
    ws.send(data);
};
fs.watch('resource/css', (eventType, filename) => {
    // eventType could be either 'rename' or 'change'. new file event and delete
    // also generally emit 'rename'
    // check if anyone has connected first, otherwise there's no point in push stuff
    if (wss.clients.size === 0)
        return;
    const debounced = debounce(() => {
        // is the file new? has it been deleted? Or has it changed?
        switch (eventType) {
            case 'change':
                // old way to send file contents out
                //filePush('resource/css/' + filename);
                // instead we just send the file name and let the client deal with it
                broadcast(processPush('resource/css/' + filename, 'cssFile'));
        }
    })();
});
fs.watch('resource/script/client', (eventType, filename) => {
    // eventType could be either 'rename' or 'change'. new file event and delete
    // also generally emit 'rename'
    // check if anyone has connected first, otherwise there's no point in push stuff
    if (wss.clients.size === 0)
        return;
    const debounced = debounce(() => {
        // is the file new? has it been deleted? Or has it changed?
        switch (eventType) {
            case 'change':
                // old way to send file contents out
                //filePush('resource/css/' + filename);
                console.log('File changed: ' + filename);
                // instead we just send the file name and let the client deal with it
                broadcast(processPush('resource/script/client/' + filename, 'jsFile'));
        }
    })();
});
const filePush = (file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        let result = processPush(data, 'css');
        returnFile(0, result);
    });
};
function processPush(data, key = 'default') {
    let result = {
        [key]: data
    };
    return JSON.stringify(result);
}
wss.on('connection', function connection(t) {
    ws = t;
    ws.on('message', (message) => {
        console.log('received: %s', message);
        //let string = fs.readFile('index.html', 'utf8', returnFile);
    });
    ws.send(processPush('resource/css/reset.css', 'cssFile'));
    ws.send(processPush('resource/css/debug.css', 'cssFile'));
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
function debounce(callback, wait = 150) {
    return () => {
        const context = this;
        // if more than one call comes in before Xms has run, drop the previous fn call
        clearTimeout(registry.timeout);
        // after Xms, call the debounced fn with the original arguments
        // save timeout as "timer" so we cn cancel it
        registry.timeout = setTimeout(() => callback.apply(context), wait);
    };
}
