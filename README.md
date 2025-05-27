<h1 align="center">TandyLinx</h1>


![Preview](https://github.com/user-attachments/assets/cf429d1d-07fd-4b98-9bde-6c7459df9c05)

<h2 align="center"><i>A link in bio focused on uniquely aesthetic templates</i></h2>

<p align="center">
  <img alt="Node" src="https://img.shields.io/badge/node-18.x-brightgreen?style=flat-square">
  <img alt="React" src="https://img.shields.io/badge/react-18.x-blue?style=flat-square">
</p>

A "link in bio" website builder focused on unique, artistically-driven templates. Built with React and Node.js, featuring server-side rendering for optimal performance. Self hosted in Vermont, USA.

## Built with

- React + Vite
- Three.js for 3D templates
- GSAP for animations
- Custom WebGL shaders
- Node.js + Express backend
- SQLite database
- Docker for deployment

## Features

- Unique visual templates:
  - 3D interactive cube navigation
  - Shader-based dynamic backgrounds
  - Embroidery-style generative art
  - Video-based effects


![ScreenRecording2025-01-29at12 00 43AM-ezgif com-resize](https://github.com/user-attachments/assets/3a870aab-98c6-4b9a-965f-93ee514b302c)

## Quick Start

### Using Docker
```bash

# Frontend (in a separate terminal)
cd frontend
npm install
npm run build

# Start the application
cd backend
node db.js # Initialize database (if not already initialized)
docker-compose up --build
```

### Without Docker
```bash
# Frontend (in a separate terminal)
cd frontend
npm install
npm run build

# Backend
cd backend
npm install
node db.js  # Initialize database (if not already initialized)
npm run dev

```

## Template Development

Templates are modular and self-contained. They are rendered using Nunjucks templating. Each template has access to:
- `{{ pageTitle }}`: Page title/username
- `{{ links }}`: Array of link objects with properties:
  - `url`: The destination URL
  - `name`: The display text
- `{{ profilePhotoUrl }}`: User's profile photo

## TODO or Possible Features

- Bio text
- Analytics
- Template customization options
- Social media links
- Of course, more templates
