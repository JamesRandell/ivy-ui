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
        this.minTime = 3000;
        this.timer = 0;
        this._loop();
    }
    get canvas() {
        return document.createElement("canvas");
    }
    static getInstance() {
        if (instance === null) {
            instance = new Log();
        }
        return instance;
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
            that._log_error(arguments);
            ogError.apply(console, arguments);
        };
        console['warn'] = function () {
            that.messages.push({
                type: 'warn',
                text: arguments[0]
            });
            that._log_warn(arguments);
            ogWarn.apply(console, arguments);
        };
        console['info'] = function () {
            that.messages.push({
                type: 'info',
                text: arguments[0]
            });
            that._log_info(arguments);
            ogInfo.apply(console, arguments);
        };
    }
    _log_error(arg) {
        this._status();
    }
    _log_warn(arg) {
        this._status();
    }
    _log_info(arg) {
        this._status();
    }
    _log_log(arg) {
        this._status();
    }
    _status() {
        const messageLength = this.messages.length;
        this.timer = Date.now();
        if (messageLength === 0) {
            this._close();
            return;
        }
        const status = document.getElementById('status');
        if (!status) {
            return;
        }
        var baseWidth = 48;
        if (status.classList.contains('error') === false) {
            baseWidth = parseFloat(getComputedStyle(status).width);
        }
        status.classList.add('error');
        const msg = '<p style="opacity:0">(1) ' + this.messages[0].text + '</p>';
        ;
        status.innerHTML += msg;
        const visibleMsg = status.getElementsByTagName('p')[0];
        visibleMsg.style.opacity = '1';
        const y = status.innerHTML;
        status.innerHTML = y.replace(/\s*\(.*?\)\s*/g, '(' + messageLength + ') ');
        const width = this._getTextWidth(status, visibleMsg.textContent) + 35;
        status.style.width = baseWidth + width + 'px';
        const that = this;
        setTimeout(function () {
            that._close();
        }, this.messages.length * this.minTime);
    }
    _cycle() {
    }
    _close() {
        const status = document.getElementById('status');
        const oldWidth = parseFloat(getComputedStyle(status).width);
        const that = this;
        const messageLength = this.messages.length;
        if (messageLength === 0) {
            this._closeStatus();
            return;
        }
        const visibleMsg = status.getElementsByTagName('p')[0];
        visibleMsg.style.marginTop = '-25px';
        visibleMsg.style.opacity = '0';
        if (status.getElementsByTagName('p')[1]) {
            status.getElementsByTagName('p')[1].style.opacity = '1';
            status.getElementsByTagName('p')[1].innerHTML = status.getElementsByTagName('p')[1].innerHTML.replace(/\s*\(.*?\)\s*/g, '(' + (messageLength - 1) + ') ');
        }
        setTimeout(function () {
            visibleMsg.remove();
            that.messages.shift();
            that._closeStatus();
        }, 250);
    }
    _closeStatus() {
        const status = document.getElementById('status');
        if (this.messages.length === 0) {
            status.classList.remove('error');
            status.textContent = '';
            status.style.width = '48px';
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
