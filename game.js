// ============================================================
// DODGE THE METEORS — game.js
// Pure canvas, wireframe black-and-white, no external assets
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// ── Canvas resize ────────────────────────────────────────────
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ── Constants ────────────────────────────────────────────────
const CHAR_SPEED_RIGHT = 4;
const CHAR_SPEED_LEFT  = 2; // fixed; slower than scroll so player can't run left to escape
const GROUND_OFFSET = 80; // px from bottom
const BASE_SCROLL = 3;
function levelLength(lvl) { return 4000 + (lvl - 1) * 1000; } // Level 1=4000 … Level 7=10000
const JUMP_VELOCITY = -14 * 2 / 3;
const GRAVITY = 0.55 * 2 / 3;
const HUD_HEIGHT = 36;

// ── Game state ───────────────────────────────────────────────
let state = 'title'; // title | playing | flattened | levelComplete | gameWin | paused
let level = 1;
let score = 0;
let distance = 0;
let scrollSpeed = BASE_SCROLL;
let lastTime = 0;

// ── Input ────────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
  if (!keys[e.code]) {
    keys[e.code] = true;
    handleKeyPress(e.code);
  }
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

function handleKeyPress(code) {
  if (code === 'Escape') {
    if (state === 'playing') state = 'paused';
    else if (state === 'paused') state = 'playing';
    return;
  }
  if (code !== 'Space' && code !== 'ArrowUp') return;
  if (state === 'title') { startLevel(1); return; }
  if (state === 'flattened') { startLevel(level); return; }
  if (state === 'levelComplete') { startLevel(level); return; }
  if (state === 'gameWin') { score = 0; startLevel(1); return; }
  if (state === 'playing') { tryJump(); }
}

// ── Character ────────────────────────────────────────────────
const char = {
  x: 0,
  y: 0,
  vy: 0,
  onGround: true,
  state: 'running', // running | jumping | flattened
  frame: 0,
  frameTimer: 0,
  FRAME_RATE: 10, // frames per animation tick
};

function groundY() {
  return canvas.height - GROUND_OFFSET;
}

function charFeetY() {
  return groundY(); // feet are at ground line
}

function tryJump() {
  if (!char.onGround) return;
  char.vy = JUMP_VELOCITY;
  char.onGround = false;
  char.state = 'jumping';
}

function updateChar(dt) {
  if (char.state === 'flattened') return;

  // Horizontal movement
  if (keys['ArrowLeft'])  char.x -= CHAR_SPEED_LEFT  * dt * 60;
  if (keys['ArrowRight']) char.x += CHAR_SPEED_RIGHT * dt * 60;
  char.x = Math.max(8, Math.min(canvas.width - 8, char.x));

  // Physics
  if (!char.onGround) {
    char.vy += GRAVITY * dt * 60;
    char.y += char.vy * dt * 60;
    if (char.y >= 0) {
      char.y = 0;
      char.vy = 0;
      char.onGround = true;
      char.state = 'running';
    }
  }

  // Walk cycle
  if (char.state === 'running') {
    char.frameTimer++;
    if (char.frameTimer >= char.FRAME_RATE) {
      char.frameTimer = 0;
      char.frame = (char.frame + 1) % 3;
    }
  }
}

// char.y is offset from ground (0 = standing, negative = in air)
function charScreenY() {
  return groundY() + char.y;
}

// ── Draw: Character ──────────────────────────────────────────
function drawChar() {
  const cx = char.x;
  const fy = charScreenY(); // feet y
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;

  if (char.state === 'flattened') {
    drawFlattened(cx, fy);
    return;
  }

  if (char.state === 'jumping') {
    drawCharJump(cx, fy);
    return;
  }

  drawCharRun(cx, fy, char.frame);
}

function drawCharRun(cx, fy, frame) {
  // Head
  circle(cx, fy - 46, 8);
  // Body
  line(cx, fy - 38, cx, fy - 20);
  // Arms swing
  const armSwing = [6, 0, -6][frame];
  line(cx, fy - 34, cx - 10, fy - 26 + armSwing);
  line(cx, fy - 34, cx + 10, fy - 26 - armSwing);
  // Legs
  const legSwing = [8, 0, -8][frame];
  line(cx, fy - 20, cx - 7, fy - 8 + legSwing);
  line(cx - 7, fy - 8 + legSwing, cx - 9, fy);
  line(cx, fy - 20, cx + 7, fy - 8 - legSwing);
  line(cx + 7, fy - 8 - legSwing, cx + 9, fy);
}

function drawCharJump(cx, fy) {
  circle(cx, fy - 50, 8);
  line(cx, fy - 42, cx, fy - 24);
  line(cx, fy - 36, cx - 12, fy - 28);
  line(cx, fy - 36, cx + 12, fy - 28);
  line(cx, fy - 24, cx - 9, fy - 12);
  line(cx - 9, fy - 12, cx - 12, fy);
  line(cx, fy - 24, cx + 9, fy - 12);
  line(cx + 9, fy - 12, cx + 12, fy);
}

function drawFlattened(cx, fy) {
  // Pancake body
  ctx.beginPath();
  ctx.ellipse(cx, fy - 4, 26, 5, 0, 0, Math.PI * 2);
  ctx.stroke();
  // X eyes
  line(cx - 8, fy - 10, cx - 4, fy - 6);
  line(cx - 4, fy - 10, cx - 8, fy - 6);
  line(cx + 4, fy - 10, cx + 8, fy - 6);
  line(cx + 8, fy - 10, cx + 4, fy - 6);
  // Stars
  for (let i = 0; i < 5; i++) {
    const ang = (i / 5) * Math.PI * 2;
    const sx = cx + Math.cos(ang) * 36;
    const sy = (fy - 4) + Math.sin(ang) * 18;
    line(sx - 4, sy, sx + 4, sy);
    line(sx, sy - 4, sx, sy + 4);
  }
}

// ── Obstacles ────────────────────────────────────────────────
let obstacles = [];
let nextObstacleIn = 0; // px of scroll until next spawn
let consecutiveObstacleCount = 0;
let cactusArmCounter = 0;

const OBSTACLE_TYPES = ['barrel', 'cactus', 'rock', 'fence', 'stump'];
const MIN_GAP = 350;
const POST_CLUSTER_GAP = 450; // mandatory clear runway after 2 consecutive obstacles

function spawnObstacle() {
  const type = OBSTACLE_TYPES[Math.floor(Math.random() * OBSTACLE_TYPES.length)];
  // Only cluster when count is 0; cap at 2 so we never reach 3 in a row
  const cluster = (Math.random() < 0.15 && consecutiveObstacleCount === 0) ? 2 : 1;
  for (let i = 0; i < cluster; i++) {
    const armStyle = type === 'cactus' ? cactusArmCounter++ % 4 : 0;
    obstacles.push({ type, x: canvas.width + 20 + i * 55, passed: false, armStyle });
  }
  consecutiveObstacleCount += cluster;

  if (consecutiveObstacleCount >= 2) {
    // Force recovery gap then reset the streak
    nextObstacleIn = POST_CLUSTER_GAP;
    consecutiveObstacleCount = 0;
  } else {
    nextObstacleIn = 250 + Math.random() * 450 - (level - 1) * 15;
    nextObstacleIn = Math.max(nextObstacleIn, 200);
  }
}

function updateObstacles(scrollDelta) {
  nextObstacleIn -= scrollDelta;
  if (nextObstacleIn <= 0 && !door) spawnObstacle();

  for (const obs of obstacles) {
    obs.x -= scrollDelta;
  }
  obstacles = obstacles.filter(o => o.x > -100);
}

function obstacleHitbox(obs) {
  const gy = groundY();
  switch (obs.type) {
    case 'barrel':  return { x: obs.x - 12, y: gy - 34, w: 24, h: 34 };
    case 'cactus':  return { x: obs.x - 12, y: gy - 50, w: 24, h: 50 };
    case 'rock':    return { x: obs.x - 22, y: gy - 20, w: 44, h: 20 };
    case 'fence':   return { x: obs.x - 8,  y: gy - 40, w: 16, h: 40 };
    case 'stump':   return { x: obs.x - 14, y: gy - 24, w: 28, h: 24 };
    default:        return { x: obs.x - 10, y: gy - 30, w: 20, h: 30 };
  }
}

function drawObstacles() {
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;
  for (let i = 0; i < obstacles.length; i++) {
    const obs = obstacles[i];
    const gy = groundY();
    switch (obs.type) {
      case 'barrel': drawBarrel(obs.x, gy); break;
      case 'cactus': drawCactus(obs.x, gy, obs.armStyle); break;
      case 'rock':   drawRock(obs.x, gy);   break;
      case 'fence':  drawFence(obs.x, gy);  break;
      case 'stump':  drawStump(obs.x, gy);  break;
    }
  }
}

function drawBarrel(x, gy) {
  rect(x - 12, gy - 34, 24, 34);
  line(x - 12, gy - 22, x + 12, gy - 22);
  line(x - 12, gy - 12, x + 12, gy - 12);
}

function drawCactus(x, gy, phase) {
  // Trunk (unchanged)
  line(x, gy, x, gy - 50);
  // Arms cycle through 4 orientations based on phase
  switch (phase % 4) {
    case 0: // Left — tips extend further leftward
      line(x, gy - 34, x - 16, gy - 34);
      line(x - 16, gy - 34, x - 28, gy - 34);
      line(x, gy - 28, x + 16, gy - 28);
      line(x + 16, gy - 28, x + 4, gy - 28);   // right tip hooks back left
      break;
    case 1: // Down — tips droop downward (original style)
      line(x, gy - 34, x - 16, gy - 34);
      line(x - 16, gy - 34, x - 16, gy - 22);
      line(x, gy - 28, x + 16, gy - 28);
      line(x + 16, gy - 28, x + 16, gy - 18);
      break;
    case 2: // Right — tips extend further rightward
      line(x, gy - 34, x - 16, gy - 34);
      line(x - 16, gy - 34, x - 4, gy - 34);   // left tip hooks back right
      line(x, gy - 28, x + 16, gy - 28);
      line(x + 16, gy - 28, x + 28, gy - 28);
      break;
    case 3: // Up — tips point upward
      line(x, gy - 34, x - 16, gy - 34);
      line(x - 16, gy - 34, x - 16, gy - 46);
      line(x, gy - 28, x + 16, gy - 28);
      line(x + 16, gy - 28, x + 16, gy - 40);
      break;
  }
}

function drawRock(x, gy) {
  ctx.beginPath();
  ctx.moveTo(x - 22, gy);
  ctx.lineTo(x - 18, gy - 14);
  ctx.lineTo(x - 6,  gy - 20);
  ctx.lineTo(x + 8,  gy - 18);
  ctx.lineTo(x + 22, gy - 8);
  ctx.lineTo(x + 22, gy);
  ctx.closePath();
  ctx.stroke();
}

function drawFence(x, gy) {
  rect(x - 8, gy - 40, 16, 40);
  line(x - 8, gy - 40, x + 8, gy);
  line(x + 8, gy - 40, x - 8, gy);
}

function drawStump(x, gy) {
  rect(x - 14, gy - 24, 28, 24);
  // Rings on top
  line(x - 10, gy - 24, x - 10, gy - 28);
  line(x - 4,  gy - 24, x - 4,  gy - 28);
  line(x + 2,  gy - 24, x + 2,  gy - 28);
  line(x + 8,  gy - 24, x + 8,  gy - 28);
  line(x - 14, gy - 28, x + 14, gy - 28);
}

// ── Meteors ──────────────────────────────────────────────────
let meteors = [];
let nextMeteorIn = 0;
let meteorInterval = 240; // frames between meteors
let dustPuffs = [];
let warningFlash = 0;

function spawnMeteor() {
  const x = canvas.width * 0.3 + Math.random() * canvas.width * 0.7;
  const speed = 4 + Math.random() * 2 + level * 0.4;
  meteors.push({
    x,
    y: -30,
    vx: -(0.3 + Math.random() * 0.2) * speed,
    vy: speed,
    warned: false,
    warningX: 0,
    age: 0,
  });
  nextMeteorIn = meteorInterval;
}

function updateMeteors(dt) {
  nextMeteorIn -= dt * 60;
  if (nextMeteorIn <= 0 && !door) spawnMeteor();

  const gy = groundY();
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    m.age += dt;
    m.x += m.vx * dt * 60;
    m.y += m.vy * dt * 60;

    // Compute predicted landing x
    if (!m.warned) {
      const framesLeft = (gy - m.y) / (m.vy);
      m.warningX = m.x + m.vx * framesLeft;
    }
    // Show warning 30 frames (0.5s) before landing
    const framesToGround = (gy - m.y) / m.vy;
    m.warned = framesToGround < 30;

    // Landed
    if (m.y >= gy) {
      dustPuffs.push({ x: m.x, y: gy, life: 30 });
      meteors.splice(i, 1);
    }
  }

  // Update dust
  for (let i = dustPuffs.length - 1; i >= 0; i--) {
    dustPuffs[i].life--;
    if (dustPuffs[i].life <= 0) dustPuffs.splice(i, 1);
  }

  warningFlash = (warningFlash + 1) % 20;
}

function drawMeteors() {
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;
  const gy = groundY();

  for (const m of meteors) {
    ctx.lineWidth = 1;
    drawMeteorTail(m.x, m.y, m.vx, m.vy, m.age);
    ctx.lineWidth = 2;
    drawMeteorShape(m.x, m.y);

    // Warning indicator
    if (m.warned && warningFlash < 10) {
      ctx.font = '14px "Courier New"';
      ctx.fillStyle = '#FFF';
      ctx.fillText('▼', m.warningX - 6, gy + 18);
    }
  }

  // Dust puffs
  ctx.lineWidth = 1;
  for (const d of dustPuffs) {
    const t = 1 - d.life / 30;
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI;
      const r = t * 20;
      line(d.x, d.y, d.x + Math.cos(ang) * r, d.y - Math.sin(ang) * r);
    }
  }
  ctx.lineWidth = 2;
}

function drawMeteorShape(x, y) {
  // Points scaled 5/3 from the original body for a larger visual
  const pts = [
    [x,      y - 20],
    [x + 12, y - 10],
    [x + 17, y +  3],
    [x +  7, y + 13],
    [x -  7, y + 17],
    [x - 17, y +  7],
    [x - 13, y -  7],
    [x -  5, y - 17],
  ];
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.closePath();
  ctx.stroke();
}

function drawMeteorTail(x, y, vx, vy, age) {
  const speed = Math.sqrt(vx * vx + vy * vy);
  const tdx = -vx / speed; // unit vector pointing opposite to travel (away from nose)
  const tdy = -vy / speed;
  const pdx = -tdy;        // perpendicular for spreading the base
  const pdy =  tdx;

  // Tip distance oscillates 3.5×/sec: stubby (15px) → stretched (70px)
  const t = (Math.sin(age * 2 * Math.PI * 3.5) + 1) / 2;
  const tailLen = 15 + 55 * t;

  // Two base points spread apart at the rear surface of the body (constant width)
  const baseOffset = 15;
  const baseSpread = 10;
  const b1x = x + tdx * baseOffset + pdx * baseSpread;
  const b1y = y + tdy * baseOffset + pdy * baseSpread;
  const b2x = x + tdx * baseOffset - pdx * baseSpread;
  const b2y = y + tdy * baseOffset - pdy * baseSpread;

  // Single tip: both lines converge here
  const tipx = x + tdx * (baseOffset + tailLen);
  const tipy = y + tdy * (baseOffset + tailLen);

  line(b1x, b1y, tipx, tipy);
  line(b2x, b2y, tipx, tipy);
}

// ── Exit Door ────────────────────────────────────────────────
let door = null;
let doorAngle = 0;     // 0 = closed, PI/2 = fully open (edge-on)
let doorSwingTime = -1; // seconds elapsed since swing started; -1 = not yet triggered
let levelCompleteTimer = 0;
const DOOR_SWING_DURATION = 0.7; // seconds for door to swing fully open

function easeOutQuad(t) { return 1 - (1 - t) * (1 - t); }

function spawnDoor() {
  door = { x: canvas.width + 40 };
}

function updateDoor(scrollDelta, dt) {
  if (!door) return;
  door.x -= scrollDelta;

  const dist = Math.abs(door.x - char.x);
  if (dist < 60 && doorSwingTime < 0) doorSwingTime = 0;
  if (doorSwingTime >= 0) {
    doorSwingTime = Math.min(doorSwingTime + dt, DOOR_SWING_DURATION);
    doorAngle = easeOutQuad(doorSwingTime / DOOR_SWING_DURATION) * Math.PI / 2;
  }

  if (dist < 20 && doorAngle >= Math.PI / 2 - 0.05) {
    if (level === 7) {
      state = 'gameWin';
    } else {
      state = 'levelComplete';
      level++;
    }
  }
}

function drawDoor() {
  if (!door) return;
  const gy = groundY();
  const x = door.x;
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;

  // Frame (fixed)
  rect(x - 18, gy - 56, 36, 56);
  // Knob (fixed on frame)
  circle(x + 8, gy - 28, 3);
  // Door panel: hinge on left edge, swings rightward into the room.
  // Foreshorten the apparent width as angle increases: width = full * cos(angle).
  // At angle=0 the panel fills the opening; at PI/2 it's edge-on (invisible).
  const panelW = 36 * Math.cos(doorAngle);
  if (panelW > 0.5) {
    rect(x - 18, gy - 56, panelW, 56);
  }
}

// ── Parallax Background ──────────────────────────────────────
let bgOffset = 0;
const mountains = generateMountains();

function generateMountains() {
  const pts = [];
  let x = 0;
  while (x < 4000) {
    const w = 120 + Math.random() * 200;
    const h = 60 + Math.random() * 120;
    pts.push({ x, w, h });
    x += w * 0.7;
  }
  return pts;
}

function drawBackground() {
  const gy = groundY();
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  const wrap = 3000;
  const offset = bgOffset % wrap;

  for (const m of mountains) {
    const mx = ((m.x - offset) % wrap + wrap) % wrap - 200;
    if (mx > canvas.width + 200) continue;
    ctx.beginPath();
    ctx.moveTo(mx, gy - 30);
    ctx.lineTo(mx + m.w / 2, gy - 30 - m.h);
    ctx.lineTo(mx + m.w, gy - 30);
    ctx.stroke();
  }
}

// ── Collision Detection ──────────────────────────────────────
function checkCollisions() {
  const charHB = {
    x: char.x - 8,
    y: charScreenY() - 46,
    w: 16,
    h: 46,
  };

  // Obstacle collision
  for (const obs of obstacles) {
    const hb = obstacleHitbox(obs);
    if (rectsOverlap(charHB, hb)) { flattenChar(); return; }
  }

  // Meteor collision (while in air)
  for (const m of meteors) {
    const mHB = { x: m.x - 8, y: m.y - 8, w: 16, h: 16 };
    if (rectsOverlap(charHB, mHB)) { flattenChar(); return; }
  }
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

function flattenChar() {
  char.state = 'flattened';
  state = 'flattened';
}

// ── HUD ──────────────────────────────────────────────────────
function drawHUD() {
  ctx.fillStyle = '#FFF';
  ctx.font = '16px "Courier New"';
  const curLen = levelLength(level);
  const dist = Math.floor(Math.min(distance, curLen));
  ctx.fillText(`LEVEL: ${level}`, 16, 22);
  ctx.fillText(`DISTANCE: ${dist} / ${curLen}`, canvas.width / 2 - 120, 22);
  ctx.fillText(`SCORE: ${Math.floor(score)}`, canvas.width - 140, 22);

  // HUD separator
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 1;
  line(0, HUD_HEIGHT, canvas.width, HUD_HEIGHT);

  // Progress bar
  const barX = 16, barY = HUD_HEIGHT + 6, barW = canvas.width - 32, barH = 6;
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 1;
  rect(barX, barY, barW, barH);
  const fill = (Math.min(distance, curLen) / curLen) * barW;
  ctx.fillStyle = '#FFF';
  ctx.fillRect(barX, barY, fill, barH);
}

// ── Ground line ──────────────────────────────────────────────
function drawGround() {
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;
  line(0, groundY(), canvas.width, groundY());
}

// ── Title Screen ─────────────────────────────────────────────
function drawTitle() {
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = '#FFF';
  ctx.fillStyle = '#FFF';

  ctx.font = 'bold 52px "Courier New"';
  ctx.textAlign = 'center';
  ctx.fillText('DODGE THE METEORS', canvas.width / 2, canvas.height / 2 - 40);

  ctx.font = '22px "Courier New"';
  ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2 + 20);

  const hi = localStorage.getItem('dtm_hiscore');
  if (hi) {
    ctx.font = '16px "Courier New"';
    ctx.fillText(`HIGH SCORE: ${Math.floor(hi)}`, canvas.width / 2, canvas.height / 2 + 60);
  }

  ctx.textAlign = 'left';
}

// ── Overlay messages ─────────────────────────────────────────
function drawFlattenedScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 48px "Courier New"';
  ctx.fillText('YOU WERE FLATTENED', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '22px "Courier New"';
  ctx.fillText('Press SPACE to try again', canvas.width / 2, canvas.height / 2 + 30);
  ctx.textAlign = 'left';
}

function drawLevelComplete() {
  ctx.fillStyle = 'rgba(0,0,0,0.6)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 48px "Courier New"';
  ctx.fillText('LEVEL COMPLETE', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '22px "Courier New"';
  ctx.fillText('Press SPACE for next level', canvas.width / 2, canvas.height / 2 + 30);
  ctx.textAlign = 'left';
}

function drawWinScreen() {
  ctx.fillStyle = 'rgba(0,0,0,0.85)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 72px "Courier New"';
  ctx.fillText('YOU WIN', canvas.width / 2, canvas.height / 2 - 90);
  ctx.font = '28px "Courier New"';
  ctx.fillText('All 7 levels complete!', canvas.width / 2, canvas.height / 2 - 20);
  ctx.font = '22px "Courier New"';
  ctx.fillText(`Score: ${Math.floor(score)}`, canvas.width / 2, canvas.height / 2 + 30);
  ctx.font = '20px "Courier New"';
  ctx.fillText('Press SPACE to return to title', canvas.width / 2, canvas.height / 2 + 80);
  ctx.textAlign = 'left';
}

// ── Level init ───────────────────────────────────────────────
function startLevel(lvl) {
  level = lvl;
  scrollSpeed = BASE_SCROLL + (level - 1) * 0.5;
  scrollSpeed = Math.min(scrollSpeed, 8);
  meteorInterval = Math.max(60, 240 - (level - 1) * 30);
  distance = 0;
  bgOffset = 0;
  obstacles = [];
  meteors = [];
  dustPuffs = [];
  door = null;
  doorAngle = 0;
  doorSwingTime = -1;
  nextObstacleIn = 150 + Math.random() * 100;
  consecutiveObstacleCount = 0;
  cactusArmCounter = 0;
  nextMeteorIn = meteorInterval;

  char.x = Math.floor(canvas.width / 2);
  char.y = 0;
  char.vy = 0;
  char.onGround = true;
  char.state = 'running';
  char.frame = 0;
  char.frameTimer = 0;

  if (state === 'title') score = 0;
  state = 'playing';
}

// ── Pause overlay ────────────────────────────────────────────
function drawPauseOverlay() {
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const bw = 360;
  const bh = 150;
  const bx = cx - bw / 2;
  const by = cy - bh / 2;

  ctx.fillStyle = 'rgba(0,0,0,0.5)';
  ctx.fillRect(bx, by, bw, bh);
  ctx.strokeStyle = '#FFF';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);

  ctx.fillStyle = '#FFF';
  ctx.textAlign = 'center';
  ctx.font = 'bold 48px "Courier New"';
  ctx.fillText('PAUSED', cx, cy - 8);
  ctx.font = '20px "Courier New"';
  ctx.fillText('Press ESC to resume', cx, cy + 36);
  ctx.textAlign = 'left';
}

// ── Main game loop ───────────────────────────────────────────
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // cap at 50ms
  lastTime = timestamp;

  if (state === 'paused') {
    drawPauseOverlay();
    requestAnimationFrame(gameLoop);
    return;
  }

  // Clear
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (state === 'title') {
    drawTitle();
    requestAnimationFrame(gameLoop);
    return;
  }

  let scrollDelta = (state === 'playing') ? scrollSpeed * dt * 60 : 0;

  // Once the exit door reaches the canvas midpoint, stop all world scrolling.
  // Clamp scrollDelta so the door lands exactly at center, then stays there.
  if (door) {
    const mid = canvas.width / 2;
    if (door.x - scrollDelta <= mid) {
      scrollDelta = Math.max(0, door.x - mid);
    }
  }

  // Update
  if (state === 'playing') {
    distance += scrollDelta;
    score += dt * 10 * level;
    bgOffset += scrollDelta * 0.4;

    updateChar(dt);
    updateObstacles(scrollDelta);
    updateMeteors(dt);
    checkCollisions();

    // Spawn door when level distance reached
    if (distance >= levelLength(level) && !door && state === 'playing') spawnDoor();
    updateDoor(scrollDelta, dt);

    // Save high score
    const hi = parseFloat(localStorage.getItem('dtm_hiscore') || '0');
    if (score > hi) localStorage.setItem('dtm_hiscore', score);
  }

  // Draw background
  drawBackground();
  drawGround();
  drawObstacles();
  drawMeteors();
  drawDoor();
  drawChar();
  drawHUD();

  if (state === 'flattened')    drawFlattenedScreen();
  if (state === 'levelComplete') drawLevelComplete();
  if (state === 'gameWin')      drawWinScreen();

  requestAnimationFrame(gameLoop);
}

// ── Utility draw helpers ─────────────────────────────────────
function line(x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function rect(x, y, w, h) {
  ctx.strokeRect(x, y, w, h);
}

function circle(x, y, r) {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

// ── Start ────────────────────────────────────────────────────
requestAnimationFrame(gameLoop);
