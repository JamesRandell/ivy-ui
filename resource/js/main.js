(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var test = 'Hello world';
    console.log(test);
    var special = document.querySelectorAll("p");
    special.innerText('fff');
    var Http = new XMLHttpRequest();
    var url = 'index.html';
    Http.open("GET", url);
    Http.send();
    Http.onreadystatechange = function (e) {
        console.log(Http.responseText);
    };
});
