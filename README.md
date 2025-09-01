Socket.IO Chat App

Overview
This is a minimal real‑time chat application built with Express and Socket.IO.

Features
- Broadcasts a message to everyone when a user joins.
- Sends chat messages to all connected clients in real time.
- Messages from the current user appear right-aligned; incoming messages appear left-aligned.

Getting Started
1. Install dependencies
   npm install

2. Start the server (default port 3000)
   npm start

   Or start another instance on a different port (e.g., 3001 or 3002 on Windows):
   npm run start:3001
   npm run start:3002

3. Open the app
   Visit http://localhost:3000 or http://localhost:3001 in your browser. You can run two servers on different ports and chat between them by opening each in its own tab/window.

Project Structure
- server.js: Express server and Socket.IO setup.
- public/index.html: Basic chat UI.
- public/script.js: Client‑side Socket.IO logic.

Notes
- The server chooses PORT from the PORT env var or defaults to 3000.
- Static assets are served from the public directory.
