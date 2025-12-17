# HAMO_BOT - WhatsApp Bot

## Overview
This is an Arabic WhatsApp bot built with whatsapp-web.js. It provides automated responses, jokes, time/date info, and interactive conversations.

## Project Structure
- `index.js` - Main bot application with Express web server and WhatsApp client
- `package.json` - Node.js dependencies
- `.wwebjs_auth/` - WhatsApp session storage (gitignored)

## Technology Stack
- Node.js 20
- whatsapp-web.js - WhatsApp Web API client
- Express.js - Web server for status page
- Puppeteer/Chromium - Headless browser for WhatsApp Web
- qrcode-terminal - QR code display in console

## Running the Bot
1. Start the workflow to run the bot
2. Check console logs for QR code
3. Scan QR code with WhatsApp mobile app (Linked Devices)
4. Bot will be ready to respond to messages

## Environment Variables
- `PORT` - Web server port (5000)
- `BOT_NAME` - Bot display name
- `YEAR` - Current year for responses
- `DEVELOPER` - Developer name
- `WHATSAPP_SESSION_PATH` - Session storage path
- `CLIENT_ID` - WhatsApp client identifier

## Web Interface
The bot serves a web interface on port 5000 showing:
- Bot status
- Developer info
- Health check endpoint at /health
- API status at /api/status

## Recent Changes
- 2025-12-17: Configured for Replit environment
- Updated port to 5000
- Added Chromium path for Puppeteer
- Fixed JavaScript syntax error in HTML template
