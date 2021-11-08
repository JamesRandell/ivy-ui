var template = {


    parse: (templateString: string, data: object) => {

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

        if (templateString) arr.push(templateString);

        return template._compileToString(arr, data);

    },

    _compileToString: (templateArray: any, data: object = {}) => {
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

        var outputArray: string[] = [];

        templateArray.map(t => {

            // checking to see if it is an interpolation
            if (t.startsWith("{{") && t.endsWith("}}")) {
                
                console.log(t);
                
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

                        // get the name of the array specified in this tag
                        // we need the last word in the tag

                        //remove the brackets
                        let a = t.replace("{{", "").replace("}}", "").trim();
                        let tempArrayName = '0';
                        if (a == "#each") {

                        } else {
                            tempArrayName = t.split(" ").pop().replace("}}", "").trim();
                        }

                        arrayName.push( tempArrayName );
                        arrayNameLength = arrayName.length;
                        
                        let i = 0;

                        for (const name of arrayName) {
                            dataRef = (i === 0) ? data[name] : dataRef[name];
                            i++
                        }

                        dataRefLength = (dataRef.length) ? dataRef.length : Object.keys(dataRef).length;
                        //tempArrayName = `data["${arrayName.join('"]["')}"]`;
                        
                    }
                    

                } else if (t.includes("{{/") === true) {

                    /**
                     * this is the end of a command
                     * check the arrayString arrary for our... array (BAD naming James)
                     */
                    let tempArrayName = arrayName.join('|');

                    dataRef = [];
                    let o = 0;
                    for (const name of arrayName) {
                        dataRef = (dataRef.length == 0) ? data[name] : dataRef[name];
                        o++;
                    }
                    
                    if (arrayString[tempArrayName]) {
                        
                        // loop through our data array, and append to the main string a duplicate of 
                        // the arrayString, changing the array keys

                        let q:string = arrayString[tempArrayName].replace(/\|/g, '"]["');

                        for (let i=0; i<dataRefLength; i++) {
                            let k = (dataRef[i]) ? dataRef[i] : Object.keys(dataRef)[i];
                            fnStr += q.replace(/\[n\]/g, "[\""+k+"\"]");
                        }
                        //fnStr += q;
                    }

                    arrayName.pop();
                    arrayNameLength = arrayName.length;
                    
                    

                    dataRefLength = (o === 0) ? 0 : (dataRef.length) ? dataRef.length : Object.keys(dataRef).length;

                } else {
                    
                    /**
                     * are we in a command, like an array? we need to check the arrayName and arrayLength
                     * parametes for truthies to see if we should treat this object key differently
                     */
                    let tempArrayName = arrayName.join("|");

                    if (arrayName.length > 0) {

                        /**
                         * so this is an array. We need to keep going through our main loop and store 
                         * all our 'inner' rows in a seperate place to keep track of them. 
                         * Then we can multiple it by how many rows we have in our array 
                         */
                        if (!arrayString[tempArrayName]) arrayString[tempArrayName] = "";

                        if (t == "{{key}}") {
                            arrayString[tempArrayName] += `\$\{Object.keys(data["${tempArrayName}"][n])\}`;
                        } else if (t == "{{value}}") {
                            arrayString[tempArrayName] += `\$\{Object.values(data["${tempArrayName}"][n])\}`;
                        } else {
                            arrayString[tempArrayName] += `\$\{data["${tempArrayName}"][n]["${t.split(/{{|}}/).filter(Boolean)[0].trim()}"]\}`;
                        }
                        fnStr += arrayString[tempArrayName];
                    } else {
                        // append it to fnStr
                       let k = `\$\{data["${tempArrayName}"]["${t.split(/{{|}}/).filter(Boolean)[0].trim()}"]\}`;
                        //fnStr += k
                        //outputArray.push(k);
                    }
                }

                console.log('array:' + arrayName.length + ', data: ' + dataRefLength);
            } else {
                // append the string to the fnStr
                
                if (arrayNameLength > 0) {
                    
                    /**
                     * so this is an array. We need to keep going through our main loop and store 
                     * all our 'inner' rows in a seperate place to keep track of them. 
                     * Then we can multiple it by how many rows we have in our array 
                     */
                    let tempArrayName = arrayName.join("|");
                    if (!arrayString[tempArrayName]) arrayString[tempArrayName] = "";

                    console.log('@@: ' + arrayNameLength + ':' + tempArrayName + ' - ' + t)

                    arrayString[tempArrayName] += `${t}`;
                } else {
                    // append it to fnStr            
                    fnStr += `${t}`;
                }
            }
        });

        //return outputArray.reverse().join("");
        
        console.table(arrayString);
        return fnStr;
    },
    compile: (templateString: string, data: object = {}) => {

        data = template._convertObjectToArray(data);

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
            console.log(templateString);
            return new Function("const data = this; return `"+ templateString +"`;").apply(data);
        } catch (e) {
            console.error('Problem with template: ' + e);
            console.error(templateString);
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
    }
}

export { template }