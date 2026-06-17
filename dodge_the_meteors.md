# Dodge the Meteors — Claude Code Build Prompt

## Project Overview

Build a **2D side-scrolling browser game** called **"Dodge the Meteors"** using plain HTML, CSS, and JavaScript (no external libraries or frameworks). The game renders entirely on an HTML5 `<canvas>` element. The visual style is **wireframe, black and white only** — think an old-school arcade game drawn with outlines and no fills, or minimal chalk-on-blackboard aesthetic.

---

## File Structure

Create the following inside this folder:

```
C:\Users\vecto\OneDrive - CHARTERK12\2020-21 School Year\Documents\Claude Code\Web Game\
│
├── index.html
├── style.css
└── game.js
```

---

## Visual Style Rules

- **Background:** solid black (`#000000`)
- **All drawn elements:** white (`#FFFFFF`) outlines only — no fills, wireframe only
- **Font:** monospace (e.g., `Courier New`) for all UI text (score, level, "GAME OVER", etc.)
- **No color anywhere** — pure black and white, high contrast
- **Stroke weight:** 2px for most elements; 1px for fine details
- Line-art only. Everything should look like it was drawn with a white pen on black paper.

---

## Canvas & Viewport

- Canvas fills the full browser window (`100vw × 100vh`)
- Resize the canvas if the window is resized
- The world scrolls **right to left** (the character stays roughly at x = 120px from the left edge; the world moves toward him)

---

## The Character

- Simple wireframe stick figure or blocky humanoid — your choice, keep it minimal
- Draws at a fixed horizontal position (~120px from left edge)
- Stands on a **ground line** that runs across the bottom of the canvas (~80px from bottom)
- **States:**
  - `running` — 2–3 frame walk cycle (leg/arm swing, wireframe only)
  - `jumping` — single upward-arc pose
  - `flattened` — squashed flat on the ground (pancake shape with X eyes), triggered on meteor hit
- **Controls:**
  - `Spacebar` or `ArrowUp` → jump (single jump only; no double-jump)
  - Jump arc: smooth parabolic arc upward then back down
  - Cannot jump again until landed

---

## Ground Obstacles

Obstacles scroll from right to left at the **world scroll speed**. They spawn off the right edge of the canvas and despawn once they pass the left edge. Spawn them randomly with a minimum gap between obstacles so the game is always beatable.

### Obstacle Types (all wireframe white outlines)

| Obstacle | Description |
|---|---|
| **Barrel** | Upright cylinder outline with horizontal bands across it |
| **Cactus** | Classic two-armed cactus outline |
| **Rock** | Irregular polygon, low and wide |
| **Fence post** | Thin tall rectangle with an X brace |
| **Stump** | Short squat rectangle with ring lines on top |

- Mix obstacle types randomly
- Occasionally spawn **clusters** of exactly 2 obstacles close together for difficulty spikes — never 3 or more in a row. After any cluster of 2, enforce a mandatory minimum gap of at least 400–500px of clear ground before the next obstacle spawns. Track consecutive spawns with a counter and reset it after the forced gap.
- Heights vary slightly so the player must time jumps carefully

---

## Meteors (Falling from the Sky)

- Spawn from random x positions along the **top of the canvas**, off-screen
- Fall at a **steep diagonal angle** (mostly downward, slight leftward drift)
- Each meteor is a wireframe jagged rock shape with a short trailing line (motion trail)
- **Warning system:** 0.5 seconds before a meteor lands, show a small flashing `▼` indicator on the ground at its predicted landing x position
- Meteors land on the **ground line** and disappear (small dust puff: a few radiating lines)
- If a meteor's hitbox overlaps the character while falling → **FLATTENED** state (see below)
- Increase meteor frequency and speed as the level progresses

---

## Flattened State (Death)

When the character is hit by a meteor:

1. Character immediately switches to the `flattened` sprite — a wide flat squashed shape with X-eyes and stars/lines around it
2. **Freeze** all world scrolling and obstacle movement
3. Display centered text: `YOU WERE FLATTENED` (large, monospace)
4. Below that: `Press SPACE to try again`
5. After the player presses Space, **restart the current level from the beginning** (reset character position, clear all obstacles and meteors, reset scroll position)

---

## The Exit Door (Level Goal)

- Each level has a **fixed length** (e.g., scroll distance of 8000px worth of world movement)
- A **progress bar** (thin white outline rectangle) at the top of the canvas fills left-to-right as the player scrolls through the level
- When the player reaches the end of the level's scroll distance, spawn a **door** on the ground:
  - Wireframe door outline (rectangle with a small knob circle and frame lines)
  - Door slowly swings open (animate the door panel rotating outward) as the character approaches
- When the character reaches the door, play a brief **walk-through animation** (character walks off into the door), then:
  - Show: `LEVEL COMPLETE` centered text
  - Show: `Press SPACE for next level`
- On the next level: increase scroll speed, meteor frequency, obstacle density

---

## HUD (all white monospace text, top of canvas)

```
LEVEL: 1          DISTANCE: 4230 / 8000          SCORE: 1420
```

- **Score** increments every frame the player is alive (time-based survival score)
- **Distance** shows how far through the current level the player has scrolled
- Show a thin white horizontal line beneath the HUD to separate it from the game world

---

## Game States

| State | Description |
|---|---|
| `title` | Title screen: `DODGE THE METEORS` in large text, `Press SPACE to start` below |
| `playing` | Active gameplay |
| `flattened` | Death screen, awaiting restart |
| `levelComplete` | Level end screen, awaiting next level |

---

## Scrolling & Difficulty Scaling

- **Base scroll speed:** 3px per frame
- Each level increases scroll speed by +0.5px (capped at ~8px/frame on later levels)
- Meteor frequency starts at one meteor every ~4 seconds; increases each level
- Obstacle gap minimum decreases each level (harder obstacle density)

---

## Technical Notes

- Use `requestAnimationFrame` for the game loop
- Keep a `deltaTime` calculation so speed is frame-rate independent
- All drawing done with the Canvas 2D API (`ctx.strokeStyle`, `ctx.lineWidth`, `ctx.stroke()` — **never `ctx.fill()`**)
- Hitboxes should be slightly **smaller than the visual wireframe** (forgiving collision detection)
- No external images, audio, or assets — pure canvas drawing code only
- Comment the code clearly: each section (game loop, draw functions, input handling, collision, spawning) should have a comment header

---

## Stretch Goals (implement if time allows)

- **Parallax background:** faint white wireframe mountains or city silhouette scrolling at half speed in the background
- **High score:** store best score in `localStorage` and show it on the title screen
- **Combo multiplier:** consecutive dodges of meteors (without getting hit) multiply the score

---

## Deliverable Checklist

- [ ] `index.html` — canvas element, links to CSS and JS
- [ ] `style.css` — black background, no scrollbars, canvas fills viewport
- [ ] `game.js` — all game logic, well-commented
- [ ] Game runs by simply opening `index.html` in a browser (no server needed)
- [ ] All five obstacle types implemented and spawning randomly
- [ ] Meteors fall, warn player, and flatten character on hit
- [ ] Exit door appears at end of level and triggers level transition
- [ ] HUD shows level, distance, and score
- [ ] Title screen and all game states implemented
- [ ] Pure wireframe black-and-white visual style throughout
