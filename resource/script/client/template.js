var template = {
    parse: (templateString, data) => {
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
        var arrayName = "";
        var arrayLength = 0;
        // how many #EACH are there? This is so we can do arrays in arrays
        var arrayNumber = 0;
        // building up the content of an array
        var arrayString = [];
        templateArray.map(t => {
            // checking to see if it is an interpolation
            if (t.startsWith("{{") && t.endsWith("}}")) {
                t = t.split(/\./g).join(`"]["`);
                // lets see if it's a command (#)
                if (t.indexOf("#") > 0) {
                    /**
                     * this is an array, so we need to do some array stuff:
                     *  - get the length of the array
                     *  - add some array syntax to the string part (data.key for example)
                     *  - add as many lines as there are rows in the array
                     */
                    if (t.indexOf("#each") > 0) {
                        arrayNumber++;
                        // get the name of the array specified in this tag
                        // we need the last word in the tag
                        arrayName = t.split(" ").pop().replace("}}", "").trim();
                        if (arrayName in data) {
                            if (data[arrayName].constructor === Array) {
                                arrayLength = data[arrayName].length;
                            }
                            else {
                                arrayLength = Object.keys(data[arrayName]).length;
                            }
                        }
                        else {
                            arrayLength = 0;
                        }
                    }
                }
                else if (t.includes("{{/") === true) {
                    /**
                     * this is the end of a command
                     * check the arrayString arrary for our... array (BAD naming James)
                     */
                    if (arrayString[arrayName]) {
                        // loop through our data array, and append to the main string a duplicate of 
                        // the arrayString, changing the array keys
                        // urgh, but first, test if this is an aray or on object again
                        if (data[arrayName].constructor === Array) {
                            for (let i = 0; i < arrayLength; i++) {
                                let q = arrayString[arrayName].replace(/\[n\]/g, "[" + i + "]");
                                fnStr += q;
                            }
                        }
                        else {
                            for (let [key] of Object.entries(data[arrayName])) {
                                let q = arrayString[arrayName].replace(/\[n\]/g, "[\"" + key + "\"]");
                                fnStr += q;
                            }
                        }
                    }
                    arrayName = null;
                    arrayLength = 0;
                }
                else {
                    /**
                     * are we in a command, like an array? we need to check the arrayName and arrayLength
                     * parametes for truthies to see if we should treat this object key differently
                     */
                    if (arrayLength > 0) {
                        /**
                         * so this is an array. We need to keep going through our main loop and store
                         * all our 'inner' rows in a seperate place to keep track of them.
                         * Then we can multiple it by how many rows we have in our array
                         */
                        if (!arrayString[arrayName])
                            arrayString[arrayName] = "";
                        if (t == "{{key}}") {
                            if (data[arrayName].constructor === Array) {
                                arrayString[arrayName] += `\$\{Object.keys(data["${arrayName}"][n])\}`;
                            }
                            else {
                                arrayString[arrayName] += `\$\{[n]\}`;
                            }
                        }
                        else if (t == "{{value}}") {
                            if (data[arrayName].constructor === Array) {
                                arrayString[arrayName] += `\$\{Object.values(data["${arrayName}"][n])\}`;
                            }
                            else {
                                arrayString[arrayName] += `\$\{data["${arrayName}"][n]\}`;
                            }
                        }
                        else {
                            arrayString[arrayName] += `\$\{data["${arrayName}"][n].${t.split(/{{|}}/).filter(Boolean)[0].trim()}\}`;
                        }
                    }
                    else {
                        // append it to fnStr
                        fnStr += `\$\{data["${t.split(/{{|}}/).filter(Boolean)[0].trim()}"]\}`;
                    }
                }
            }
            else {
                // append the string to the fnStr
                if (arrayLength > 0) {
                    /**
                     * so this is an array. We need to keep going through our main loop and store
                     * all our 'inner' rows in a seperate place to keep track of them.
                     * Then we can multiple it by how many rows we have in our array
                     */
                    if (!arrayString[arrayName])
                        arrayString[arrayName] = [];
                    arrayString[arrayName] += `${t}`;
                }
                else {
                    // append it to fnStr
                    fnStr += `${t}`;
                }
            }
        });
        return fnStr;
    },
    compile: (template, data = {}) => {
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
            console.log(template);
            return new Function("const data = this; return `" + template + "`;").apply(data);
        }
        catch (e) {
            console.error('Problem with template: ' + e);
            console.error(template);
        }
    }
};
export { template };
