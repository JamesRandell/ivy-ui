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
        var arrayLength: number = 0;

        // building up the content of an array
        var arrayString: string[] = [];
console.log(data);

        //holds a buildable array reference to the data
        var dataRef: string[] = [];
        var dataRefLength = 0;

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
                        let tempArrayName = t.split(" ").pop().replace("}}", "").trim()
                        arrayName.push( tempArrayName );

                        let i = 0;

                        for (const name of arrayName) {
                            dataRef = (i === 0) ? data[name] : dataRef[name];
                            i++
                        }

                        dataRefLength = i;
                        tempArrayName = `data["${arrayName.join('"]["')}"]`;

                        

                        /*
                        if (tempArrayName in data) {
                            arrayLength = `data["${arrayName.join('"]["')}"]`.length;
                        } else {
                            arrayLength = 0;
                        }
                        */

                    }

                } else if (t.includes("{{/") === true) {

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
                                
                            /** 
                             * checks if there is a sub-array as this value. If there is just return nothing
                             */
                            //if (Object.keys(data[tempArrayName][i]).length > 1) {
                            //    q = '';
                                //let q = arrayString[arrayName].replace(/\[n\]/g, "["+i+"]");
                            //} else {
                                q = arrayString[tempArrayName].replace(/\[n\]/g, "["+i+"]").replace(/\|/g, '"]["');
                            //}
                            
                            fnStr += q;
                        }
                    }

                    arrayName.pop();
                    let o = 0;
                    for (const name of arrayName) {
                        dataRef = (o === 0) ? data[name][0] : dataRef[name][0];
                        o++
                    }
                    dataRefLength = o;

                } else {
                    
console.error(dataRefLength);
                    /**
                     * are we in a command, like an array? we need to check the arrayName and arrayLength
                     * parametes for truthies to see if we should treat this object key differently
                     */
                    if (dataRefLength > 0) {

                        /**
                         * so this is an array. We need to keep going through our main loop and store 
                         * all our 'inner' rows in a seperate place to keep track of them. 
                         * Then we can multiple it by how many rows we have in our array 
                         */
                        if (!arrayString[arrayName.join('|')]) arrayString[arrayName.join('|')] = "";

                        if (t == "{{key}}") {
                            arrayString[arrayName.join('|')] += `\$\{Object.keys(data["${arrayName.join('|')}"][n])\}`;
                        } else if (t == "{{value}}") {
                            arrayString[arrayName.join('|')] += `\$\{Object.values(data["${arrayName.join('|')}"][n])\}`;
                        } else {
                            arrayString[arrayName.join('|')] += `\$\{data["${arrayName.join('|')}"][n].${t.split(/{{|}}/).filter(Boolean)[0].trim()}\}`;
                        }
                        console.warn(arrayString);
                    } else {
                        // append it to fnStr
                        fnStr += `\$\{data["${t.split(/{{|}}/).filter(Boolean)[0].trim()}"]\}`;
                    }
                }
            } else {
                // append the string to the fnStr
                if (arrayLength > 0) {
                    /**
                     * so this is an array. We need to keep going through our main loop and store 
                     * all our 'inner' rows in a seperate place to keep track of them. 
                     * Then we can multiple it by how many rows we have in our array 
                     */
                    let temp = `["${arrayName.join('"]["')}"]"`;
                    if (!arrayString[temp]) arrayString[temp] = [];
                    arrayString[temp] += `${t}`;
                } else {
                    // append it to fnStr
                    fnStr += `${t}`;
                }
            }
        });
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