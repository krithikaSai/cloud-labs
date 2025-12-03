// index.js
// Magic Box Lambda Handler

exports.handler = async (event) => {
  try {
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body || event;

    const submittedBy = body.submittedBy || "anonymous";

    // Parse A B C D
    let { A, B, C, D } = body;

    if (A == null || B == null || C == null || D == null) {
      if (!body.date) throw new Error("Provide A,B,C,D or a date string.");

      const tokens = body.date.trim().split(/\s+/);

      if (tokens.length === 4) {
        A = +tokens[0];
        B = +tokens[1];
        C = +tokens[2];
        D = +tokens[3];
      } else if (tokens.length === 3) {
        const dd = +tokens[0];
        const mm = +tokens[1];
        const year = tokens[2];

        A = dd;
        B = mm;

        if (year.length === 4) {
          C = +year.slice(0, 2);
          D = +year.slice(2, 4);
        } else {
          throw new Error("Year must be YYYY when using DD MM YYYY format.");
        }
      } else {
        throw new Error("Invalid date format.");
      }
    }

    // Validate
    [A, B, C, D].forEach(n => {
      if (!Number.isFinite(n)) throw new Error("A,B,C,D must be numbers.");
    });

    // Build 4×4 grid
    const grid = [
      [A, B, C, D],
      [D+1, C-1, B-3, A+3],
      [B-2, A+2, D+2, C-2],
      [C+1, D-1, A+1, B-1]
    ];

    // Row sums
    const rowSums = grid.map(row => row.reduce((a,b)=>a+b,0));

    // Column sums
    const colSums = [0,1,2,3].map(c => grid.reduce((s,r)=>s + r[c], 0));

    // Flatten cells
    const cells = [];
    for (let r=0;r<4;r++){
      for (let c=0;c<4;c++){
        cells.push({ r, c, id:`r${r}c${c}`, val:grid[r][c] });
      }
    }

    // Contiguous combos (rows, cols, 2×2 squares, diagonals)
    const combos = [];

    // rows
    for (let r=0;r<4;r++){
      combos.push({
        type:"row",
        coords:[0,1,2,3].map(c=>`r${r}c${c}`),
        sum: grid[r].reduce((a,b)=>a+b,0)
      });
    }

    // columns
    for (let c=0;c<4;c++){
      combos.push({
        type:"col",
        coords:[0,1,2,3].map(r=>`r${r}c${c}`),
        sum: grid.reduce((s,row)=>s + row[c],0)
      });
    }

    // 2×2 blocks (top-left 3×3 positions)
    for (let r=0;r<3;r++){
      for (let c=0;c<3;c++){
        const ids = [
          `r${r}c${c}`, `r${r}c${c+1}`,
          `r${r+1}c${c}`, `r${r+1}c${c+1}`
        ];
        const sum = ids.reduce((s,id)=>{
          const cell = cells.find(cc=>cc.id===id);
          return s + cell.val;
        },0);

        combos.push({ type:"2x2", coords:ids, sum });
      }
    }

    // diagonals
    combos.push({
      type:"diag",
      coords:[0,1,2,3].map(i=>`r${i}c${i}`),
      sum:[0,1,2,3].reduce((s,i)=>s + grid[i][i],0)
    });
    combos.push({
      type:"diag",
      coords:[0,1,2,3].map(i=>`r${i}c${3-i}`),
      sum:[0,1,2,3].reduce((s,i)=>s + grid[i][3-i],0)
    });

    // All combinations of 4 cells matching any row/column sum
    const targets = new Set([...rowSums, ...colSums]);
    const matches = {};
    for (const t of targets) matches[t] = [];

    const N = cells.length; // 16
    for (let i=0;i<N-3;i++){
      for (let j=i+1;j<N-2;j++){
        for (let k=j+1;k<N-1;k++){
          for (let l=k+1;l<N;l++){
            const ids = [cells[i],cells[j],cells[k],cells[l]];
            const sum = ids.reduce((s,c)=>s + c.val,0);
            if (targets.has(sum)) {
              matches[sum].push({
                coords: ids.map(c=>c.id),
                sum
              });
            }
          }
        }
      }
    }

    const response = {
      submittedBy,
      input:{A,B,C,D},
      grid,
      rowSums,
      colSums,
      contiguousCombos: combos,
      matchedCombos: matches
    };

    return {
      statusCode: 200,
      headers:{
        "Content-Type":"application/json",
        "Access-Control-Allow-Origin":"*"
      },
      body: JSON.stringify(response)
    };

  } catch (err) {
    return {
      statusCode: 400,
      headers:{
        "Access-Control-Allow-Origin":"*"
      },
      body: JSON.stringify({ error: err.message || String(err) })
    };
  }
};
