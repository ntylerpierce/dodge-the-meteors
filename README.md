# 🌑 Dodge the Meteors

A wireframe black-and-white 2D side-scrolling survival game built with pure HTML, CSS, and JavaScript.

🎮 [Play on Vercel](https://dodge-the-meteors-ten.vercel.app/)

---

## About the Game

Run through a scrolling world, jump over obstacles, dodge falling meteors, and reach the exit door at the end of each level. One wrong move and you're flattened. The wireframe black-and-white aesthetic keeps it clean — everything drawn with white outlines on a black canvas, no fills, no frills.

Built with zero dependencies — pure HTML5 Canvas, vanilla JavaScript, and CSS. No build step, no server required.

---

## How to Play

| Action | Keyboard | Mobile |
|---|---|---|
| Move Left | `←` Arrow | Left button |
| Move Right | `→` Arrow | Right button |
| Jump | `Space` or `↑` Arrow | JUMP button |
| Pause | `Escape` | PAUSE button |

**Goal:** Reach the exit door at the end of each level without being flattened by a meteor or colliding with an obstacle. The door swings open when you arrive — walk through it to advance.

---

## Features

- 7 levels of increasing difficulty
- 5 obstacle types: barrel, cactus, rock, fence post, stump
- Falling meteors with animated flame tails and ground warning indicators (▼)
- Flattened death state with instant restart
- Exit door with swing-open animation — world stops scrolling when the door reaches center screen
- Ground-based scoring — points only accumulate while the player is running on the ground; jumping pauses the counter
- Score freezes when the world stops scrolling at the end of a level
- Death resets the score back to what it was at the start of that level — no death-farming exploits
- High score saved locally via `localStorage`
- Mobile touch controls overlay
- Parallax wireframe mountain background
- Pause functionality (Escape key or PAUSE button)
- Clusters capped at 2 obstacles — always beatable

---

## Levels

| Level | Distance |
|---|---|
| 1 | 4,000 units |
| 2 | 5,000 units |
| 3 | 6,000 units |
| 4 | 7,000 units |
| 5 | 8,000 units |
| 6 | 9,000 units |
| 7 | 10,000 units ⭐ Final Level |

Completing Level 7 triggers the win screen. Scroll speed, meteor frequency, and obstacle density all increase with each level.

---

## How to Run Locally

```bash
git clone https://github.com/vecto/dodge-the-meteors.git
cd dodge-the-meteors
```

Then open `index.html` in any modern browser. That's it — no server, no build step, no dependencies.

---

## Built With

- HTML5 Canvas API
- Vanilla JavaScript
- CSS3
- No external libraries or frameworks

---

## License

MIT License
