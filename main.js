"use strict";
exports.__esModule = true;
var test = 'Hello worldd';
console.log(test);
alert("esee");
var Http = new XMLHttpRequest();
var url = 'index.html';
Http.open("GET", url);
Http.send();
Http.onreadystatechange = function (e) {
    console.log(Http.responseText);
};
