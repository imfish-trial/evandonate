// ===== DONATE BUTTONS =====
const donateContainer = document.getElementById("donateContainer");
const toggleMore = document.getElementById("toggleMore");

const mainPasses = [
  {price:"5 Robux",id:"1020542254"},{price:"5 Robux",id:"1020094045"},{price:"5 Robux",id:"1020428387"},
  {price:"10 Robux",id:"1020450431"},{price:"10 Robux",id:"1020454406"},{price:"10 Robux",id:"1020704264"},
  {price:"50 Robux",id:"1020568362"},{price:"50 Robux",id:"1020424455"},{price:"100 Robux",id:"1020570265"},
  {price:"200 Robux",id:"1020734251"}
];
const morePasses = [
  {price:"500 Robux",id:"1020231953"},{price:"1000 Robux",id:"1019950218"},{price:"5000 Robux",id:"1020203961"},
  {price:"10000 Robux",id:"1020580353"},{price:"100000 Robux",id:"1020012201"}
];

function createButton(pass){
  const link = document.createElement("a");
  link.href = `https://www.roblox.com/game-pass/${pass.id}`;
  link.target = "_blank";
  link.className = "donate-btn";
  link.innerHTML = `<span class="robux-icon"><span class="outer"><span class="inner"></span></span></span> ${pass.price}`;
  return link;
}

mainPasses.forEach(p => donateContainer.appendChild(createButton(p)));

let showingMore = false;
toggleMore.addEventListener("click", () => {
  if(!showingMore){
    morePasses.forEach(p => donateContainer.appendChild(createButton(p)));
    toggleMore.textContent = "Hide Options";
  } else {
    donateContainer.innerHTML = "";
    mainPasses.forEach(p => donateContainer.appendChild(createButton(p)));
    toggleMore.textContent = "Show More Options";
  }
  showingMore = !showingMore;
});

// ===== CONTACT MODAL =====
const contactBtn = document.getElementById("discordBtn");
const contactModal = document.getElementById("discordModal");
const closeBtn = contactModal.querySelector(".close");

contactBtn.addEventListener("click", () => contactModal.style.display = "block");
closeBtn.addEventListener("click", () => contactModal.style.display = "none");
window.addEventListener("click", (e) => { if(e.target==contactModal) contactModal.style.display="none"; });

// ===== SPACE CANVAS =====
const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
let stars = [];
let shootingStars = [];

function resizeCanvas(){ canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

function createStars(count){
  stars = [];
  for(let i=0;i<count;i++){
    stars.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      size: Math.random()*1.2 + 0.5,
      opacity: Math.random(),
      delta: Math.random()*0.02 + 0.005
    });
  }
}
createStars(400);

function createShootingStar(){
  shootingStars.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height/2,
    len: Math.random()*100 + 50,
    speed: Math.random()*10 + 5,
    angle: Math.random()*0.3 - 0.15,
    opacity: 1
  });
}
setInterval(createShootingStar, 2000);

function drawStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(s => {
    ctx.fillStyle=`rgba(255,255,255,${s.opacity})`;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.size,0,Math.PI*2);
    ctx.fill();
    s.opacity += s.delta;
    if(s.opacity>1 || s.opacity<0.2) s.delta*=-1;
  });
  shootingStars.forEach((s, idx) => {
    ctx.strokeStyle = `rgba(255,255,255,${s.opacity})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(s.x - s.len * Math.cos(s.angle), s.y - s.len * Math.sin(s.angle));
    ctx.stroke();
    s.x += s.speed * Math.cos(s.angle);
    s.y += s.speed * Math.sin(s.angle);
    s.opacity -= 0.02;
    if(s.opacity <= 0) shootingStars.splice(idx,1);
  });
}
function animate(){
  drawStars();
  requestAnimationFrame(animate);
}
animate();

// ===== LEADERBOARD =====
const leaderboardContainer = document.getElementById("leaderboard");
const viewMoreBtn = document.getElementById("viewMoreBtn");
const nextPageBtn = document.getElementById("nextPageBtn");

let donators = [];
let currentPage = 1;
let perPage = 3;

async function loadDonators(){
  try{
    const res = await fetch("donators.json");
    const data = await res.json();
    donators = data.sort((a,b)=>b.amount-a.amount);
    renderLeaderboard(currentPage);
    viewMoreBtn.style.display = donators.length>3 ? "inline-block":"none";
    nextPageBtn.style.display = donators.length>10 ? "inline-block":"none";
  }catch(err){
    console.error("Failed to load donators.json", err);
  }
}

async function renderLeaderboard(page){
  leaderboardContainer.innerHTML = "";
  let start = (page-1)*perPage;
  let end = start + perPage;
  let current = donators.slice(start,end);

  for(const [i,d] of current.entries()){
    try{
      // Fetch avatar headshot from Roblox API via roproxy
      const res = await fetch(`https://thumbnails.roproxy.com/v1/users/avatar-headshot?userIds=${d.userId}&size=48x48&format=Png&isCircular=true`);
      const apiData = await res.json();
      const avatarUrl = apiData.data[0]?.imageUrl || "default-avatar.png";

      const entry = document.createElement("div");
      entry.className = "donator-entry " + (i===0 && start===0 ? "top1": i===1 && start===0 ? "top2": i===2 && start===0 ? "top3":"");
      entry.innerHTML = `
        <img class="donator-avatar" src="${avatarUrl}" />
        <div class="donator-info">${d.username} - ${d.amount} R$</div>
      `;
      leaderboardContainer.appendChild(entry);
    }catch(err){
      console.error("Failed to fetch avatar for", d.username, err);
    }
  }
}

viewMoreBtn.addEventListener("click", ()=>{
  perPage = 10;
  currentPage = 1;
  renderLeaderboard(currentPage);
  viewMoreBtn.style.display = "none";
  nextPageBtn.style.display = donators.length>10 ? "inline-block" : "none";
});

nextPageBtn.addEventListener("click", ()=>{
  currentPage++;
  if((currentPage-1)*perPage >= donators.length) currentPage = 1;
  renderLeaderboard(currentPage);
});

loadDonators();
