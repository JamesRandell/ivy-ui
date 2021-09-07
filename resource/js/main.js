let test = 'Hello worldd';
console.log(test);
alert("eseweeee");
const Http = new XMLHttpRequest();
const url = 'index.html';
Http.open("GET", url);
Http.send();
Http.onreadystatechange = (e) => {
    console.log(Http.responseText);
};
function greeter(person) {
    return "Hello, " + person;
}
let user = "Jane User";
document.body.textContent = greeter(user);
function setBackgroundColor() {
    document.body.style.backgroundColor = "rgb(255,0,0)";
}
setBackgroundColor();
export {};
