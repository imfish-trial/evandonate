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

// ===== SPACE CANVAS IMPROVED =====
const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
let stars = [];
let shootingStars = [];

function resizeCanvas(){ canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// Clearer stars
function createStars(count){
  stars = [];
  for(let i=0;i<count;i++){
    stars.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      size: Math.random()*1.5 + 0.5,
      opacity: Math.random()*0.7 + 0.3,
      delta: Math.random()*0.01 + 0.002
    });
  }
}
createStars(400);

// Better shooting stars
function createShootingStar(){
  shootingStars.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height/2,
    length: Math.random()*150 + 100,
    speed: Math.random()*15 + 10,
    angle: Math.random()*0.3 - 0.15,
    opacity: 1,
    trail: []
  });
}
setInterval(createShootingStar, 1500);

function drawStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // Draw stars as crisp squares (better on mobile)
  stars.forEach(s => {
    ctx.fillStyle=`rgba(255,255,255,${s.opacity})`;
    ctx.fillRect(s.x,s.y,s.size,s.size);
    s.opacity += s.delta;
    if(s.opacity>1 || s.opacity<0.3) s.delta*=-1;
  });

  // Draw shooting stars with fading trails
  shootingStars.forEach((s, idx) => {
    s.trail.push({x: s.x, y: s.y});
    if(s.trail.length>10) s.trail.shift();

    for(let t=0;t<s.trail.length;t++){
      const trailPart = s.trail[t];
      const alpha = (t+1)/s.trail.length * s.opacity;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if(t<s.trail.length-1){
        ctx.moveTo(trailPart.x, trailPart.y);
        ctx.lineTo(s.trail[t+1].x, s.trail[t+1].y);
        ctx.stroke();
      }
    }

    s.x += s.speed * Math.cos(s.angle);
    s.y += s.speed * Math.sin(s.angle);
    s.opacity -= 0.02;
    if(s.opacity <= 0 || s.x > canvas.width || s.y > canvas.height) shootingStars.splice(idx,1);
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