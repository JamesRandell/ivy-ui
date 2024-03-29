import WebSocket, { WebSocketServer, Server } from 'ws';
import * as fs from 'fs';
import { createServer } from 'https';
import * as path from 'path';



//import { Console } from 'console';

import { stringify } from 'querystring';


const config_http = {
  hostname: 'localhost',
  port: 8080,
  method: 'GET',
  path: '/',
  template_directory: '/ui',
  headers: {}
}; 

const key = fs.readFileSync('../ivy-build/cert/server.key', 'utf8');
const cert = fs.readFileSync('../ivy-build/cert/server.crt', 'utf8');

//var httpsServer = createServer({key, cert});
//httpsServer.listen(8443);


var registry = {
  timeout: null, // used for the debounce function and stores the timeout function
  ws: {} // holds the websocket connection
}

var ws = null;
const wss = new WebSocketServer({ port: 8082 }); 
//const wss = new WebSocketServer({ server: httpsServer });


var returnFile = function (err, data) {
    if (err) throw err;
    
};

var broadcast = function(data) {
  
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
  
  //wss.send(data); 
};



const ivyWatch = (eventType: string, filePath: string) => {
  
  if (!filePath) {
    return
  }

  if (filePath.includes('\\') !== true) {
    //return 
  }

  //let fileArr = library._fileArr(filePath);

  
  /**
   * we need to figure out the path, filename and extension so we can pass it to 
   * another method that sends the result back to the client
   */
  

  /**
   * don't return server changes to the client!!
   */
  //if (fileArr.path == null) return;


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
          const fileArr = library._fileArr(filePath);
          console.log(fileArr)

          /**
           * only push changes if they exist in these paths
           */
          if (['ui','resource'].indexOf(fileArr.pathFirst) < 0) {
            console.log('ui or resource not found')
            return;
          }
          
          console.log('File changed: ' + filePath);


          if (fileArr.isTemplate === true) {
            /**
             * this allows us to 'push' the contents of the changed file back through the websocket
             * The ui will update itself with the new path/content
             */
            //library['file'](name.replace('ui/', '/')).then((result) => {
            library['file'](fileArr.path + '/' + fileArr.fileNameShort).then((result) => {
              broadcast(buildJSON(result));
            });
            
          } else if (fileArr.isResource === true) {
            broadcast( 
              buildJSON(fileArr.pathFull, fileArr.ext + 'File')
            );
          }
      }
    })();
}

fs.watch('.', {recursive:true}, ivyWatch);

const readFile = (file: string) => {

  fs.readFile(path.resolve() + file, 'utf8', (err, data) => {
    library[ file ]( data ).then((result) => {
      ws.send(buildJSON(result));
    });
    
    
  });
}

const filePush = (file: string) => {

  fs.readFile(file, 'utf8', 
  (err, data) => {
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
function buildJSON (data: any, key: string = null) {
  var result: object = {};

  /**
   * check if 'data' is already JSON, if not then stringify
   */
  try {
    data = JSON.parse(data);
  } catch(e) {
  
  }

  /**
   * see if we have a key and attach the data to it
   */
  if (!key) {
    
    result = {
      'payload': data
    };

  } else {
    
    result = {
      'payload': data,
      'key': key

    };
    
  }

  return JSON.stringify(result);
  
}


wss.on('connection', ws => {
  //ws = t;
  console.log('Client connected');

  ws.on('message', (message: any) => {

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
          
          if (library[cmd] === undefined) {
            console.log('"' + cmd + '" not found in server library, ignoring request');
            return;
          }
          

          library[ cmd ]( message.payload[cmd]).then((result) => {
            if (message.hasOwnProperty('key')) {
              ws.send(buildJSON(result, message.key));
            } else {
              ws.send(buildJSON(result));
            }
          });
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
   * @param filePath accepts path to a file, including the file name.
   */
  _fileArr (filePath: string) {
    let result: any = {
      fileName: null,
      fileNameShort: null,
      pathFull: String,
      isTemplate: Boolean,
      isWidget: Boolean,
      isApi: Boolean,
      isResource: Boolean,
      path: null,
      pathFirst: String,
      ext: null
    };

    
    filePath = filePath.replace(/\\/g, "/")

    filePath = (filePath.startsWith('/') == true) ? filePath.slice(1, filePath.length) : filePath

    result.isTemplate = false
    result.isWidget = false
    result.isApi = false
    result.isResource = false
    result.pathFull = '/' + filePath;


    /**
     * we need to figure out the path, filename and extension so we can pass it to 
     * another method that sends the result back to the client
     */
    let fileArray = filePath.split('/');

    /**
     * first element will be empty because the split action above looks at the '/'
     */
    if (fileArray[0] === '') {
      fileArray.shift();
    }

    const fileArrayLength = fileArray.length;

    // forward slash here as it's a webserver path
    result.fileName = fileArray[fileArrayLength-1];

    /**
     * remove the filename.ext so we're just left with the path components
     * 
     * This means fileArray could be empty if only a filename was passed in
     */
    fileArray.pop();

    /**
     * we check if one of the path directories contains a keyword, except the filename (last part)
     */
    let i = 0, len = fileArrayLength-1
    while (i < len) {
      switch (fileArray[i]) {
        case 'widget' : result.isWidget = true;
                        break;
        case 'api'    : result.isApi = true;
                        break        
      }

      i++
    }

    /**
     * this returns all the parts after the first dot (.) incase we have a multi . extenion. We then strip the dots out.
     */
    result.ext = result.pathFull.substr(result.pathFull.indexOf('.')+1, 100).replace('.', '');

    /**
     * returns just the filename with out extension for our re-write rules
     */
    result.fileNameShort = result.fileName.replace('.' + result.ext, '');

    
     
    if (['resource'].indexOf(result.ext) >= 0) {
      result.isResource = true;
    }

    result.pathFirst = fileArray[0];

    result.path = '/' + fileArray.join('/');
    switch (fileArray[0]) {
      case 'resource' :   result.isResource = true;
                          break;
      case 'ui'       :   result.isTemplate = true;
                          return result
                          break;
      case 'src'      :   return result  
    }

    if (fileArray.length === 0) {
      result.pathFull = null
      return result
    }
    if (result.isApi === false && result.isResource === false) {
      result.isTemplate = true;
      //fileArray.unshift('ui')
      //result.pathFull = ('/ui/' + result.pathFull).replace('//', '/');
      result.pathFull = result.pathFull.replace('//', '/');
    }
    // join all the parts seperated by a slash (/) so we combine our full path
    result.path = '/' + fileArray.join('/');
  
    

    return result;
  },

  
  newImproved () {
    console.log('newImproved');
  },

  bringMeTheDOM () {
    fs.readFile('resource/script/server/dom.json', 'utf8', function(e, result) {
        return {data: result, key: 'DOM'};
    });
  },

  async url (url: string) {

    const fileArr = this._fileArr(url)

    /**
     * requests from the front end will either be looking for an actual file, or something in the ui directory
     * thing is, things in the ui directory are typically linked with out calling the ui
     * I.e. /index is actually /ui/index
     * We look out for specific paths and ignore those, only prepaending whats left with ui
     */
    if (['api','resource'].indexOf(fileArr.pathFirst) < 0) {
      return this.file('/ui' + url)
    }
    
    return this.file(url)
  },

  async file (file: string) {

    /**
     * basic check to see if the path a string
     */
    if (typeof file !== 'string') {
      console.warn('Filepath is not a string, cancelling call to file');
      return;
    }

    const fileAttributes = this._fileArr(file)
    
    /**
     * we can use the _fileArr private function to find out the first path part of the url
     * we can do different things if it matches specific directories
     * 
     * we do some funky stuff with the file. BEar in mind that the file that's being requested 
     * may not be the true path of where the source is.
     * For example, in this project, I keep all my templates in a /ui folder. However, on the 
     * front end, they don't reference that, and it's down to this server to prefix those requests 
     * with /ui.
     * This means the file is actually different, and we want to return the right one back to the 
     * front end for the router to function correctly (change the url etc)
     */
    config_http.path = fileAttributes.pathFull



    /**
     * We use the web server to handle file requests instead of pissing about with building our 
     * own (because you know, I really think nginx can do better than what I can come up with.)
     * 
     * We make an HTTP call, but we also tinker with the file url returns to account for re-write
     * rules we may have in place
     */
    return new Promise ((resolve, reject) => {
      config_http.headers = {
        'Content-Type': 'application/json'
      };

      const req = http.request(config_http, (res) => {
      let data = [];

        console.log(`STATUS: ${res.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        res.setEncoding('utf8');

        let returnObject = {
          data: null,
          file: null,
          fileSrc: null,
          statuscode: null,
          url: null
        };

        returnObject.statuscode = res.statusCode
        returnObject.file = file
        returnObject.fileSrc = config_http.path
        
        /**
         * Takes care of any errors like a 404
         */
        if (res.statusCode < 200 || res.statusCode >= 300) {
          resolve({html: returnObject });
        }


        /**
         * returns the file contents
         */
        res.on('data', (chunk) => {
            data.push(chunk);
            /**
             * when the result is pure JSON, send back just a data key, and don't instruct the UI to change the url
             * need to manually parse the result this time
             */
            
        });

        res.on('end', () => {
          let result = data.join('')
          if (res.headers['content-type'].startsWith('application/json')) {
            console.log('this is JSON')
            try {
              resolve({data:JSON.parse(result)});
            } catch (e) {
              console.log(result)
              console.log('Failed: ', e);
            }
          } else if (fileAttributes.isWidget === true) {
            console.log('isWidget')
            returnObject.data = result
            resolve({html:returnObject});
          } else if (fileAttributes.isTemplate === true) {
            console.log('isTemplate')
            returnObject.url = file.replace('/ui', '')
            returnObject.data = result
            resolve({html:returnObject});
          }
        });
      });
      
      req.on('error', err => {
        console.error(err)
      })
      
      req.end();

    });
  }
}


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


/* test code for server side db scripts */
import * as http from 'http'
import * as url from 'url'
import { isBooleanObject } from 'util/types';

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
      } catch (err) {
        console.log(`Can't parse POST data: ${err}`);
        return;
      }


      if (urlPathArr[0] == 'db' && urlPathArr[1] == 'cassandra') {
        body["invoke"] = 'cassandra';
      }

      wss.clients.forEach(function each(client) {
        client.send(
          buildJSON(body, 'db')
        );
     });

    });  
  }
    
  
}; 


const server2 = http.createServer(requestListener);
server2.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
/* end server side db code */


