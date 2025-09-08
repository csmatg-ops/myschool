const overlay = document.getElementById("welcome-overlay");
const enterBtn = document.getElementById("enter-btn");
const yearSpan = document.getElementById("year");
if (yearSpan) yearSpan.textContent = new Date().getFullYear();

// Welcome overlay removed; no gating of main content

// Simple confetti burst on first load for a cheerful vibe
(function confetti(){
  const already = sessionStorage.getItem("confetti_done");
  if (already) return;
  const colors = ["#ff6b6b","#ffd166","#06d6a0","#118ab2","#ff8a00","#0b74f1"];
  const count = 40;
  const frag = document.createDocumentFragment();
  for (let i=0;i<count;i++){
    const p = document.createElement("span");
    p.className = "confetti";
    const size = 6 + Math.random()*6;
    p.style.width = size+"px";
    p.style.height = size+"px";
    p.style.left = Math.random()*100 + "vw";
    p.style.background = colors[i%colors.length];
    p.style.animationDelay = (Math.random()*0.3)+"s";
    frag.appendChild(p);
  }
  document.body.appendChild(frag);
  setTimeout(()=>{
    document.querySelectorAll(".confetti").forEach(el=>el.remove());
  }, 2200);
  sessionStorage.setItem("confetti_done","1");
})();

const eventListElement = document.getElementById("event-list");
const eventForm = document.getElementById("event-form");
const eventInput = document.getElementById("event-input");
const editToggle = document.getElementById("edit-toggle");
let editMode = false;

// Gallery elements
const galleryGrid = document.getElementById("gallery-grid");
const galleryEditToggle = document.getElementById("gallery-edit-toggle");
const galleryForm = document.getElementById("gallery-form");
const galleryUrl = document.getElementById("gallery-url");
const galleryFile = document.getElementById("gallery-file");

function readEvents(){
  try { return JSON.parse(localStorage.getItem("glps_events") || "[]"); }
  catch { return []; }
}
function writeEvents(events){
  localStorage.setItem("glps_events", JSON.stringify(events));
}
function ensureSeed(){
  const existing = readEvents();
  if (existing.length === 0) {
    writeEvents([
      { id: crypto.randomUUID(), title: "School Reopens for New Term" },
      { id: crypto.randomUUID(), title: "Independence Day Celebration" },
      { id: crypto.randomUUID(), title: "Sports Day" }
    ]);
  }
}
function render(){
  if (!eventListElement) return;
  const events = readEvents();
  eventListElement.innerHTML = "";
  events.forEach(e => {
    const li = document.createElement("li");
    li.className = "event-item";
    const span = document.createElement("span");
    span.className = "title";
    span.textContent = e.title;
    li.appendChild(span);
    if (editMode){
      const del = document.createElement("button");
      del.textContent = "Delete";
      del.addEventListener("click", () => {
        const rest = readEvents().filter(x => x.id !== e.id);
        writeEvents(rest);
        render();
      });
      li.appendChild(del);
    }
    eventListElement.appendChild(li);
  });
}

editToggle?.addEventListener("click", () => {
  editMode = !editMode;
  editToggle.textContent = editMode ? "Done" : "Edit events";
  eventForm?.classList.toggle("hidden", !editMode);
  render();
});

eventForm?.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const title = (eventInput?.value || "").trim();
  if (!title) return;
  const events = readEvents();
  events.unshift({ id: crypto.randomUUID(), title });
  writeEvents(events);
  eventInput.value = "";
  render();
});

ensureSeed();
render();

// -------------------- Gallery Management --------------------
function readGallery(){
  try { return JSON.parse(localStorage.getItem("glps_gallery") || "[]"); }
  catch { return []; }
}
function writeGallery(items){
  localStorage.setItem("glps_gallery", JSON.stringify(items));
}
function seedGallery(){
  const items = readGallery();
  if (items.length === 0){
    writeGallery([
      { id: crypto.randomUUID(), src: "https://picsum.photos/seed/s1/800/520" },
      { id: crypto.randomUUID(), src: "https://picsum.photos/seed/s2/800/520" },
      { id: crypto.randomUUID(), src: "https://picsum.photos/seed/s3/800/520" }
    ]);
  }
}
function renderGallery(){
  if (!galleryGrid) return;
  const items = readGallery();
  galleryGrid.innerHTML = "";
  items.forEach(item => {
    const wrap = document.createElement("div");
    wrap.className = "gallery-item";
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = "Gallery photo";
    wrap.appendChild(img);
    if (galleryForm && !galleryForm.classList.contains("hidden")){
      const del = document.createElement("button");
      del.textContent = "✕";
      del.addEventListener("click", () => {
        const rest = readGallery().filter(x => x.id !== item.id);
        writeGallery(rest);
        renderGallery();
      });
      wrap.appendChild(del);
    }
    galleryGrid.appendChild(wrap);
  });
}

galleryEditToggle?.addEventListener("click", () => {
  galleryForm?.classList.toggle("hidden");
  galleryEditToggle.textContent = galleryForm?.classList.contains("hidden") ? "Manage" : "Done";
  renderGallery();
});

galleryForm?.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  const url = (galleryUrl?.value || "").trim();
  let src = url;
  if (!src && galleryFile && galleryFile.files && galleryFile.files[0]){
    // Read file as data URL for simple local persistence
    src = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsDataURL(galleryFile.files[0]);
    });
  }
  if (!src) return;
  const items = readGallery();
  items.unshift({ id: crypto.randomUUID(), src });
  writeGallery(items);
  if (galleryUrl) galleryUrl.value = "";
  if (galleryFile) galleryFile.value = "";
  renderGallery();
});

seedGallery();
renderGallery();
