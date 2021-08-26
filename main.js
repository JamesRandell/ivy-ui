"use strict";
exports.__esModule = true;
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
