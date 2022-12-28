var payloadKey = 'data';
var template = {
    parse: (templateString) => {
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
        if (templateString)
            arr.push(templateString);
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
    _compileToString: (templateArray) => {
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
        var helperCommand = "";
        templateArray.flatMap(string => {
            helperCommand = '';
            // checking to see if it is an interpolation
            if (string.startsWith("{{") && string.endsWith("}}")) {
                var stringTrim = string.replace("{{", "").replace("}}", "").trim();
                var args = [];
                var fn = null;
                var command = stringTrim.split(" ")[0];
                var commandPrefix = '';
                /**
                 * see if there is a function on the end of this command split by a pipe (|) (command|function)
                 */
                if (stringTrim.indexOf('|') > 0) {
                    let tempArray = stringTrim.split("|");
                    command = tempArray[0].split(" ")[0];
                    stringTrim = tempArray[0];
                    fn = tempArray[1];
                }
                let tempArray = stringTrim.split(" ");
                if (tempArray.length > 1) {
                    args.push(tempArray[1]);
                }
                /**
                 * test if this is a start or end command
                 * remove the special car with slice before we call the function too
                 */
                if (command.indexOf("#") >= 0) {
                    commandPrefix = 'start_';
                    command = command.substring(1);
                }
                else if (command.indexOf("/") >= 0) {
                    commandPrefix = 'end_';
                    command = command.substring(1);
                }
                let tempString = '';
                try {
                    tempString = template['_command_' + commandPrefix + command](args, fn);
                }
                catch (e) {
                    /**
                     * there is no template function, so fall back on to guessing it's a manuall key name
                     */
                    args.unshift(command);
                    console.log('No command: _command_' + commandPrefix + command, fn);
                    tempString = template._keyOrValue(args, fn);
                }
                if (tempString) {
                    fnStr += tempString;
                }
            }
            else {
                fnStr += string;
            }
        });
        return fnStr;
    },
    /**
     *
     * @param args If empty then it's a basic loop. If it has an item in it then that's the name of the array we need to loop
     */
    _command_start_each: (args = [], fn = null) => {
        template.loopDepth++;
        var currentLoopName = template._getCurrentLoopName();
        const currentKeyName = template._getCurrentLoopKey();
        const currentValueName = template._getCurrentLoopValue();
        /**
         * the last argument will always be the name of a function. If it's null, then discard it
         */
        if (fn !== null) {
            try {
                fn * 2;
                currentLoopName = `Object.values(${currentLoopName})[${fn}]`;
            }
            catch (e) {
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
    _command_end_each: (cmd = [], fn = null) => {
        template.loopDepth--;
        return `\`.trim()).join('')\}`;
    },
    _command_start_payload: (args = []) => {
        payloadKey = args[0];
    },
    _command_key: (fn) => {
        const currentLoopName = template._getCurrentLoopName();
        const currentKeyName = template._getCurrentLoopKey();
        return `\$\{${currentKeyName}\}`;
    },
    _command_value: (fn) => {
        const currentLoopName = template._getCurrentLoopName();
        const currentValueName = template._getCurrentLoopValue();
        return `\$\{${currentValueName}\}`;
    },
    _keyOrValue: (args = [], fn = null) => {
        let currentValueName = template._getCurrentLoopValue();
        if (currentValueName == '') {
            currentValueName = 'data';
        }
        /**
         * last element in args will be the function to perform
         */
        const path = args[0].split(".");
        const arrString = path.map(a => {
            return '[\'' + a + '\']';
        }).join('');
        return `\$\{${currentValueName}${arrString}\}`;
    },
    _getCurrentLoopName: () => {
        var loopName = 'data';
        if (template.loopDepth === 1)
            return loopName;
        return 'v'.repeat(template.loopDepth - 1);
    },
    _getCurrentLoopKey: () => {
        return 'k'.repeat(template.loopDepth);
    },
    _getCurrentLoopValue: () => {
        return 'v'.repeat(template.loopDepth);
    },
    compile: (templateString, data = {}, key) => {
        //data = template._convertObjectToArray(data);
        /**if (key !== null) {
            console.log(4444,key,payloadKey)
            if (key != payloadKey) {
                return
            }
        }**/
        if (key === null || key === undefined) {
            key = 'data';
        }
        console.log(4444, key, payloadKey);
        if (key != payloadKey) {
            return;
        }
        //if (payloadKey)
        // update all the keys, change spaces to a hypen -
        const loop = (data) => {
            var result = {};
            var dataLength = data.length;
            for (let [key, value] of Object.entries(data)) {
                if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                    result[key] = loop(value);
                }
                key = key.replace(/\s/g, "-");
                result[key] = value;
            }
            return result;
        };
        try {
            let h = new Function("const data = this; return `" + templateString.trim() + "`;").apply(data);
            /*
                        localStorage.setItem('testObject', JSON.stringify(testObject));
            
            // Retrieve the object from storage
            var retrievedObject = localStorage.getItem('testObject');
            
            console.log('retrievedObject: ', JSON.parse(retrievedObject));
            */
            return h;
        }
        catch (e) {
            console.error('Problem with template: ' + e.message);
            console.error('Problem with template: ' + e, templateString, data);
        }
    },
    _convertObjectToArray: (data = {}) => {
        let keys = Object.entries;
        let array = [];
        for (const [key, value] of Object.entries(data)) {
            if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
                array[key] = template._convertObjectToArray(value);
            }
            else {
                array[key] = value;
            }
        }
        return array;
    },
    _hash: (s) => {
        return s.split("").reduce(function (a, b) { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0);
    }
};
export { template };
