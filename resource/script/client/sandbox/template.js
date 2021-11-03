//@ts-ignore
import { template } from '/ivy-ui/resource/script/client/template.js';
const html = "<section class=\"content\">\n    This is some CASSANDRA content<br>\n    {{firstname}}\n    {{last name}}<br>\n    {{parent.child}}<br>\n    after firstname<br>\n    {{#each default}}\n    {{name}}-{{key}}-{{value}}:Something else<br>\n    {{/each}}\n    Some other content\n</section>";
var data = {
    firstname: "James",
    "last name": "Savoy",
    parent: {
        child: "HELLO!"
    },
    default: [
        {
            name: "Steve"
        },
        {
            name: "David"
        },
        {
            name: "Fred"
        }
    ]
};
const v = template.parse(html, data);
const person = {
    fullName: function () {
        return this;
    }
};
//const handler = new Function(  "const data = this; console.warn(data); return `"+v +"`;").apply(data);
const q = document.querySelector('.content');
q.innerHTML = template.compile(v, data);
