var template = {
    parse: (templateString, data) => {
        //data = template._convertObjectToArray(data);
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
        return template._compileToString(arr, data);
    },
    _compileToString: (templateArray, data = {}) => {
        let fnStr = ``;
        /**
         * As we loop through the template looking for {{...}}, some of these may be commands, such as
         * #EACH or #LOOP.
         * When we find these, we need to store the name of the array and use it to build up the inner
         * values
         */
        var arrayName = [];
        // the data array (not template)
        var arrayNameLength = 0;
        // building up the content of an array
        var arrayString = [];
        //holds a buildable array reference to the data
        var dataRef = [];
        var dataRefLength = 0;
        var dataRefType = "";
        /**
         * I use this to tell me how many 'i' in my for loops to use.
         *
         * Use case. I have 2 nested loops. In my auto code, i use 'i' for the top level iterator, and 'ii' for the 2nd on (etc)
         * This helps me keep which one i'm using when i come accross more {{*}} substitutions in the template
         */
        var tempLoopVar = '';
        var tempRefDataCounter = 1;
        templateArray.map(t => {
            // checking to see if it is an interpolation
            if (t.startsWith("{{") && t.endsWith("}}")) {
                console.log(t);
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
                        // get the name of the array specified in this tag
                        // we need the last word in the tag
                        //remove the brackets
                        let a = t.replace("{{", "").replace("}}", "").trim();
                        let tempArrayName = '0';
                        if (a == "#each") {
                        }
                        else {
                            tempArrayName = t.split(" ").pop().replace("}}", "").trim();
                        }
                        let oldArrayName = arrayName;
                        let oldArrayNameLength = arrayNameLength;
                        tempRefDataCounter = tempArrayName.split(".").map((item) => {
                            arrayName.push(item);
                        }).length;
                        arrayNameLength = arrayName.length;
                        let i = 0;
                        for (const name of arrayName) {
                            dataRef = (i === 0) ? data[name] : dataRef[name];
                            i++;
                        }
                        dataRefLength = (dataRef.length) ? dataRef.length : Object.keys(dataRef).length;
                        dataRefType = (dataRef.length) ? "array" : "object";
                        if (dataRefType == "array") {
                            tempArrayName = `data["${arrayName.join('"]["')}"]`;
                            tempLoopVar = "i".repeat(arrayNameLength);
                            fnStr += `\$\{${tempArrayName}.map((item, ${tempLoopVar}) => \``;
                        }
                        else {
                            // we need to get the arrayName before this current loop
                            tempArrayName = `data["${oldArrayName.join('"]["')}"]`;
                            tempLoopVar = "i".repeat(arrayNameLength);
                            let keys = '"' + oldArrayName.filter(element => isNaN(parseInt(element))).join('"]["');
                            keys = keys + '"]';
                            if (oldArrayNameLength > 0) {
                                keys += '[' + "i".repeat(oldArrayNameLength) + ']';
                            }
                            fnStr += `\$\{Object.entries(data[${keys}).map((item, ${tempLoopVar}) => \``;
                            //fnStr += `\$\{Object.entries(data[${keys}).forEach(([item, ${tempLoopVar}]) => \``;
                        }
                    }
                }
                else if (t.includes("{{/") === true) {
                    /**
                     * this is the end of a command
                     * check the arrayString arrary for our... array (BAD naming James)
                     */
                    let tempArrayName = arrayName.join('|');
                    if (arrayString[tempArrayName]) {
                        // loop through our data array, and append to the main string a duplicate of 
                        // the arrayString, changing the array keys
                        for (let i = 0; i < dataRefLength; i++) {
                            let q = '';
                            let k = (dataRef[i]) ? dataRef[i] : Object.keys(dataRef)[i];
                            q = arrayString[tempArrayName].replace(/\[n\]/g, "[\"" + k + "\"]").replace(/\|/g, '"]["');
                            //fnStr += q;
                        }
                    }
                    for (let i = 0; i <= tempRefDataCounter; i++) {
                        arrayName.pop();
                    }
                    let o = 0;
                    dataRef = [];
                    for (const name of arrayName) {
                        dataRef = (dataRef.length == 0) ? data[name] : dataRef[name];
                        o++;
                    }
                    dataRefLength = (o === 0) ? 0 : (dataRef.length) ? dataRef.length : Object.keys(dataRef).length;
                    fnStr += `\`.trim()).join('')\}`;
                    //fnStr += `\`.trim())\}`;
                }
                else {
                    /**
                     * are we in a command, like an array? we need to check the arrayName and arrayNameLength
                     * parametes for truthies to see if we should treat this object key differently
                     */
                    if (arrayName.length > 0) {
                        /**
                         * so this is an array. We need to keep going through our main loop and store
                         * all our 'inner' rows in a seperate place to keep track of them.
                         * Then we can multiple it by how many rows we have in our array
                         */
                        if (!arrayString[arrayName.join('|')])
                            arrayString[arrayName.join('|')] = "";
                        let keys = "";
                        if (dataRefType == "object") {
                            keys = '"' + arrayName.filter(element => isNaN(parseInt(element))).join('"]["');
                            keys = keys + '"';
                        }
                        else {
                            keys = '"' + arrayName.join('"]["');
                            keys = keys + '"][' + tempLoopVar; // + '"]';
                        }
                        if (t == "{{key}}") {
                            keys += ''; //[' + "i".repeat(arrayNameLength) + '';
                            //let i = "i".repeat(arrayNameLength);
                            //fnStr += `\$\{Object.keys(data[${keys}])\}`;
                            fnStr += `\$\{item[0]\}`;
                        }
                        else if (t == "{{value}}") {
                            keys += '][' + "i".repeat(arrayNameLength) + '';
                            //fnStr += `\$\{Object.values(data[${keys}])\}`;
                            fnStr += `\$\{item[1]\}`;
                        }
                        else {
                            fnStr += `\$\{data[${keys}]["${t.split(/{{|}}/).filter(Boolean)[0].trim()}"]\}`;
                        }
                        //console.warn(arrayString);
                    }
                    else {
                        // append it to fnStr
                        fnStr += `\$\{data["${t.split(/{{|}}/).filter(Boolean)[0].trim()}"]\}`;
                    }
                }
                console.log('array:' + arrayName.length + ', data: ' + dataRefLength + ', type: ' + dataRefType);
            }
            else {
                // append the string to the fnStr
                if (arrayNameLength > 0) {
                    /**
                     * so this is an array. We need to keep going through our main loop and store
                     * all our 'inner' rows in a seperate place to keep track of them.
                     * Then we can multiple it by how many rows we have in our array
                     */
                    let temp = `["${arrayName.join('"]["')}"]"`;
                    if (!arrayString[temp])
                        arrayString[temp] = [];
                    //arrayString[temp] += `${t}`;
                }
                else {
                    // append it to fnStr
                }
                fnStr += `${t}`;
            }
        });
        console.log(arrayString);
        return fnStr;
    },
    compile: (templateString, data = {}) => {
        data = template._convertObjectToArray(data);
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
            console.log(templateString);
            return new Function("const data = this; return `" + templateString + "`;").apply(data);
        }
        catch (e) {
            console.error('Problem with template: ' + e);
            console.error(templateString);
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
    }
};
export { template };
