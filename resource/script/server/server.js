var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { WebSocketServer } from 'ws';
import * as fs from 'fs';
import * as path from 'path';
const config_http = {
    hostname: 'localhost',
    port: 8080,
    method: 'GET',
    path: '/'
};
const key = fs.readFileSync('../ivy-build/cert/server.key', 'utf8');
const cert = fs.readFileSync('../ivy-build/cert/server.crt', 'utf8');
//var httpsServer = createServer({key, cert});
//httpsServer.listen(8443);
var registry = {
    timeout: null,
    ws: {} // holds the websocket connection
};
var ws = null;
const wss = new WebSocketServer({ port: 8082 });
//const wss = new WebSocketServer({ server: httpsServer });
var returnFile = function (err, data) {
    if (err)
        throw err;
};
var broadcast = function (data) {
    wss.clients.forEach(function each(client) {
        client.send(data);
    });
    //wss.send(data); 
};
const ivyWatch = (eventType, filePath) => {
    if (filePath.includes('\\') !== true) {
        return;
    }
    const basePath = filePath.split('\\')[0];
    if (['resource', 'ui'].indexOf(basePath) < 0) {
        return;
    }
    /**
     * we need to figure out the path, filename and extension so we can pass it to
     * another method that sends the result back to the client
     */
    const fileArr = library._fileArr(filePath);
    /**
     * don't return server changes to the client!!
     */
    if (fileArr.path === 'server')
        return;
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
                console.log('File changed: ' + filePath);
                /**
                 * replaceAll doesn't exist in the lib of typescript i'm using, so can't use it
                 * here is a regexp instead
                 */
                let name = fileArr.fileNameShort.replace(/["\\]/g, '/');
                let ext = fileArr.ext;
                let path2 = (fileArr.path == 0) ? '' : '/' + fileArr.path;
                // instead we just send the file name and let the client deal with it
                if (basePath == 'ui') {
                    let file = path2 + '/' + name + '.' + ext;
                    /**
                     * this allows us to 'push' the contents of the changed file back through the websocket
                     * The ui will update itself with the new path/content
                     */
                    library['file'](name.replace('ui/', '/')).then((result) => {
                        broadcast(buildJSON(result));
                    });
                }
                else {
                    broadcast(buildJSON(path2 + '/' + name + '.' + ext, ext + 'File'));
                }
        }
    })();
};
fs.watch('.', { recursive: true }, ivyWatch);
const readFile = (file) => {
    fs.readFile(path.resolve() + file, 'utf8', (err, data) => {
        library[file](data).then((result) => {
            ws.send(buildJSON(result));
        });
    });
};
const filePush = (file) => {
    fs.readFile(file, 'utf8', (err, data) => {
        let result = buildJSON(data, 'css');
        returnFile(0, result);
    });
};
/**
 * Takes an input and returns JSON as output. If the input is
 * already JSON it just returns it with no error
 *
 * @param data The value to JSONify
 * @param key Set the value once we've conveted to JSON to this key
 * @returns JSON response
 */
function buildJSON(data, key = null) {
    var result = {};
    /**
     * check if 'data' is already JSON, if not then stringify
     */
    try {
        data = JSON.parse(data);
    }
    catch (e) {
    }
    /**
     * see if we have a key and attach the data to it
     */
    if (!key) {
        result = {
            'payload': data
        };
    }
    else {
        result = {
            'payload': {
                [key]: data
            }
        };
    }
    return JSON.stringify(result);
}
wss.on('connection', ws => {
    //ws = t;
    console.log('Client connected');
    ws.on('message', (message) => {
        try {
            message = JSON.parse(message);
        }
        catch (_a) {
            console.log('Received string. Stopping processing: %s', message);
            return;
        }
        if (!message)
            return;
        /**
         * we use the key 'payload' to transmit and receive instructions. Along side the payload key
         * will be other keys we can use to identify the validity of the sender
         */
        if (message.hasOwnProperty('payload')) {
            console.log('Recieved payload...');
            /**
             * loop through the payload keys. We then test if the key is a string and try to run the function in our 'library'
             */
            var keys = Object.keys(message.payload), len = keys.length, i = 0, cmd;
            while (i < len) {
                cmd = keys[i];
                if (typeof cmd === 'string') {
                    console.log('Running \'' + cmd + '\' with \'' + message.payload[cmd] + '\'');
                    library[cmd](message.payload[cmd]).then((result) => {
                        ws.send(buildJSON(result));
                    });
                }
                i += 1;
            }
        }
    });
    ws.send(buildJSON('/resource/css/debug.css', 'cssFile'));
});
var library = {
    /**
     * Our private (lol) function to split apart variase file components to return the path
     * to the file, file name, and extension
     *
     * @param flePath accepts path to a file, including the file name.
     */
    _fileArr(filePath) {
        let result = {
            fileName: null,
            fileNameShort: null,
            path: null,
            ext: null
        };
        /**
         * we need to figure out the path, filename and extension so we can pass it to
         * another method that sends the result back to the client
         */
        let fileArray = filePath.split('/');
        // forward slash here as it's a webserver path
        result.fileName = fileArray[fileArray.length - 1];
        // remove the filename.ext so we're just left with the path components
        fileArray.pop();
        // join all the parts seperated by a slash (/) so we combine our full path
        result.path = fileArray.join('/');
        /**
         * this returns all the parts after the first dot (.) incase we have a multi . extenion. We then strip the dots out.
         */
        result.ext = result.fileName.substr(result.fileName.indexOf('.') + 1, 100).replace('.', '');
        /**
         * returns just the filename with out extension for our re-write rules
         */
        result.fileNameShort = result.fileName.replace('.' + result.ext, '');
        return result;
    },
    test() {
    },
    newImproved() {
        console.log('newImproved');
    },
    bringMeTheDOM() {
        fs.readFile('resource/script/server/dom.json', 'utf8', function (e, result) {
            return { data: result, key: 'DOM' };
        });
    },
    file(file) {
        return __awaiter(this, void 0, void 0, function* () {
            /**
             * basic check to see if the path a string
             */
            if (typeof file !== 'string') {
                console.warn('Filepath is not a string, cancelling call to file');
                return;
            }
            /**
             * TODO: add in more checks to see if the file does exist and is of type html (and
             * not like a fucking config or password file)
             *
             * Note this is the file system way to get files. The method below is the webserver way
             * which is currenlty powered by NGINX and has re-write rules on it
             */
            /*
            fs.readFile(path.resolve(__dirname, file), 'utf8', function(e, result) {
              if (e) {
                console.log(e);
                return
              }
        
              console.log('Returning file: ' + file);
              conn.send(
                buildJSON({html:{data:result,file:file}})
              )
        
              
            });*/
            /**
             * We use the web server to handle file requests instead of pissing about with building our
             * own (because you know, I really think nginx can do better than what I can come up with.)
             *
             * We make an HTTP call, but we also tinker with the file url returns to account for re-write
             * rules we may have in place
             */
            config_http.path = '/ui' + file;
            return new Promise((resolve, reject) => {
                const req = http.request(config_http, res => {
                    res.setEncoding('utf8');
                    /**
                     * Takes care of any errors like a 404
                     */
                    if (res.statusCode < 200 || res.statusCode >= 300) {
                        resolve({ html: {
                                data: null,
                                file: config_http.path,
                                statuscode: res.statusCode
                            }
                        });
                    }
                    /**
                     * returns the file contents
                     */
                    res.on('data', result => {
                        console.log('Returning file: ' + config_http.path);
                        resolve({ html: {
                                data: result,
                                file: config_http.path,
                                statusCode: res.statusCode
                            }
                        });
                    });
                });
                req.on('error', err => {
                    console.error(err);
                });
                req.end();
            });
        });
    }
};
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
/* test code for server side db scripts */
import * as http from 'http';
import * as url from 'url';
const host = 'localhost';
const port = 8888;
const requestListener = function (req, res) {
    res.writeHead(200);
    res.end("");
    var urlPath = url.parse(req.url);
    var urlPathArr = urlPath.path.split('/');
    if (req.method == 'POST') {
        console.log('Incomming POST request');
        var body = '';
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
            try {
                body = JSON.parse(body);
            }
            catch (err) {
                console.log(`Can't parse POST data: ${err}`);
                return;
            }
            if (urlPathArr[0] == 'db' && urlPathArr[1] == 'cassandra') {
                body["invoke"] = 'cassandra';
            }
            wss.clients.forEach(function each(client) {
                client.send(buildJSON(body, 'db'));
            });
        });
    }
};
const server2 = http.createServer(requestListener);
server2.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
/* end server side db code */
