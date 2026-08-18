# Apex Designs Bot

All-in-one Discord bot for **Apex Designs** — a full design-shop order system (orders, Roblox payments, portfolio, vouches, staff tools) plus a complete community toolkit (moderation, economy, leveling, tickets, giveaways, and more). **97 commands, no database server required** — everything runs on plain JSON files.

---

## Setup

### 1. Create the bot application
1. https://discord.com/developers/applications → **New Application**.
2. **Bot** → Reset Token → copy it (this is your `DISCORD_TOKEN`). Never share it.
3. On the Bot page, enable these **Privileged Gateway Intents**: Server Members Intent, Message Content Intent.
4. **OAuth2 → URL Generator** → check `bot` + `applications.commands`. Under Bot Permissions check: Manage Channels, Manage Roles, Manage Messages, Manage Nicknames, Kick Members, Ban Members, Moderate Members, View Channels, Send Messages, Embed Links, Attach Files, Read Message History. Copy the generated URL and invite the bot to your server.
5. **General Information** → copy the **Application ID** (this is your `CLIENT_ID`).

### 2. Install Node.js 18+ if you don't have it: https://nodejs.org

### 3. Configure
Copy `.env.example` to `.env` and fill in:
```
DISCORD_TOKEN=your bot token
CLIENT_ID=your application ID
GUILD_ID=your server ID   (recommended while testing — instant command sync)
```
Server ID: enable Developer Mode (User Settings → Advanced), then right-click your server icon → Copy Server ID.

### 4. Install & run
```bash
npm install
npm run deploy
npm start
```
Leave `npm start` running (or host it on a VPS/Wispbyte/Railway) for the bot to stay online.

### 5. First-time server setup
```
/setup
```
Fill in your ticket category, staff role, and optional channels (logs, vouches, applications, mod log). Then:
```
/addstaff @designer
/setprice service:"Logo Design" price:30
/panel type:dashboard
```

**Upload everything** — `commands/`, `events/`, `utils/`, `banners/`, `assets/`, `data/`, `index.js`, `package.json`, `deploy-commands.js`, and your `.env`. All folders are required; the bot will tell you exactly which one is missing if you forget one.

---

## Panels & shortcuts

Besides `/panel type:<dashboard|order|tickets|pricelist|vouches|portfolio|staff>`, staff can also type a plain message (no slash) in any channel:
- `-orderpanel` or `-order panel` → sends the Order Panel
- `-ticketpanel` or `-ticket panel` → sends the general Support Ticket Panel
- `-dashboard`, `-pricelist`, `-vouches`, `-portfolio`, `-staffpanel`

Prefix is configurable via `/setup` (default `-`).

---

## Command categories (97 total)

| Category | Examples |
|---|---|
| 🎫 Tickets | `/order`, `/support`, `/claim`, `/close`, `/queue`, `/invoice`, `/transcript` |
| 💰 Pricing | `/pricelist`, `/quote`, `/setprice` |
| 🖼️ Portfolio | `/portfolio`, `/vouch`, `/vouches`, `/addportfolio` |
| 🎮 Roblox | `/tax`, `/verify`, `/whois` |
| 💸 Payments | `/payment-request`, `/orderlog`, `/credits` |
| 🛠️ Staff | `/dashboard`, `/staffstats`, `/leaderboard`, `/addstaff` |
| 🛡️ Moderation | `/warn`, `/kick`, `/ban`, `/timeout`, `/purge`, `/lock`, `/slowmode` |
| 🪙 Economy | `/balance`, `/daily`, `/work`, `/pay`, `/bank`, `/rob`, `/coinflip` |
| 📈 Leveling | `/rank`, `/levels`, `/setlevelrole` |
| 🎂 Birthday | `/setbirthday`, `/setbirthdaychannel` |
| 🎉 Giveaways | `/giveaway start/end/reroll` |
| 🔊 Voice | `/jointocreate` |
| 🎭 Reaction Roles | `/reactionrole add/remove` |
| 📊 Server Stats | `/serverstats` |
| 😄 Fun | `/8ball`, `/flip`, `/roll`, `/rps`, `/joke` |
| 💡 Community | `/suggest`, `/setsuggestions` |
| 🤖 Bot Info | `/botinfo`, `/invite` |
| 🧰 Tools | `/calculate`, `/hexcolor`, `/timestamp`, `/generatepassword`, `/poll` |
| ✅ Verification | `/setverification` |
| 👋 Welcome | `/setwelcome`, `/setleave` |
| 🔎 Search | `/define`, `/wiki` |
| ⚙️ Utility | `/setup`, `/panel`, `/help`, `/faq`, `/about`, `/ping` |
| 🎵 Music | see note below |

Run `/help` in Discord for the live, full list.

---

## About the Music commands

`/play`, `/skip`, `/queue`, etc. exist but are honest about a real limitation: actual audio playback needs a **separately-hosted Lavalink server** (a Java audio node) plus a client library wired to it — infrastructure this simple Node bot doesn't include. Rather than fake a "now playing" reply with no sound, these commands clearly explain what's missing until you configure `LAVALINK_HOST` / `LAVALINK_PORT` / `LAVALINK_PASSWORD` in `.env` and wire up a node manager in `utils/music.js`.

## About the /credits vs economy /balance

These are intentionally separate systems:
- **`/credits`** — real Robux store credit (refunds, bonuses) tied to actual payments. Staff-managed.
- **`/balance` / `/daily` / `/work` / `/rob`** — a just-for-fun "Coins" economy game, unrelated to real money.

---

## Notes

- All data lives in `data/*.json` — no MongoDB, no Postgres, no external database. Back that folder up to preserve history.
- `make_banners.py` (Python + Pillow) generated the branded banner images from `assets/apex_designs_logo.png` — re-run it if you want to tweak banner text/style.
- "Staff" = anyone with the role set in `/setup`, or Administrators. "Managers" = anyone with Manage Server, or Administrators.

## Troubleshooting
- **Slash commands don't show up** → run `npm run deploy`; double-check `GUILD_ID` if using one.
- **"Missing Access" creating tickets** → bot needs Manage Channels and visibility into the configured category.
- **Bot goes offline** → running locally stops when you close the terminal; use a host (VPS/Wispbyte/Railway) to keep it running 24/7.
