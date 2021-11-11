var template = {


    parse: (templateString: string, data: object) => {

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
console.log(data)
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

        /**
         * I use this to tell me how many 'i' in my for loops to use.
         * 
         * Use case. I have 2 nested loops. In my auto code, i use 'i' for the top level iterator, and 'ii' for the 2nd on (etc)
         * This helps me keep which one i'm using when i come accross more {{*}} substitutions in the template
         */
        var tempLoopVar = ''
        var tempRefDataCounter = 1;

        var outputCommand = "";

        var noData: boolean = false; // indicates to any #each loops if there is data. If there isn't then don't both building the loop


        templateArray.map(t => {

            console.log(t);            
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
                        if (a == "#each") {

                        } else {
                            tempArrayName = t.split(" ").pop().replace("}}", "").trim();
                        }
                        let oldArrayName = arrayName;
                        let oldArrayNameLength = arrayNameLength;

                        tempRefDataCounter = tempArrayName.split(".").map((item) => {
                            arrayName.push( item );
                        }).length;

                        arrayNameLength = arrayName.length;

                        let i = 0;

                        console.log(arrayName);
                        for (const name of arrayName) {                            
                            if (i === 0 && data[name]) {
                                dataRef = data[name];
                            } else if (dataRef[name]) {
                                dataRef = dataRef[name];
                            } else {
                                noData = true;
                                return;
                            }

                            i++;
                        }

                        //try {
                            dataRefLength = (dataRef.length) ? dataRef.length : Object.keys(dataRef).length;
                            dataRefType = (dataRef.length) ? "array" : "object"
                        //} catch {
                        //    dataRefLength = 0;
                        //    dataRefType = "absent";
                        //}
          
                        switch (dataRefType) {
                            case "array"    :
                                tempArrayName = `data["${arrayName.join('"]["')}"]`;
                                tempLoopVar = "i".repeat(arrayNameLength);
                                fnStr += `\$\{${tempArrayName}.map((item, ${tempLoopVar}) => \``;
                                break;
                            case "object"   :
                                // we need to get the arrayName before this current loop
                                tempArrayName = `data["${oldArrayName.join('"]["')}"]`;

                                tempLoopVar = "i".repeat(arrayNameLength);

                                let keys = '"' + oldArrayName.filter( element=> isNaN(parseInt(element)) ).join('"]["');
                                keys = keys + '"]';
                                if (oldArrayNameLength > 0) {
                                    keys += '[' + "i".repeat(oldArrayNameLength) + ']';
                                }
                                
                                fnStr += `\$\{Object.entries(data[${keys}).map((item, ${tempLoopVar}) => \``;
                                //fnStr += `\$\{Object.entries(data[${keys}).forEach(([item, ${tempLoopVar}]) => \``;
                                break;
                            default :
                                fnStr += `\$\{[].map((item, ${tempLoopVar}) => \``;
                        }
                    
                        
                        
                    }
                    

                } else if (t.includes("{{/each") === true) {
                    
                    
                    if (noData === true) {
                        //noData = false;
                        return;
                    }

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
                        t = '{{'+temp[0]+'}}';

                        console.log(temp[1])
                        switch (temp[1]) {
                            case "uppercase" :  outputCommand = '.toUpperCase()';
                                                break;
                            case "lowercase" :  outputCommand = '.toLowerCase()';
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
                            fnStr += `\$\{data[${keys}]["${t.split(/{{|}}/).filter(Boolean)[0].trim()}"]\}`;
                        }
                        
                        //console.warn(arrayString);
                    } else {
                        // append it to fnStr
                       
                        fnStr += `\$\{data["${t.replace(/\./g, '"]["').split(/{{|}}/).filter(Boolean)[0].trim()}"]\}`;
                    }
                }

                //console.log('array:' + arrayName.length + ', data: ' + dataRefLength + ', type: ' + dataRefType);
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
            let h =  new Function("const data = this; return `"+ templateString +"`;").apply(data);
/*
            localStorage.setItem('testObject', JSON.stringify(testObject));

// Retrieve the object from storage
var retrievedObject = localStorage.getItem('testObject');

console.log('retrievedObject: ', JSON.parse(retrievedObject));
*/
            return h;
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
    },

    _hash: (s) => {
        return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);              
    }
}

export { template }