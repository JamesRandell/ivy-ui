export {};
let test: string  = 'Hello worldd';
console.log(test);
alert("esee");




const Http = new XMLHttpRequest();
const url ='index.html';
Http.open("GET", url);
Http.send();
Http.onreadystatechange=(e)=>{
console.log(Http.responseText)
}