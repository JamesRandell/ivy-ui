
//@ts-ignore
import { template } from '/resource/script/client/template.js';

const html = `<section class="content">
<p>This is some CASSANDRA content</p>
<p>Datacenter: {{db.datacenter}}</p>


l
{{#each db.host}}
{{hostID}}<br>
<ul>
{{#each}}
<li>{{key|uppercase}}: {{value}}</li>
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
}

const fileName = "resource/template/widget/cassandra.html";
const v = template.parse(html, data, fileName);



const person = {
    fullName: function() {
      return this;
    }
  }

//const handler = new Function(  "const data = this; console.warn(data); return `"+v +"`;").apply(data);



const q = document.querySelector('footer');
console.log(q)
q.innerHTML = template.compile(v, data);

/*

*/