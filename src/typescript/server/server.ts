import { WebSocketServer } from 'ws';
import * as fs from 'fs';

//import { Console } from 'console';

import * as http from 'http'
import { stringify } from 'querystring';


const config_http = {
  hostname: 'localhost',
  port: 8080,
  method: 'GET',
  path: '/'
};




var registry = {
  timeout: null, // used for the debounce function and stores the timeout function
  ws: {} // holds the websocket connection
}

var ws = null;
const wss = new WebSocketServer({ port: 8082 });


var returnFile = function (err, data) {
    if (err) throw err;
    
};

var broadcast = function(data) {
  ws.send(data);
};

fs.watch('resource', {recursive:true}, (eventType: string, filePath: string) => {
  

  /**
   * we need to figure out the path, filename and extension so we can pass it to 
   * another method that sends the result back to the client
   */
  const fileArr = library._fileArr(filePath);

  /**
   * don't return server changes to the client!!
   */
  if (fileArr.path === 'server') return;


  // eventType could be either 'rename' or 'change'. new file event and delete
  // also generally emit 'rename'

  // check if anyone has connected first, otherwise there's no point in push stuff
  if (wss.clients.size === 0) return;

  const debounced = debounce( 
    () => {

      // is the file new? has it been deleted? Or has it changed?
      switch (eventType) {
        case 'change' :
          // old way to send file contents out
          //filePush('resource/css/' + filename);

          console.log('File changed: ' + filePath);

          // instead we just send the file name and let the client deal with it
          broadcast( 
            buildJSON('/resource/' + fileArr.path + '/' + fileArr.fileName, fileArr.ext + 'File')
          );
      }
    })();
})

/*
fs.watch('resource/script/client', (eventType: string, filename: string) => {

  // eventType could be either 'rename' or 'change'. new file event and delete
  // also generally emit 'rename'

  // check if anyone has connected first, otherwise there's no point in push stuff
  if (wss.clients.size === 0) return;

  const debounced = debounce( 
    () => {

      // is the file new? has it been deleted? Or has it changed?
      switch (eventType) {
        case 'change' :
          // old way to send file contents out
          //filePush('resource/css/' + filename);
console.log('File changed: ' + filename);
          // instead we just send the file name and let the client deal with it
          //broadcast( 
          //  buildJSON('resource/script/client/' + filename, 'jsFile')
          //);
          //fs.readFile('resource/script/client/' + filename, 'utf8', function(e, result) {
          //  ws.send([{'data':result}], 'js')
          //});
          ws.send(buildJSON('resource/script/client/' + filename, 'jsFile'));
      }
    })();
})
*/

const filePush = (file: string) => {


  fs.readFile(file, 'utf8', 
  (err, data) => {
    let result = buildJSON(data, 'css');
    returnFile(0, result);
  });

};

function buildJSON (data: any, key: string = null) {
  var result: object = {};
  
  if (!key) {
    
    result = {
      'payload': data
    };

  } else {
    
    result = {
      'payload': {
        [key]: data
      }
    };
    
  }

  return JSON.stringify(result);
}



wss.on('connection', function connection(t) {
  ws = t; 
  console.log('Client connected');

  ws.on('message', (message: any) => {

    //console.log('received: %s', message);
    try {
      message = JSON.parse(message);
    } catch {
      console.log('Received string. Stopping processing: %s', message);
      return;
    }

    if (!message) return;
    /**
     * we use the key 'payload' to transmit and receive instructions. Along side the payload key
     * will be other keys we can use to identify the validity of the sender
     */ 
    if (message.hasOwnProperty('payload')) {

      console.log('Recieved payload...');

      /**
       * loop through the payload keys. We then test if the key is a string and try to run the function in our 'library'
       */
      var keys = Object.keys(message.payload),
        len = keys.length,
        i = 0,
        cmd: string;

      while (i < len) {
        cmd = keys[i];

        if (typeof cmd === 'string') {
          console.log('Running \''+cmd+'\' with \''+message.payload[cmd]+'\'');

          library[ cmd ]( message.payload[cmd] );
        }

        i += 1;
      }
    }
  });

  ws.send(
    buildJSON('/resource/css/debug.css', 'cssFile')
  );
});


var library = {

  /**
   * Our private (lol) function to split apart variase file components to return the path 
   * to the file, file name, and extension
   * 
   * @param flePath accepts path to a file, including the file name.
   */
  _fileArr (filePath: string) {


    let result: any = {
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
    result.fileName = fileArray[fileArray.length-1];

    // remove the filename.ext so we're just left with the path components
    fileArray.pop();

    // join all the parts seperated by a slash (/) so we combine our full path
    result.path = fileArray.join('/');

    /**
     * this returns all the parts after the first dot (.) incase we have a multi . extenion. We then strip the dots out.
     */
    result.ext = result.fileName.substr(result.fileName.indexOf('.')+1, 100).replace('.', '');


    /**
     * returns just the filename with out extension for our re-write rules
     */
    result.fileNameShort = result.fileName.replace('.' + result.ext, '');

    return result;
  },
  
  test () {

  },
  
  newImproved () {
    console.log('newImproved');
  },

  bringMeTheDOM () {
    fs.readFile('resource/script/server/dom.json', 'utf8', function(e, result) {
        ws.send(result, 'DOM')
    });
  },

  file (file: string) {

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
      ws.send(
        buildJSON({html:{data:result,file:file}})
      )

      
    });*/

    /**
     * We use the web server to handle file requests instead of pissing about with building our 
     * own (because you know, I really think nginx can de better than what I can come up with.)
     * 
     * We make an HTTP call, but we also tinker with the file url returns to account for re-write
     * rules we may have in place
     */
    config_http.path = file;
    const req = http.request(config_http, res => {
      res.setEncoding('utf8');

      if (res.statusCode < 200 || res.statusCode >= 300) {
        buildJSON({html: {
                            data:null,
                            file:file,
                            statuscode: res.statusCode
                          }
                  });
        return;
      }

      res.on('data', result => {

        // return just the file name for our rewrite rules
        //file = this._fileArr(file).fileNameShort;
        console.log('Returning file: ' + file);
        ws.send(
          buildJSON({html:{
                            data:result,
                            file:file,
                            statusCode: res.statusCode
                          }
                    })
        );
      })
    })
    req.on('error', err => {
      console.error(err)
    })
    
    req.end()

  }
}
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

function debounce (callback: any, wait: number = 150) {

  return () => {
    const context = this;

    // if more than one call comes in before Xms has run, drop the previous fn call
    clearTimeout(registry.timeout);

    // after Xms, call the debounced fn with the original arguments
    // save timeout as "timer" so we cn cancel it
    registry.timeout = setTimeout(() => callback.apply(context), wait);
  };
}