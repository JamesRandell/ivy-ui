/**
 * function handles the closing of the modal.
 * When a user clicks the 'close' button, or the background, we change the URL to what ever it was before the
 * modal was opened, and adjust the class list
 */
let instance = null;
var c = {};
export default class Log {
    constructor() {
        this.messages = [];
        this._loop();
    }
    static getInstance() {
        if (instance === null) {
            instance = new Widget();
        }
        return instance;
    }
    _loop() {
        const methodNames = ['log', 'warn', 'error', 'status', 'info'];
        var messages = [];
        methodNames.forEach(methodName => {
            const ogMethod = (c[methodName] = console[methodName]);
            console[methodName] = function () {
                const params = Array.prototype.slice.call(arguments, 1);
                const msg = params.length;
                messages.push({
                    type: methodName,
                    msg
                });
                ogMethod.apply(console, arguments);
            };
        });
        const restore = () => {
            Object.keys(c).forEach(methodName => {
                console[methodName] = c[methodName];
            });
        };
        /*process.on('beforeExit', () => {
            restore();

            console.log('*** printing saved msgs ***');
            this.messages.forEach(m => {
                console.log('%s: %s', m.type, m.message)
            
            })
        })*/
    }
}
