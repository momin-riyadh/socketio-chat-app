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
- The Socket.IO client script tag in public/index.html is required for this setup because public/script.js calls io() from the global provided by /socket.io/socket.io.js served by the Node server. If you prefer alternatives:
  - CDN: <script src="https://cdn.socket.io/4.7.5/socket.io.min.js" integrity="sha384-Xi3x..." crossorigin="anonymous"></script>
  - ESM/bundler: import { io } from "socket.io-client" in your build and remove the script tag.
- If your HTML is served from a different origin/port than the Node server, point the script src to that server, e.g. http://localhost:3000/socket.io/socket.io.js, or pass a URL to io("http://localhost:3000"). See different-origin-chat.md.
