# J A R V I T H  //  COGNITIVE INTERFACE v0.1

**JARVITH** is a highly stylized, web-based AI chat interface designed to feel like a classified, decommissioned terminal from an alternate 1990s where AI existed but the modern internet did not.

It completely abandons modern UI trends—no chat bubbles, no avatars, no rounded corners, and no bright colors. Instead, it embraces a **Brutalist Minimalism meets Analog Decay** aesthetic featuring an amber-on-black monospace layout, animated CRT scanlines, and subtle film grain.

🔗 **Live Interface:** [jarvith.vercel.app](https://jarvith.vercel.app)

## Features

### Immersion & Aesthetic
- **Strict Boot Sequence:** Requires a mandatory passphrase before unlocking the interface.
- **Top-Down Tape Flow:** The input sits at the very top of the screen; messages print downwards like a log tape and fade into static noise at the bottom.
- **Analog Decay:** Continuous CSS scanline animations, 80ms screen flickers on data reception, and a 60-second idle timer that heavily dims the display to "STANDBY".

### Intelligence Artifacts
Responses procedurally generate visual "artifacts of intelligence" to make the system feel truly alive:
- **Thought Mode:** Occasional leaks of JARVITH's internal monologue (`>> evaluating constraints...`).
- **Memory Stamps:** Unprompted callbacks to earlier queries (`[RECALL +01:34]`).
- **Confidence Glitches:** Flickering meters below responses visualizing the system's parsing success.
- **Redacted Data:** Chance-based `█████` blocks that reveal literal text underneath when hovered, styled as declassified material.
- **Error Injection:** Artificial I/O fatal errors that pause the stream before self-correcting.

### Persona Modes & Commands
Control the system via hidden `/` slash commands (which do not render visually in the chat tape):
- `/mode cold` (Default): Terse, fragmented, brutal brevity.
- `/mode verbose`: Dense, sweeping, and philosophical.
- `/mode ghost`: Eerie, character-by-character text streaming with unpredictable mid-word pauses.
- `/mode stealth`: Text instantly renders but completely fades to near-invisible opacity 5 seconds later.
- `/persona`: Cycle through the available modes.
- `/export`: Packages the current timeline into a `.log` file and seamlessly downloads it.
- `/clear`: Wipes the session tape.

## Tech Stack
- React
- Vite
- Vanilla CSS (Zero UI libraries)

## Installation & Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/7Aryannn/jarvith.git
   cd jarvith
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the cognitive interface:**
   ```bash
   npm run dev
   ```

4. **Access the terminal:**
   Open `http://localhost:5173`. Wait for the boot sequence. Enter any passphrase to begin. Remember: **Ctrl + Enter** is the only way to submit a query.

---

