export class ClassMapper {
    constructor(original, newItem) {
        this.SimplePropertyNames = ["string", "number", "boolean"];
        this.Original = original;
        this.New = newItem;
    }
    IsSimpleProperty(newProperty) {
        if (newProperty == undefined)
            return true;
        var propertyTypeName = typeof (newProperty);
        if (this.SimplePropertyNames.indexOf(propertyTypeName) !== -1)
            return true;
        // Dates are type "object" so check for a function name
        if (typeof (newProperty["getDate"]) === "function" && typeof (newProperty["toISOString"]) === "function")
            return true;
        // Exception - jQuery - we *could* iterate through these complex objects, overwriting all methods etc, but that would be a waste of effort because we know they haven't changed
        if (typeof (newProperty["closest"]) === "function" && typeof (newProperty["parentsUntil"]) === "function")
            return true;
        // TODO - other exceptions as per jQuery above. Usually third-party plugins 
        // Default - must be a complex object
        return false;
    }
    MergeProperty(propertyName) {
        if (typeof (propertyName) !== "string")
            return;
        if (propertyName === "constructor")
            return;
        // Javascript base prototypes start prefixing functions with underscores, so this is a simple way to check if we've gone "beyond" our own code and into core javascript.  If you prefix your own function/property names with underscores then you'll need to find a different method
        if (propertyName.startsWith("_"))
            return;
        var newProperty = this.New[propertyName];
        if (typeof (newProperty) === "undefined") {
            // console.log("Rejecting undefined property value for " + propertyName);
            return;
        }
        var propertyTypeName = typeof (newProperty);
        // Map the function
        if (newProperty instanceof Function) {
            // console.log("Updating function", propertyName);
            this.Original[propertyName] = newProperty;
            return;
        }
        // Simple property?
        if (this.IsSimpleProperty(newProperty)) {
            if (typeof (this.Original[propertyName]) === "undefined") {
                // console.log("Creating simple property", propertyName);
                this.Original[propertyName] = newProperty;
            }
            else {
                // Property exists - do not overwrite because we'd lose its value. Nothing to do!
                // console.log("Ignoring existing property", propertyName);
            }
            return;
        }
        // If we have a complex property in the new module, but not in the old module, then we can just copy directly, including its value
        if (propertyTypeName === "object" && typeof (this.Original[propertyName]) === "undefined") {
            // console.log("Creating complex property", propertyName);
            this.Original[propertyName] = newProperty;
            return;
        }
        // Array
        if (newProperty.constructor === Array) {
            // console.group("Merging array");
            let originalArray = this.Original[propertyName];
            let newArray = newProperty;
            for (var arrayIndex = 0; arrayIndex < newArray.length; arrayIndex++) {
                if (arrayIndex < originalArray.length) {
                    if (this.IsSimpleProperty(newArray[arrayIndex])) {
                        // Simple property - leave value
                        // console.log("Ignoring array item because it already exists", propertyName);
                        continue;
                    }
                    // Map complex object recursively through this class
                    let mapper = new ClassMapper(originalArray[arrayIndex], newArray[arrayIndex]);
                    mapper.Merge();
                }
                else {
                    // Add the item - the new module has more in the array than our old module
                    originalArray.push(newArray[arrayIndex]);
                }
            }
            // console.groupEnd();
            return;
        }
        // Merge complex object
        console.log("Merging complex object", propertyName);
        let mapper = new ClassMapper(this.Original[propertyName], newProperty);
        mapper.Merge();
    }
    Merge() {
        let prototype = Object.getPrototypeOf(this.New);
        // Complex properties include functions
        let complexPropertyNames = Object.getOwnPropertyNames(prototype);
        // Simple properties are things like strings and booleans
        let simplePropertyNames = Object.getOwnPropertyNames(this.New);
        let allProperties = complexPropertyNames.concat(simplePropertyNames);
        //console.group("Merging ");
        //console.log("Prototype", prototype);
        //console.log("Object", this.New);
        //console.table(allProperties);
        //console.log("-------------");
        //console.groupEnd();
        // Iterate through each property/function we have found
        allProperties.map((propertyName) => {
            //console.group(propertyName);
            this.MergeProperty(propertyName);
            //console.groupEnd();
        });
        return this.Original;
    }
}
