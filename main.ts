export {};
let test: string  = 'Hello world';
console.log(test);


const special = document.querySelectorAll("p") as HTMLParagraphElement;
special.innerText('fff');

const Http = new XMLHttpRequest();
const url ='index.html';
Http.open("GET", url);
Http.send();
Http.onreadystatechange=(e)=>{
console.log(Http.responseText)
}