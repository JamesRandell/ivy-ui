const html = "<section class=\"content\">\n    This is some CASSANDRA content<br>\n    {{firstname}}\n    {{last name}}<br>\n    {{parent/child}}<br>\n    after firstname<br>\n    {{#each default}}\n    {{name}}:Something else<br>\n    {{/each}}\n    Some other content\n</section>";


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
        var arrayName: string = "";
        var arrayLength: number = 0;

        // how many #EACH are there? This is so we can do arrays in arrays
        var arrayNumber: number = 0;

        // building up the content of an array
        var arrayString: any = [];

        templateArray.map(t => {
            // checking to see if it is an interpolation
            if (t.startsWith("{{") && t.endsWith("}}")) {
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
                        arrayLength = data[arrayName].length;
                    }

                } else if (t.includes("{{/") === true) { 
                    /**
                     * this is the end of a command
                     * check the arrayString arrary for our... array (BAD naming James)
                     */
                    if (arrayString[arrayName]) {
                        
                        // loop through our data array, and append to the main string a duplicate of 
                        // the arrayString, changing the array keys
                        for (let i=0; i<arrayLength; i++) {
                            let q = arrayString[arrayName].replace(/\[n\]/g, "["+i+"]");
                            fnStr += q;
                        }
                    }

                    arrayName = null;
                    arrayLength = 0;
                } else {
                    
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
                        if (!arrayString[arrayName]) arrayString[arrayName] = "";
                        arrayString[arrayName] += `\$\{data.${arrayName}[n].${t.split(/{{|}}/).filter(Boolean)[0].trim()}\}`;
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
                    if (!arrayString[arrayName]) arrayString[arrayName] = [];
                    arrayString[arrayName] += `${t}`;
                } else {
                    // append it to fnStr
                    fnStr += `${t}`;
                }
            }
        });
        return fnStr;
    },
    compile: (template: string, data: object = {}) => {
        try {
            console.log(template);
            return new Function(  "const data = this; return `"+template +"`;").apply(data);
        } catch (e) {
            console.error('Problem with template:');
            console.error(template);
        }
    }
}

export { template, data }
var data = {
    firstname: "James",
    "last name": "Savoy",
    parent: {
        child: "HELLO!"
    },
    default: [
        {
            name: "Steve"
        },
        {
            name: "David"
        },
        {
            name: "Fred"
        }
    ]
}

const v = template.parse(html, data);



const person = {
    fullName: function() {
      return this;
    }
  }

//const handler = new Function(  "const data = this; console.warn(data); return `"+v +"`;").apply(data);



const q = document.querySelector('.content');
q.innerHTML = template.compile(v, data);