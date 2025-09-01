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


## Custom Scrollbar
This project includes a cross‑browser custom scrollbar.

Where to put the CSS:
- Edit src/tailwind.css in the section labeled "Cross-browser custom scrollbar (global + utility)". Then run:
  npm run build:css
  or keep it running with:
  npm run dev:css
  This regenerates public/styles.css that your HTML loads.
- If you are not using the Tailwind build, you may paste equivalent rules at the end of public/styles.css, but the source of truth is src/tailwind.css.

How it works:
- The page scrollbar (html and body) is styled globally.
- Add the class "scrollbar" to any scrollable container to opt into the same styling (ul#messages already has it).

Example:

<ul class="scrollbar" style="max-height: 300px; overflow-y: auto">
  ...
</ul>

How to customize (colors/sizes):
- In src/tailwind.css adjust these CSS variables under :root:
  --scrollbarBG (track), --scrollbarThumb (thumb), --scrollbarThumbHover (thumb hover)
- Change width/height in the ::-webkit-scrollbar rules to adjust thickness in Chromium/WebKit.
- Change the "scrollbar-width" value in the Firefox section (auto | thin | none).

Accessibility:
- In high-contrast mode (Windows), the rules fall back to system colors via @media (forced-colors: active).
