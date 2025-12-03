\# AWS Lab: Magic Box Number Analyzer Using AWS Lambda and S3

\### Objective

To design and deploy a fully serverless web application that accepts a user-provided date, derives four numerical inputs, and generates a 4×4 computed “magic box".



\## Step 1: Create a Lambda function



1\. Log in to the AWS Management Console and open "lambda".

&nbsp; 

&nbsp;  <img src="images/1.png" width="450"/>



2\. Click on "Create Function and configure as shown below"

&nbsp;  

&nbsp;  <img src="images/2.png" width="450"/><br>

&nbsp;  <img src="images/3.png" width="450"/><br>

&nbsp;  <img src="images/4.png" width="450"/><br>

&nbsp;  <img src="images/5.png" width="450"/><br>

&nbsp;  <img src="images/6.png" width="450"/><br>

&nbsp;  <img src="images/7.png" width="450"/><br>



---



\## Step 2: Adding the function logic



1. Inside the Lambda function - add a file called "index.js" and add the following code into it:



```bash

// index.js

// Magic Box Lambda Handler



exports.handler = async (event) => {

&nbsp; try {

&nbsp;   const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || event;



&nbsp;   const submittedBy = body.submittedBy || "anonymous";



&nbsp;   // Parse A B C D

&nbsp;   let { A, B, C, D } = body;



&nbsp;   if (A == null || B == null || C == null || D == null) {

&nbsp;     if (!body.date) throw new Error("Provide A,B,C,D or a date string.");



&nbsp;     const tokens = body.date.trim().split(/\\s+/);



&nbsp;     if (tokens.length === 4) {

&nbsp;       A = +tokens\[0];

&nbsp;       B = +tokens\[1];

&nbsp;       C = +tokens\[2];

&nbsp;       D = +tokens\[3];

&nbsp;     } else if (tokens.length === 3) {

&nbsp;       const dd = +tokens\[0];

&nbsp;       const mm = +tokens\[1];

&nbsp;       const year = tokens\[2];



&nbsp;       A = dd;

&nbsp;       B = mm;



&nbsp;       if (year.length === 4) {

&nbsp;         C = +year.slice(0, 2);

&nbsp;         D = +year.slice(2, 4);

&nbsp;       } else {

&nbsp;         throw new Error("Year must be YYYY when using DD MM YYYY format.");

&nbsp;       }

&nbsp;     } else {

&nbsp;       throw new Error("Invalid date format.");

&nbsp;     }

&nbsp;   }



&nbsp;   // Validate

&nbsp;   \[A, B, C, D].forEach(n => {

&nbsp;     if (!Number.isFinite(n)) throw new Error("A,B,C,D must be numbers.");

&nbsp;   });



&nbsp;   // Build 4×4 grid

&nbsp;   const grid = \[

&nbsp;     \[A, B, C, D],

&nbsp;     \[D+1, C-1, B-3, A+3],

&nbsp;     \[B-2, A+2, D+2, C-2],

&nbsp;     \[C+1, D-1, A+1, B-1]

&nbsp;   ];



&nbsp;   // Row sums

&nbsp;   const rowSums = grid.map(row => row.reduce((a,b)=>a+b,0));



&nbsp;   // Column sums

&nbsp;   const colSums = \[0,1,2,3].map(c => grid.reduce((s,r)=>s + r\[c], 0));



&nbsp;   // Flatten cells

&nbsp;   const cells = \[];

&nbsp;   for (let r=0;r<4;r++){

&nbsp;     for (let c=0;c<4;c++){

&nbsp;       cells.push({ r, c, id:`r${r}c${c}`, val:grid\[r]\[c] });

&nbsp;     }

&nbsp;   }



&nbsp;   // Contiguous combos (rows, cols, 2×2 squares, diagonals)

&nbsp;   const combos = \[];



&nbsp;   // rows

&nbsp;   for (let r=0;r<4;r++){

&nbsp;     combos.push({

&nbsp;       type:"row",

&nbsp;       coords:\[0,1,2,3].map(c=>`r${r}c${c}`),

&nbsp;       sum: grid\[r].reduce((a,b)=>a+b,0)

&nbsp;     });

&nbsp;   }



&nbsp;   // columns

&nbsp;   for (let c=0;c<4;c++){

&nbsp;     combos.push({

&nbsp;       type:"col",

&nbsp;       coords:\[0,1,2,3].map(r=>`r${r}c${c}`),

&nbsp;       sum: grid.reduce((s,row)=>s + row\[c],0)

&nbsp;     });

&nbsp;   }



&nbsp;   // 2×2 blocks (top-left 3×3 positions)

&nbsp;   for (let r=0;r<3;r++){

&nbsp;     for (let c=0;c<3;c++){

&nbsp;       const ids = \[

&nbsp;         `r${r}c${c}`, `r${r}c${c+1}`,

&nbsp;         `r${r+1}c${c}`, `r${r+1}c${c+1}`

&nbsp;       ];

&nbsp;       const sum = ids.reduce((s,id)=>{

&nbsp;         const cell = cells.find(cc=>cc.id===id);

&nbsp;         return s + cell.val;

&nbsp;       },0);



&nbsp;       combos.push({ type:"2x2", coords:ids, sum });

&nbsp;     }

&nbsp;   }



&nbsp;   // diagonals

&nbsp;   combos.push({

&nbsp;     type:"diag",

&nbsp;     coords:\[0,1,2,3].map(i=>`r${i}c${i}`),

&nbsp;     sum:\[0,1,2,3].reduce((s,i)=>s + grid\[i]\[i],0)

&nbsp;   });

&nbsp;   combos.push({

&nbsp;     type:"diag",

&nbsp;     coords:\[0,1,2,3].map(i=>`r${i}c${3-i}`),

&nbsp;     sum:\[0,1,2,3].reduce((s,i)=>s + grid\[i]\[3-i],0)

&nbsp;   });



&nbsp;   // All combinations of 4 cells matching any row/column sum

&nbsp;   const targets = new Set(\[...rowSums, ...colSums]);

&nbsp;   const matches = {};

&nbsp;   for (const t of targets) matches\[t] = \[];



&nbsp;   const N = cells.length; // 16

&nbsp;   for (let i=0;i<N-3;i++){

&nbsp;     for (let j=i+1;j<N-2;j++){

&nbsp;       for (let k=j+1;k<N-1;k++){

&nbsp;         for (let l=k+1;l<N;l++){

&nbsp;           const ids = \[cells\[i],cells\[j],cells\[k],cells\[l]];

&nbsp;           const sum = ids.reduce((s,c)=>s + c.val,0);

&nbsp;           if (targets.has(sum)) {

&nbsp;             matches\[sum].push({

&nbsp;               coords: ids.map(c=>c.id),

&nbsp;               sum

&nbsp;             });

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     }

&nbsp;   }



&nbsp;   const response = {

&nbsp;     submittedBy,

&nbsp;     input:{A,B,C,D},

&nbsp;     grid,

&nbsp;     rowSums,

&nbsp;     colSums,

&nbsp;     contiguousCombos: combos,

&nbsp;     matchedCombos: matches

&nbsp;   };



&nbsp;   return {

&nbsp;     statusCode: 200,

&nbsp;     headers:{

&nbsp;       "Content-Type":"application/json",

&nbsp;       "Access-Control-Allow-Origin":"\*"

&nbsp;     },

&nbsp;     body: JSON.stringify(response)

&nbsp;   };



&nbsp; } catch (err) {

&nbsp;   return {

&nbsp;     statusCode: 400,

&nbsp;     headers:{

&nbsp;       "Access-Control-Allow-Origin":"\*"

&nbsp;     },

&nbsp;     body: JSON.stringify({ error: err.message || String(err) })

&nbsp;   };

&nbsp; }

};

```

<img src="images/8.png" width="450"/><br>

<img src="images/9.png" width="450"/>



---



\## Step 3: Deploy the function 



<img src="images/10.png" width="450"/>



Go to the "Runtime Settings" section and make sure that the handler is set to "index.handler"



<img src="images/11.png" width="450"/>



---



\## Step 4: Create the API Gateway endpoint



1. Open the AWS console and click on "API Gateway". 



<img src="images/12.png" width="450"/>



2\. Build a HTTP API.



<img src="images/13.png" width="450"/><br>

<img src="images/14.png" width="450"/>



3\. Configure as per the steps shown below: 

<img src="images/15.png" width="450"/><br>

<img src="images/16.png" width="450"/><br>

<img src="images/17.png" width="450"/><br>

<img src="images/18.png" width="450"/><br>

<img src="images/19.png" width="450"/>



Leave the other permissions at default.



---



\## Step 5: Create the API Gateway and copy the invoke URL (can be found in "stages")



<img src="images/20.png" width="450"/>



---



\## Step 6: Create a project structure as given below:



```bash

magic-box-app/
│
├── lambda/
│   ├── index.js  
│   └── package.json  
│
└── frontend/
├── index.html  
├── app.js  
└── style.css

```



1. Enter the following code in index.js: 



```bash

// index.js

// Magic Box Lambda Handler



exports.handler = async (event) => {

&nbsp; try {

&nbsp;   const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || event;



&nbsp;   const submittedBy = body.submittedBy || "anonymous";



&nbsp;   // Parse A B C D

&nbsp;   let { A, B, C, D } = body;



&nbsp;   if (A == null || B == null || C == null || D == null) {

&nbsp;     if (!body.date) throw new Error("Provide A,B,C,D or a date string.");



&nbsp;     const tokens = body.date.trim().split(/\\s+/);



&nbsp;     if (tokens.length === 4) {

&nbsp;       A = +tokens\[0];

&nbsp;       B = +tokens\[1];

&nbsp;       C = +tokens\[2];

&nbsp;       D = +tokens\[3];

&nbsp;     } else if (tokens.length === 3) {

&nbsp;       const dd = +tokens\[0];

&nbsp;       const mm = +tokens\[1];

&nbsp;       const year = tokens\[2];



&nbsp;       A = dd;

&nbsp;       B = mm;



&nbsp;       if (year.length === 4) {

&nbsp;         C = +year.slice(0, 2);

&nbsp;         D = +year.slice(2, 4);

&nbsp;       } else {

&nbsp;         throw new Error("Year must be YYYY when using DD MM YYYY format.");

&nbsp;       }

&nbsp;     } else {

&nbsp;       throw new Error("Invalid date format.");

&nbsp;     }

&nbsp;   }



&nbsp;   // Validate

&nbsp;   \[A, B, C, D].forEach(n => {

&nbsp;     if (!Number.isFinite(n)) throw new Error("A,B,C,D must be numbers.");

&nbsp;   });



&nbsp;   // Build 4×4 grid

&nbsp;   const grid = \[

&nbsp;     \[A, B, C, D],

&nbsp;     \[D+1, C-1, B-3, A+3],

&nbsp;     \[B-2, A+2, D+2, C-2],

&nbsp;     \[C+1, D-1, A+1, B-1]

&nbsp;   ];



&nbsp;   // Row sums

&nbsp;   const rowSums = grid.map(row => row.reduce((a,b)=>a+b,0));



&nbsp;   // Column sums

&nbsp;   const colSums = \[0,1,2,3].map(c => grid.reduce((s,r)=>s + r\[c], 0));



&nbsp;   // Flatten cells

&nbsp;   const cells = \[];

&nbsp;   for (let r=0;r<4;r++){

&nbsp;     for (let c=0;c<4;c++){

&nbsp;       cells.push({ r, c, id:`r${r}c${c}`, val:grid\[r]\[c] });

&nbsp;     }

&nbsp;   }



&nbsp;   // Contiguous combos (rows, cols, 2×2 squares, diagonals)

&nbsp;   const combos = \[];



&nbsp;   // rows

&nbsp;   for (let r=0;r<4;r++){

&nbsp;     combos.push({

&nbsp;       type:"row",

&nbsp;       coords:\[0,1,2,3].map(c=>`r${r}c${c}`),

&nbsp;       sum: grid\[r].reduce((a,b)=>a+b,0)

&nbsp;     });

&nbsp;   }



&nbsp;   // columns

&nbsp;   for (let c=0;c<4;c++){

&nbsp;     combos.push({

&nbsp;       type:"col",

&nbsp;       coords:\[0,1,2,3].map(r=>`r${r}c${c}`),

&nbsp;       sum: grid.reduce((s,row)=>s + row\[c],0)

&nbsp;     });

&nbsp;   }



&nbsp;   // 2×2 blocks (top-left 3×3 positions)

&nbsp;   for (let r=0;r<3;r++){

&nbsp;     for (let c=0;c<3;c++){

&nbsp;       const ids = \[

&nbsp;         `r${r}c${c}`, `r${r}c${c+1}`,

&nbsp;         `r${r+1}c${c}`, `r${r+1}c${c+1}`

&nbsp;       ];

&nbsp;       const sum = ids.reduce((s,id)=>{

&nbsp;         const cell = cells.find(cc=>cc.id===id);

&nbsp;         return s + cell.val;

&nbsp;       },0);



&nbsp;       combos.push({ type:"2x2", coords:ids, sum });

&nbsp;     }

&nbsp;   }



&nbsp;   // diagonals

&nbsp;   combos.push({

&nbsp;     type:"diag",

&nbsp;     coords:\[0,1,2,3].map(i=>`r${i}c${i}`),

&nbsp;     sum:\[0,1,2,3].reduce((s,i)=>s + grid\[i]\[i],0)

&nbsp;   });

&nbsp;   combos.push({

&nbsp;     type:"diag",

&nbsp;     coords:\[0,1,2,3].map(i=>`r${i}c${3-i}`),

&nbsp;     sum:\[0,1,2,3].reduce((s,i)=>s + grid\[i]\[3-i],0)

&nbsp;   });



&nbsp;   // All combinations of 4 cells matching any row/column sum

&nbsp;   const targets = new Set(\[...rowSums, ...colSums]);

&nbsp;   const matches = {};

&nbsp;   for (const t of targets) matches\[t] = \[];



&nbsp;   const N = cells.length; // 16

&nbsp;   for (let i=0;i<N-3;i++){

&nbsp;     for (let j=i+1;j<N-2;j++){

&nbsp;       for (let k=j+1;k<N-1;k++){

&nbsp;         for (let l=k+1;l<N;l++){

&nbsp;           const ids = \[cells\[i],cells\[j],cells\[k],cells\[l]];

&nbsp;           const sum = ids.reduce((s,c)=>s + c.val,0);

&nbsp;           if (targets.has(sum)) {

&nbsp;             matches\[sum].push({

&nbsp;               coords: ids.map(c=>c.id),

&nbsp;               sum

&nbsp;             });

&nbsp;           }

&nbsp;         }

&nbsp;       }

&nbsp;     }

&nbsp;   }



&nbsp;   const response = {

&nbsp;     submittedBy,

&nbsp;     input:{A,B,C,D},

&nbsp;     grid,

&nbsp;     rowSums,

&nbsp;     colSums,

&nbsp;     contiguousCombos: combos,

&nbsp;     matchedCombos: matches

&nbsp;   };



&nbsp;   return {

&nbsp;     statusCode: 200,

&nbsp;     headers:{

&nbsp;       "Content-Type":"application/json",

&nbsp;       "Access-Control-Allow-Origin":"\*"

&nbsp;     },

&nbsp;     body: JSON.stringify(response)

&nbsp;   };



&nbsp; } catch (err) {

&nbsp;   return {

&nbsp;     statusCode: 400,

&nbsp;     headers:{

&nbsp;       "Access-Control-Allow-Origin":"\*"

&nbsp;     },

&nbsp;     body: JSON.stringify({ error: err.message || String(err) })

&nbsp;   };

&nbsp; }

};

```



2\. Enter the following code into package.json:



```bash

{

&nbsp; "name": "magic-box-lambda",

&nbsp; "version": "1.0.0",

&nbsp; "main": "index.js",

&nbsp; "description": "Magic box calculation Lambda",

&nbsp; "license": "MIT"

}

```



3\. Enter the following code into index.html:



```bash

<!doctype html>

<html>

<head>

&nbsp; <meta charset="utf-8">

&nbsp; <title>Magic Box App</title>

&nbsp; <link rel="stylesheet" href="style.css">

</head>

<body>



<h2>Magic 4×4 Box</h2>



<div class="controls">

&nbsp; <input id="date" placeholder="31 12 1995 or 31 12 19 95">

&nbsp; <input id="name" placeholder="Your name">

&nbsp; <button id="go">Compute</button>

&nbsp; <span id="status"></span>

</div>



<div id="grid" class="grid"></div>



<div class="sum-section">

&nbsp; <div>

&nbsp;   <h4>Row sums</h4>

&nbsp;   <div id="rows"></div>

&nbsp; </div>



&nbsp; <div>

&nbsp;   <h4>Column sums</h4>

&nbsp;   <div id="cols"></div>

&nbsp; </div>

</div>



<h3>Combinations</h3>

<div id="combos"></div>



<script src="app.js"></script>

</body>

</html>

```



4\. Enter the following code into style.css: 



body {

&nbsp; font-family: system-ui, sans-serif;

&nbsp; margin: 20px;

}



.controls {

&nbsp; display: flex;

&nbsp; gap: 10px;

&nbsp; align-items: center;

&nbsp; margin-bottom: 15px;

}



\#status.ok { color: green; }

\#status.err { color: red; }



.grid {

&nbsp; display: grid;

&nbsp; grid-template-columns: repeat(4, 60px);

&nbsp; gap: 8px;

&nbsp; margin: 15px 0;

}



.cell {

&nbsp; width: 60px;

&nbsp; height: 60px;

&nbsp; background: #f5f5f5;

&nbsp; border: 1px solid #bbb;

&nbsp; border-radius: 6px;

&nbsp; display: flex;

&nbsp; align-items: center;

&nbsp; justify-content: center;

&nbsp; font-weight: bold;

}



.cell.highlight {

&nbsp; background: #ffe9b5;

&nbsp; border-color: #ffb64c;

}



.sum-section {

&nbsp; display: flex;

&nbsp; gap: 40px;

}



\#combos .item {

&nbsp; padding: 6px;

&nbsp; border-bottom: 1px solid #ddd;

&nbsp; cursor: pointer;

}

```



5\. Enter the following code into app.js, and replace the API URL (on the first line) with the URL that you have copied in step 5:



```bash

const API = "YOUR\_API\_URL"; 



const gridDiv = document.getElementById("grid");

const rowsDiv = document.getElementById("rows");

const colsDiv = document.getElementById("cols");

const combosDiv = document.getElementById("combos");

const statusSpan = document.getElementById("status");



document.getElementById("go").onclick = async () => {

&nbsp; const date = document.getElementById("date").value.trim();

&nbsp; const name = document.getElementById("name").value.trim() || "anonymous";



&nbsp; statusSpan.textContent = "Working...";

&nbsp; statusSpan.className = "";



&nbsp; try {

&nbsp;   const res = await fetch(API, {

&nbsp;     method:"POST",

&nbsp;     headers:{ "Content-Type":"application/json" },

&nbsp;     body: JSON.stringify({ date, submittedBy:name })

&nbsp;   });



&nbsp;   if (!res.ok) throw new Error(await res.text());



&nbsp;   const data = await res.json();

&nbsp;   renderGrid(data.grid);

&nbsp;   renderSums(data.rowSums, data.colSums);

&nbsp;   renderCombos(data);



&nbsp;   statusSpan.textContent = "Done";

&nbsp;   statusSpan.className = "ok";



&nbsp; } catch (err) {

&nbsp;   statusSpan.textContent = "Error: " + err.message;

&nbsp;   statusSpan.className = "err";

&nbsp; }

};



function renderGrid(grid) {

&nbsp; gridDiv.innerHTML = "";

&nbsp; for (let r=0;r<4;r++){

&nbsp;   for (let c=0;c<4;c++){

&nbsp;     const cell = document.createElement("div");

&nbsp;     cell.className = "cell";

&nbsp;     cell.id = `r${r}c${c}`;

&nbsp;     cell.textContent = grid\[r]\[c];

&nbsp;     gridDiv.appendChild(cell);

&nbsp;   }

&nbsp; }

}



function highlight(ids) {

&nbsp; document.querySelectorAll(".cell").forEach(el => el.classList.remove("highlight"));

&nbsp; ids.forEach(id => {

&nbsp;   const el = document.getElementById(id);

&nbsp;   if (el) el.classList.add("highlight");

&nbsp; });

}



function renderSums(rowSums, colSums) {

&nbsp; rowsDiv.innerHTML = rowSums.map((s,i)=>`Row ${i+1}: ${s}`).join("<br>");

&nbsp; colsDiv.innerHTML = colSums.map((s,i)=>`Col ${i+1}: ${s}`).join("<br>");

}



function renderCombos(data) {

&nbsp; combosDiv.innerHTML = "";



&nbsp; // Contiguous combos first

&nbsp; data.contiguousCombos.forEach(c => {

&nbsp;   const div = document.createElement("div");

&nbsp;   div.className = "item";

&nbsp;   div.innerHTML = `<b>${c.type}</b> sum=${c.sum} — ${c.coords.join(", ")}`;

&nbsp;   div.onclick = () => highlight(c.coords);

&nbsp;   combosDiv.appendChild(div);

&nbsp; });



&nbsp; // All matching combos

&nbsp; for (const sum in data.matchedCombos) {

&nbsp;   const arr = data.matchedCombos\[sum];

&nbsp;   if (!arr.length) continue;



&nbsp;   const head = document.createElement("div");

&nbsp;   head.className = "item";

&nbsp;   head.style.background = "#eee";

&nbsp;   head.textContent = `All 4-cell combos with sum ${sum} (${arr.length})`;

&nbsp;   combosDiv.appendChild(head);



&nbsp;   arr.forEach(m => {

&nbsp;     const d = document.createElement("div");

&nbsp;     d.className = "item";

&nbsp;     d.textContent = `${m.coords.join(", ")} = ${m.sum}`;

&nbsp;     d.onclick = () => highlight(m.coords);

&nbsp;     combosDiv.appendChild(d);

&nbsp;   });

&nbsp; }

}

```

---



\## Step 6: Enable CORS



<img src="images/21.png" height="450"/> <br>



Configure as shown below and save it. 



<img src="images/22.png" width="450"/><br>

<img src="images/23.png" width="450"/> 



---



\## Step 7: Upload the Frontend in the S3 buckets



1. Create an S3 bucket



<img src="images/24.png" width="450"/><br>

<img src="images/25.png" width="450"/><br>

<img src="images/26.png" width="450"/><br>

<img src="images/27.png" width="450"/><br>

<img src="images/28.png" width="450"/><br>

<img src="images/29.png" width="450"/>



2\. Enable Static Website hosting



<img src="images/30.png" width="450"/><br>

<img src="images/31.png" width="450"/><br>

<img src="images/32.png" width="450"/><br>

<img src="images/33.png" width="450"/>



3\. Upload the frontend files into the object tab: 



<img src="images/34.png" width="450"/><br>



4\. Go to the permissions tab and add the bucket policy given below: 



<img src="images/35.png" width="450"/><br>

<img src="images/36.png" width="450"/>



Bucket policy (replace with your own bucket name in the last line:)

```bash 

{

&nbsp; "Version": "2012-10-17",

&nbsp; "Statement": \[

&nbsp;   {

&nbsp;     "Sid": "PublicReadForWebsite",

&nbsp;     "Effect": "Allow",

&nbsp;     "Principal": "\*",

&nbsp;     "Action": "s3:GetObject",

&nbsp;     "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/\*"

&nbsp;   }

&nbsp; ]

}

```

5\. Find your endpoint URL, which is usually in the below given format, to enter your website and test the magic box. 



```bash 

http://your-bucket-name.s3-website-region.amazonaws.com

```



<img src="images/37.png" width="450"/>

