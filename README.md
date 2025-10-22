# Painting Loop

An AI-powered iterative art generation application that creates a continuous loop of image generation, analysis, and conceptual evolution. Built with Tauri, React, and TypeScript.

## Examples

See the application in action: [https://imgur.com/a/c6gMS5J](https://imgur.com/a/c6gMS5J)

## Features

### 🎨 **Iterative Art Generation**
- Generates images using Stability AI's SD 3.5 Medium model
- Runs configurable generation loops (1-10 iterations)
- Automatically saves each generated image to disk
- Supports multiple style presets (3D model, anime, cinematic, comic book, etc.)

### 🧠 **AI-Powered Analysis**
- **Image Description**: OpenAI GPT-4o provides objective visual descriptions
- **Artist Statement**: Conceptual artist voice analyzes the work's theoretical framework
- **Critic's Opinion**: Contemporary art critic evaluates the work's market positioning
- **New Prompt Generation**: Creates evolved prompts based on conceptual discourse

### 🏛️ **Museum-Quality UI**
- Clean, minimal 4-quadrant layout (512x512 each)
- Upper left: Generated artwork
- Upper right: Current prompt
- Lower left: AI description
- Lower right: Critic's assessment
- Responsive design with 24px spacing between quadrants

### 💾 **Session Management**
- Automatic session data saving after each generation
- JSON format storing all generations with metadata
- Persistent storage of prompts, images, and analysis

## Application Flow

### 1. **Initial Setup**
```
User Input → Style Selection → Generation Count → Generate Button
```

### 2. **Generation Loop** (Repeats N times)
```
Prompt → Image Generation → Image Display → Artist Statement → Critic Opinion → New Prompt
```

### 3. **Sequential Processing**
- Image generates and displays immediately
- Artist statement appears after 1 second delay
- Critic opinion appears after 2 second delay  
- New prompt appears after 3 second delay
- Loop continues with evolved prompt

## AI Prompts & System Instructions

### **Image Description**
**System Prompt:**
```
You return strictly descriptive, non-interpretive prose about the supplied image.
Do not infer intent, symbolism, psychology, or narrative. Describe only what is visually present.
```

**User Prompt:** "Describe this image."

### **Artist Statement**
**System Prompt:**
```
The speaker is a conceptual artist discussing their own work. They use the language of contemporary art practice, referencing process, materiality, and conceptual frameworks. They articulate decisions rather than feelings and avoid sentimentality except where deployed as material. They speak from within institutional discourse, assuming the work's legitimacy rather than defending it. They frame the work as part of an ongoing research trajectory and position it in relation to broader cultural, technological, and art-historical contexts without over-citation. The register is intellectual yet accessible, terse and precise, with form and concept treated as inseparable. They do not narrate biography; they speak from within the logic of the work.
```

**User Prompt:** "Write an artist statement for this work."

### **Critic's Opinion**
**System Prompt:**
```
You are a contemporary critical theorist with deep familiarity with art history, institutional critique, and the present art-market discourse.
You focus specifically on what makes this image 'good' within the contemporary art scene. Analyze the work's strengths in relation to current artistic practices, market positioning, critical reception, and cultural relevance.
You evaluate the work's merit within institutional discourse and contemporary art-market conditions.

Start with a brief tl;dr summary, then provide a concise critique that is 40% shorter than typical responses.
```

**User Prompt:** "Critique this image."

### **New Prompt Generation**
**System Prompt:**
```
You are given:
(1) an artist statement, and
(2) a critic's statement about an existing artwork.

Your task is to generate a new image prompt for a different artwork that:

- emphasizes one conceptual aspect present in the discourse
- does not recreate or closely echo the original image's composition, motifs, or style
- treats the statements as conceptual source material, not visual reference

Output ONLY a concise, generatable image prompt describing an entirely new image that embodies a chosen conceptual aspect, with no mention of the original work, the discourse, or instructions. Do not include any other text, explanations, or formatting.
```

**User Input:** Artist statement + Critic opinion text

## Technical Architecture

### **Frontend (React + TypeScript)**
- State management with React hooks
- Sequential UI updates with setTimeout delays
- FormData API for Stability AI v2beta integration
- Base64 image encoding/decoding
- Error handling and loading states

### **Backend (Rust + Tauri)**
- OpenAI API integration with environment variable management
- Image saving to filesystem
- Session data serialization
- Secure API key handling

### **APIs Used**
- **Stability AI v2beta**: Image generation with SD 3.5 Medium
- **OpenAI GPT-4o**: Image analysis and text generation

## Setup Instructions

### **Prerequisites**
- Node.js and npm
- Rust (for Tauri)
- API keys for Stability AI and OpenAI

### **Installation**
```bash
npm install
```

### **Environment Variables**
Create a `.env` file in the project root:
```env
VITE_STABILITY_API_KEY=your-stability-api-key-here
OPENAI_API_KEY=your-openai-api-key-here
```

### **Development**
```bash
npm run tauri dev
```

### **Build**
```bash
npm run tauri build
```

## File Structure

```
src/
├── App.tsx              # Main React component with generation logic
├── App.css              # Museum-style UI layout
└── lib/
    ├── openai.ts        # OpenAI client configuration
    └── imageAnalysis.ts # Frontend analysis functions (legacy)

src-tauri/
├── src/lib.rs           # Rust backend with Tauri commands
├── Cargo.toml           # Rust dependencies
└── tauri.conf.json      # Tauri configuration

paintings/               # Generated images (auto-created)
sessions/                # Session data (auto-created)
```

## Session Data Format

```json
{
  "loops": [
    {
      "generation": 1,
      "prompt": "Original prompt text",
      "imageFilename": "painting-2025-01-21T10-30-45-123Z.png",
      "artistStatement": "Conceptual analysis...",
      "criticOpinion": "Market evaluation...",
      "newPrompt": "Evolved prompt for next generation"
    }
  ]
}
```

## Style Presets

Available Stability AI style presets:
- `none` - No style preset
- `3d-model` - 3D rendered appearance
- `analog-film` - Film photography aesthetic
- `anime` - Japanese animation style
- `cinematic` - Movie-like composition
- `comic-book` - Comic book illustration
- `digital-art` - Digital painting style
- `enhance` - Enhanced realism
- `fantasy-art` - Fantasy illustration
- `isometric` - Isometric projection
- `line-art` - Line drawing style
- `low-poly` - Low polygon 3D style
- `modeling-compound` - 3D modeling aesthetic
- `neon-punk` - Cyberpunk neon style
- `origami` - Paper folding aesthetic
- `photographic` - Realistic photography
- `pixel-art` - Pixelated retro style
- `tile-texture` - Textured tile pattern

## Credits

- **Stability AI**: Image generation with SD 3.5 Medium
- **OpenAI**: GPT-4o for image analysis and text generation
- **Tauri**: Cross-platform desktop app framework
- **React**: Frontend UI framework