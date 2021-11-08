//@ts-ignore
import { template } from '/ivy-ui/resource/script/client/template.js';
const html = `<section class="content">
<p>This is some CASSANDRA content</p>
{{db.datacenter}}

<p>Datacenter: {{datacenter}}</p>
l
{{#each db.host}}
{{hostID}}<br>
<ul>
{{#each}}
<li>{{key}}: {{value}}</li>
{{/each}}
</ul>
this after third loop<br>
{{/each}}
ppp<br>


</section>`;
var data = {
    "db": {
        "datacenter": "datacenter1",
        "host": [
            {
                "status": "Unknown status",
                "state": "Unknown state",
                "load": "16",
                "owns": "100.0%",
                "hostID": "541a3a6c-c20d-4a5a-8c81-53a432e1069a",
                "rack": "rack1"
            }
        ]
    }
};
Object.entries(data["db"]["host"][0]).map((item, iii) => {
    if (data["db"]["host"].hasOwnProperty(iii)) {
        console.log(Object.keys(data["db"]["host"][iii]));
    }
});
const v = template.parse(html, data);
const person = {
    fullName: function () {
        return this;
    }
};
//const handler = new Function(  "const data = this; console.warn(data); return `"+v +"`;").apply(data);
const q = document.querySelector('.content');
q.innerHTML = template.compile(v, data);
/*

*/ 
