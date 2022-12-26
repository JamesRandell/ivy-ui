/**
 * function handles the closing of the modal.
 * When a user clicks the 'close' button, or the background, we change the URL to what ever it was before the
 * modal was opened, and adjust the class list
 */
let instance = null;
var c = {};
export default class Log {
    methodNames;
    messages = [];
    status = document.getElementById('status');
    baseWidth = 48;
    /**
     * This displays the count of how many messages are queued up to display. It's what's in the parethesis
     */
    count = true;
    /**
     * Displays the last message only, doesn't bother queuing anything
     */
    last = false;
    minTime = 3000;
    timer = 0;
    timerLoop;
    get canvas() {
        return document.createElement("canvas");
    }
    constructor() {
        this._loop();
    }
    static getInstance() {
        if (instance === null) {
            instance = new Log();
        }
        return instance;
    }
    msg(string) {
        this.messages.push({
            type: 'warn',
            text: string
        });
        this._status();
    }
    _loop() {
        const that = this;
        const methodNames = ['log', 'warn', 'error', 'status', 'info'];
        const ogError = console['error'];
        const ogWarn = console['warn'];
        const ogInfo = console['info'];
        const ogLog = console['log'];
        console['error'] = function () {
            that.messages.push({
                type: 'error',
                text: arguments[0]
            });
            that._log_error();
            ogError.apply(console, arguments);
        };
        console['warn'] = function () {
            that.messages.push({
                type: 'warn',
                text: arguments[0]
            });
            that._log_warn();
            ogWarn.apply(console, arguments);
        };
        console['info'] = function () {
            that.messages.push({
                type: 'info',
                text: arguments[0]
            });
            //that._log_info(arguments)
            ogInfo.apply(console, arguments);
        };
    }
    _log_error() {
        this._status();
    }
    _log_warn() {
        this._status();
    }
    _log_info() {
        this._status();
    }
    _log_log() {
        this._status();
    }
    _status() {
        const messageLength = this.messages.length;
        this.timer = Date.now();
        if (messageLength === 0) {
            this._close();
            return;
        }
        if (!this.status) {
            return;
        }
        if (this.status.classList.contains('error') === false) {
            //this.baseWidth = parseFloat(getComputedStyle(this.status).width);
        }
        this.status.classList.add('error');
        let countMsg = '';
        if (this.count === true) {
            countMsg = '(' + messageLength + ') ';
        }
        else {
            countMsg = '';
        }
        const msg = '<p style="opacity:0">' + countMsg + arg[0] + '</p>';
        if (messageLength === 1) {
            this.status.innerHTML = '';
        }
        this.status.innerHTML += msg;
        const visibleMsg = this.status.getElementsByTagName('p')[0];
        visibleMsg.style.opacity = '1';
        const y = this.status.innerHTML;
        this.status.innerHTML = y.replace(/\s*\(.*?\)\s*/g, countMsg);
        const width = this._getTextWidth(this.status, visibleMsg.textContent) + 35;
        this.status.style.width = this.baseWidth + width + 'px';
        const that = this;
        const timerCount = (this.last === true) ? 3250 : messageLength * this.minTime;
        // cant get this bit working quite right
        /**
         *
        clearTimeout(this.timerLoop);
        if (this.last == true && messageLength > 1) {
            clearTimeout(this.timerLoop);
            that._close();
        } else {
            this.timerLoop = setTimeout(function() {
                that._close();
            }, timerCount);
        }
        **/
        setTimeout(function () {
            that._close();
        }, timerCount);
    }
    _cycle() {
    }
    _close() {
        const oldWidth = parseFloat(getComputedStyle(this.status).width);
        const that = this;
        const messageLength = this.messages.length;
        if (messageLength === 0) {
            this._closeStatus();
            return;
        }
        const visibleMsg = this.status.getElementsByTagName('p')[0];
        if (visibleMsg) {
            visibleMsg.style.marginTop = '-25px';
            visibleMsg.style.opacity = '0';
        }
        let msg = '';
        // get width of second element if it exists
        if (this.status.getElementsByTagName('p').length > 1) {
            msg = this.status.getElementsByTagName('p')[1];
        }
        else {
            msg = this.status.getElementsByTagName('p')[0];
        }
        const width = this._getTextWidth(this.status, msg.textContent) + 35;
        // this.baseWidth = parseFloat(getComputedStyle(this.status).width);
        this.status.style.width = (this.baseWidth + width) + 'px';
        if (this.status.getElementsByTagName('p')[1]) {
            this.status.getElementsByTagName('p')[1].style.opacity = '1';
            this.status.getElementsByTagName('p')[1].innerHTML = this.status.getElementsByTagName('p')[1].innerHTML.replace(/\s*\(.*?\)\s*/g, '(' + (messageLength - 1) + ') ');
        }
        setTimeout(function () {
            if (visibleMsg) {
                visibleMsg.remove();
            }
            that.messages.shift();
            that._closeStatus();
        }, 250);
    }
    _closeStatus() {
        if (this.messages.length === 0) {
            this.status.classList.remove('error');
            this.status.textContent = '';
            this.status.style.width = this.baseWidth + 'px';
            return;
        }
    }
    /**
     * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
     *
     * @param {Object} element The object to look at. This is so we can figure out the font and size.
     * @param {String} string The text itself.
     *
     * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
     */
    _getTextWidth(element, text) {
        // re-use canvas object for better performance
        const canvas = this.canvas;
        const context = canvas.getContext("2d");
        context.font = this._getCanvasFont(element);
        const metrics = context.measureText(text);
        return metrics.width;
    }
    _getCanvasFont(el = document.body) {
        const fontWeight = this._getCssStyle(el, 'font-weight') || 'normal';
        const fontSize = this._getCssStyle(el, 'font-size') || '16px';
        const fontFamily = this._getCssStyle(el, 'font-family') || 'Times New Roman';
        return `${fontWeight} ${fontSize} ${fontFamily}`;
    }
    _getCssStyle(element, prop) {
        return window.getComputedStyle(element, null).getPropertyValue(prop);
    }
}
