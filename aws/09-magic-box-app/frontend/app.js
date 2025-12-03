const API = "https://5rmklkvlo1.execute-api.us-east-1.amazonaws.com/compute"; 

const gridDiv = document.getElementById("grid");
const rowsDiv = document.getElementById("rows");
const colsDiv = document.getElementById("cols");
const combosDiv = document.getElementById("combos");
const statusSpan = document.getElementById("status");

document.getElementById("go").onclick = async () => {
  const date = document.getElementById("date").value.trim();
  const name = document.getElementById("name").value.trim() || "anonymous";

  statusSpan.textContent = "Working...";
  statusSpan.className = "";

  try {
    const res = await fetch(API, {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ date, submittedBy:name })
    });

    if (!res.ok) throw new Error(await res.text());

    const data = await res.json();
    renderGrid(data.grid);
    renderSums(data.rowSums, data.colSums);
    renderCombos(data);

    statusSpan.textContent = "Done";
    statusSpan.className = "ok";

  } catch (err) {
    statusSpan.textContent = "Error: " + err.message;
    statusSpan.className = "err";
  }
};

function renderGrid(grid) {
  gridDiv.innerHTML = "";
  for (let r=0;r<4;r++){
    for (let c=0;c<4;c++){
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.id = `r${r}c${c}`;
      cell.textContent = grid[r][c];
      gridDiv.appendChild(cell);
    }
  }
}

function highlight(ids) {
  document.querySelectorAll(".cell").forEach(el => el.classList.remove("highlight"));
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add("highlight");
  });
}

function renderSums(rowSums, colSums) {
  rowsDiv.innerHTML = rowSums.map((s,i)=>`Row ${i+1}: ${s}`).join("<br>");
  colsDiv.innerHTML = colSums.map((s,i)=>`Col ${i+1}: ${s}`).join("<br>");
}

function renderCombos(data) {
  combosDiv.innerHTML = "";

  // Contiguous combos first
  data.contiguousCombos.forEach(c => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `<b>${c.type}</b> sum=${c.sum} — ${c.coords.join(", ")}`;
    div.onclick = () => highlight(c.coords);
    combosDiv.appendChild(div);
  });

  // All matching combos
  for (const sum in data.matchedCombos) {
    const arr = data.matchedCombos[sum];
    if (!arr.length) continue;

    const head = document.createElement("div");
    head.className = "item";
    head.style.background = "#eee";
    head.textContent = `All 4-cell combos with sum ${sum} (${arr.length})`;
    combosDiv.appendChild(head);

    arr.forEach(m => {
      const d = document.createElement("div");
      d.className = "item";
      d.textContent = `${m.coords.join(", ")} = ${m.sum}`;
      d.onclick = () => highlight(m.coords);
      combosDiv.appendChild(d);
    });
  }
}
