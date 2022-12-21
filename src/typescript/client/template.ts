var template = {


    parse: (templateString: string) => { //, data: object) => {

        let result = /{{(.*?)}}/g.exec(templateString);
        const arr = [];
        let firstPos;  

        
        while (result) {
            firstPos = result.index;
            if (firstPos !== 0) {
                arr.push(templateString.substring(0, firstPos));
                templateString = templateString.slice(firstPos);
            }
            
            arr.push(result[0]);
//.replace(/\s/g, "-")
            templateString = templateString.slice(result[0].length);
            result = /{{(.*?)}}/g.exec(templateString);
        }

        if (templateString) arr.push(templateString);

        return template._compileToString(arr); //, data);

    },

    /**
     * increments and decrements a counter every time we enter and exit a loop (#each command)
     */
    loopDepth: 0,
        
    /**
     * Stores the loop stack. If we enter two loops for example, we will have 2 items in this array. We store the key here
     */
    loopArray: [],

    
    /**
     * 
     * @param templateArray Array of broken up string parts that make up the template. Each word, or section is it's own array entry
     * @param data          Data to apply to the template
     * @returns 
     */
    _compileToString: (templateArray: any) => { //}, data: object = {}) => {
        let fnStr = '';

        /**
         * As we loop through the template looking for {{...}}, some of these may be commands, such as 
         * #EACH or #LOOP. 
         * When we find these, we need to store the name of the array and use it to build up the inner 
         * values
         */



        /**
         * Updated variable names to make it easier to figure out what holds what
         * This can be quite verbose!
         */

        
        




        /**
         * Hold a command string. Helper functions, such as lowercase or uppercase: {{uppercase|value}}
         */
        var helperCommand:string = "";



        templateArray.flatMap(string => {

            helperCommand = ''
            // checking to see if it is an interpolation
            if (string.startsWith("{{") && string.endsWith("}}")) {

                var stringTrim: string = string.replace("{{", "").replace("}}", "").trim();
                var args: any[] = [];
                var fn: string = null;
                var command: string = stringTrim.split(" ")[0];
                var commandPrefix: string = '';

                /**
                 * see if there is a function on the end of this command split by a pipe (|) (command|function)
                 */
                if (stringTrim.indexOf('|') > 0) {
                    let tempArray = stringTrim.split("|");
                    command = tempArray[0].split(" ")[0];
                    stringTrim = tempArray[0]
                    fn = tempArray[1];
                }

                let tempArray = stringTrim.split(" ")
                if (tempArray.length > 1) {
                    args.push(tempArray[1])
                }

                /**
                 * test if this is a start or end command
                 * remove the special car with slice before we call the function too
                 */
                if (command.indexOf("#") >= 0) {
                    commandPrefix = 'start_'
                    command = command.substring(1)
                } else if (command.indexOf("/") >= 0) {
                    commandPrefix = 'end_'
                    command = command.substring(1)
                }

                let tempString:string = ''
                try {
                    tempString = template['_command_'+commandPrefix+command](args, fn);
                } catch(e) {
                    /**
                     * there is no template function, so fall back on to guessing it's a manuall key name
                     */
                    args.unshift(command);
                    console.log('No command: _command_' + commandPrefix+command, fn)
                    tempString = template._keyOrValue(args, fn);
                }

                if (tempString) {
                    fnStr += tempString
                }
            } else {
                fnStr += string
            }
        });

        return fnStr;
    },


    /**
     * 
     * @param args If empty then it's a basic loop. If it has an item in it then that's the name of the array we need to loop
     */
    _command_start_each: (args: string[] = [], fn: any = null) => {
        template.loopDepth++
        var currentLoopName = template._getCurrentLoopName();
        const currentKeyName = template._getCurrentLoopKey();
        const currentValueName = template._getCurrentLoopValue();

        /**
         * the last argument will always be the name of a function. If it's null, then discard it
         */
        if (fn !== null) {
            try {
                fn*2;
                currentLoopName =  `Object.values(${currentLoopName})[${fn}]`;
            } catch(e) {
                // do nothing
            }
        }

        /**
         * If empty, then just create the standard loop over the initial data array
         * This means there was no path to an item passed in
         */
        if (args.length === 0) {
            return `\$\{Object.entries(${currentLoopName}).map(([${currentKeyName}, ${currentValueName}]) => \``;
        }

        /**
         * if it has one item, then this is the name of the array we need to loop over
         */
        return `\$\{Object.entries(${currentLoopName}.${args[0]}).map(([${currentKeyName}, ${currentValueName}]) => \``;
    },

    _command_end_each: (cmd: string[] = [], fn: any = null) => {
        template.loopDepth--

        return `\`.trim()).join('')\}`;
    },

    _command_key: (fn: any) => {
        const currentLoopName = template._getCurrentLoopName();
        const currentKeyName = template._getCurrentLoopKey();
        
        return `\$\{${currentKeyName}\}`;
    },

    _command_value: (fn: any) => {
        const currentLoopName = template._getCurrentLoopName();
        const currentValueName = template._getCurrentLoopValue();
        
        return `\$\{${currentValueName}\}`;
    },

    _keyOrValue: (args: string[] = [], fn: any = null) => {
        let currentValueName = template._getCurrentLoopValue();

        if (currentValueName == '') {
            currentValueName = 'data';
        }


        /**
         * last element in args will be the function to perform
         */



        const path = args[0].split(".");

        const arrString = path.map(a => {
            return '[\''+a+'\']'
        }).join('');
        return `\$\{${currentValueName}${arrString}\}`;
    },

    _getCurrentLoopName: () => {
        var loopName = 'data';

        if (template.loopDepth === 1) return loopName;

        return 'v'.repeat(template.loopDepth-1);

    },

    _getCurrentLoopKey: () => {
        return 'k'.repeat(template.loopDepth);
    },

    _getCurrentLoopValue: () => {
        return 'v'.repeat(template.loopDepth);
    },

    /**
     * 
     * @param templateArray Array of broken up string parts that make up the template. Each word, or section is it's own array entry
     * @param data          Data to apply to the template
     * @returns 
     */
    _compileToStringOld: (templateArray: any, data: object = {}) => {
        let fnStr = ``;

        /**
         * As we loop through the template looking for {{...}}, some of these may be commands, such as 
         * #EACH or #LOOP. 
         * When we find these, we need to store the name of the array and use it to build up the inner 
         * values
         */
        var arrayName: string[] = [];

        // the data array (not template)
        var arrayNameLength: number = 0;

        // building up the content of an array
        var arrayString: string[] = [];

        //holds a buildable array reference to the data
        var dataRef: string[] = [];
        var dataRefLength = 0;
        var dataRefType:string = "";
        var dataCurrent:object = data;
        var eachKey:string = '';


        
        
         /**
         * I use this to tell me how many 'i' in my for loops to use.
         * 
         * Use case. I have 2 nested loops. In my auto code, i use 'i' for the top level iterator, and 'ii' for the 2nd on (etc)
         * This helps me keep which one i'm using when i come accross more {{*}} substitutions in the template
         */
        var tempLoopVar = ''
        var tempRefDataCounter = 1;

        /**
         * adds helper functions, such as lowercase or uppercase: {{uppercase|value}}
         */
        var outputCommand:string = "";

        var noData: boolean = false; // indicates to any #each loops if there is data. If there isn't then don't both building the loop


        templateArray.map(t => {

            outputCommand = ''
            // checking to see if it is an interpolation
            if (t.startsWith("{{") && t.endsWith("}}")) {
                
                //t = t.split(/\./g).join(`"]["`);


                // lets see if it's a command (#)
                if (t.indexOf("#") > 0) {

                    /**
                     * this is an array, so we need to do some array stuff:
                     *  - get the length of the array
                     *  - add some array syntax to the string part (data.key for example)
                     *  - add as many lines as there are rows in the array
                     */
                    if (t.indexOf("#each") > 0) {

                        //reset our noData var
                        noData = false; 

                        // get the name of the array specified in this tag
                        // we need the last word in the tag

                        //remove the brackets
                        let a = t.replace("{{", "").replace("}}", "").trim();
                        let tempArrayName = '0';

                        // if our #each command doesnt specify a key, so loop everything
                        if (a == "#each") {
                            dataRef = data

                           /* try {
                                dataCurrent = dataCurrent[Object.keys(dataCurrent)[0]]
                            } catch(e) {
                                dataCurrent = data
                            }*/
                            tempArrayName = ''
                            
                        } else {
                            tempArrayName = t.split(" ").pop().replace("}}", "").trim();
                            //dataCurrent = dataCurrent[tempArrayName]
                            eachKey = tempArrayName
                        }

                        let oldArrayName = arrayName;
                        let oldArrayNameLength = arrayNameLength;

                        if (tempArrayName.length > 0) {
                            tempRefDataCounter = tempArrayName.split(".").map((item) => {
                                arrayName.push( item );
                            }).length;
                        }

                        arrayNameLength++// = arrayName.length;

                        let i = 0;
                        
                        for (const name of arrayName) {
                            if (i === 0 && data[name]) {
                                dataRef = data[name];
                            } else if (dataRef[name]) {
                                dataRef = dataRef[name];
                            } else {
                                noData = true;
                                //return;
                            }

                            i++;
                        }

                        
                        dataRefLength = (dataRef.length) ? dataRef.length : Object.keys(dataRef).length;
                        dataRefType = (dataRef.length) ? "array" : "object"


                        tempLoopVar = "v".repeat(arrayNameLength-1);

                        switch (dataRefType) {
                            case "array"    :
                                tempArrayName = `data["${arrayName.join('"]["')}"]`;
                                
                                fnStr += `\$\{${tempArrayName}.map((k, ${tempLoopVar}) => \``;
                                break;
                            case "object"   :
                                // we need to get the arrayName before this current loop
                                tempArrayName = `data["${oldArrayName.join('"]["')}"]`;

                                var tempVarData = tempLoopVar
                                var tempVarK = 'k'.repeat(arrayNameLength);
                                var tempVarV = 'v'.repeat(arrayNameLength);

                                let keys = '["' + oldArrayName.filter( element=> isNaN(parseInt(element)) ).join('"]["');
                                keys = keys + '"]';

                                if (arrayNameLength == 1) {
                                    keys = '';
                                    tempVarData = 'data'
                                }
                                if (oldArrayNameLength > 0) {
                                    keys += '[' + "v".repeat(oldArrayNameLength) + ']';
                                }
                                if (tempArrayName.length > 0) {
                                    tempVarData += '["' + eachKey + '"]'
                                }
                                
                                const d = `${tempLoopVar}`
                                fnStr += `\$\{Object.entries(${tempVarData}).map(([${tempVarK}, ${tempVarV}]) => \``;
                                break;
                            default :
                                fnStr += `\$\{[].map((k, ${tempLoopVar}) => \``;
                        }
                    
                        
                        
                    }
                    

                } else if (t.includes("{{/each") === true) {
                    
                    
                    if (noData === true) {
                        //noData = false;
                        return;
                    }

                    arrayNameLength--

                    /**
                     * this is the end of a command
                     * check the arrayString arrary for our... array (BAD naming James)
                     */
                    let tempArrayName = arrayName.join('|');

                    
                    if (arrayString[tempArrayName]) {
                        
                        // loop through our data array, and append to the main string a duplicate of 
                        // the arrayString, changing the array keys

                        for (let i=0; i<dataRefLength; i++) {
                            let q = ''
                            let k = (dataRef[i]) ? dataRef[i] : Object.keys(dataRef)[i];
                            q = arrayString[tempArrayName].replace(/\[n\]/g, "[\""+k+"\"]").replace(/\|/g, '"]["');

                            //fnStr += q;
                        }
                    }

                    for (let i=0; i<=tempRefDataCounter; i++) {
                        arrayName.pop();
                        //dataCurrent = Object.keys(dataCurrent)
                    }
                    
                    let o = 0;
                    dataRef = [];
                    for (const name of arrayName) {
                        if (o === 0 && data[name]) {
                            dataRef = data[name];
                        } else if (dataRef[name]) {
                            dataRef = dataRef[name];
                        } else {
                            noData = true;
                            return;
                        }
                        o++;
                    }

                    dataRefLength = (o === 0) ? 0 : (dataRef.length) ? dataRef.length : Object.keys(dataRef).length;

                    if (noData === false) {
                        fnStr += `\`.trim()).join('')\}`;
                    }

                    //noData = false;
                    //fnStr += `\`.trim())\}`;
                } else {
                    if (noData === true) return;

                    /**
                     * are we in a command, like an array? we need to check the arrayName and arrayNameLength
                     * parametes for truthies to see if we should treat this object key differently
                     */
                    if (t.indexOf("|") > 0){
                        let temp = t.replace("{{", "").replace("}}", "").trim().split("|");
                        t = '{{'+temp[1]+'}}';

                        switch (temp[0]) {
                            case "uppercase" :  outputCommand = '.toUpperCase()';
                                                break;
                            case "lowercase" :  outputCommand = '.toLowerCase()';
                                                break;
                            case "upper" :  outputCommand = '.toUpperCase()';
                                                break;
                            case "lower" :  outputCommand = '.toLowerCase()';
                                                break;
                        } 

                        
                    }
                    if (arrayName.length > 0) {

                        /**
                         * so this is an array. We need to keep going through our main loop and store 
                         * all our 'inner' rows in a seperate place to keep track of them. 
                         * Then we can multiple it by how many rows we have in our array 
                         */
                        if (!arrayString[arrayName.join('|')]) arrayString[arrayName.join('|')] = "";

                        let keys: string = "";
                        if (dataRefType == "object") {
                            keys = '"' + arrayName.filter( element=> isNaN(parseInt(element)) ).join('"]["');
                            keys = keys + '"';
                        } else {
                            keys = '"' + arrayName.join('"]["');
                            keys = keys + '"][' + tempLoopVar;// + '"]';
                        }
                        
                        if (t == "{{key}}") {
                            keys += '';//[' + "i".repeat(arrayNameLength) + '';
                            //let i = "i".repeat(arrayNameLength);
                            
                            //fnStr += `\$\{Object.keys(data[${keys}])\}`;
                            fnStr += `\$\{item[0]${outputCommand}\}`;
                            
                        } else if (t == "{{value}}") {
                            keys += '][' + "i".repeat(arrayNameLength) + '';
                            //fnStr += `\$\{Object.values(data[${keys}])\}`;
                            
                            fnStr += `\$\{item[1]\}`;
                        } else {
                           // console.warn(`\$\{Object.values(data[${keys}])\}`)
                            fnStr += `\$\{data[${keys}]["${t.split(/{{|}}/).filter(Boolean)[0].trim()}"]\ || ''}`;
                        }
                        
                    } else {
                        // append it to fnStr
                       
                        let vvv:string = 'data';
                        let kkk:string = 'data';
                        let vv:string = ''
                        let kk:string = ''
                        if (tempRefDataCounter > 0) {
                            vvv = 'v'.repeat(tempRefDataCounter+1);
                            kkk = 'k'.repeat(tempRefDataCounter+1);
                            vv = 'v'.repeat(tempRefDataCounter);
                            kk = 'k'.repeat(tempRefDataCounter);
                        }

                        if (t == "{{key}}") {
                            
                            fnStr += `\$\{${kkk}${outputCommand}\}`;
                        } else if  (t == "{{value}}") {
                            fnStr += `\$\{${vvv}${outputCommand}\}`;
                        } else {
                            console.log(111)
                            console.log(arrayString)
                            fnStr += `\$\{(${vvv}["${t.replace(/\./g, '"]["').split(/{{|}}/).filter(Boolean)[0].trim()}"]) ? ${vvv}["${t.replace(/\./g, '"]["').split(/{{|}}/).filter(Boolean)[0].trim()}"]${outputCommand}\ : ''}`;
                        }
                        
                    }
                }

            } else {

                if (noData === true) return

                // append the string to the fnStr
                if (arrayNameLength > 0) {
                    /**
                     * so this is an array. We need to keep going through our main loop and store 
                     * all our 'inner' rows in a seperate place to keep track of them. 
                     * Then we can multiple it by how many rows we have in our array 
                     */
                    let temp = `["${arrayName.join('"]["')}"]"`;
                    if (!arrayString[temp]) arrayString[temp] = [];
                    //arrayString[temp] += `${t}`;
                } else {
                    // append it to fnStr
                    
                }
                fnStr += `${t}`;
            }
        });
        
        return fnStr;
    },
    compile: (templateString: string, data: object = {}) => {

        //data = template._convertObjectToArray(data);

        // update all the keys, change spaces to a hypen -
        const loop = (data) => {
            var result: object = {}
            var dataLength: number = data.length;

            for (let [key, value] of Object.entries(data)) {
                if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                    result[key] = loop(value);
                }

                key = key.replace(/\s/g, "-");

                result[key] = value;
            }

            return result;
        }

        try {
            let h =  new Function("const data = this; return `"+ templateString +"`;").apply(data);
/*
            localStorage.setItem('testObject', JSON.stringify(testObject));

// Retrieve the object from storage
var retrievedObject = localStorage.getItem('testObject');

console.log('retrievedObject: ', JSON.parse(retrievedObject));
*/
            return h;
        } catch (e) {
            console.error('Problem with template: ' + e.message);
            console.error('Problem with template: ' + e, templateString, data);
        }
    },

    _convertObjectToArray: (data: object = {}) => {
        let keys = Object.entries;
        let array = [];

        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                array[key] = template._convertObjectToArray(value);
            } else {
                array[key] = value;
            }
        }

        return array;
    },

    _hash: (s) => {
        return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
    }
}

export { template }