# Re:Rule34 - BETA
Re:Rule34 - a custom, unofficial, fully open-source Rule34 client that runs on their API.
(By the way, this repository contains a server as well as a client.)

The current version on GitHub is still in the testing phase and does not include the project's full functionality. In any case, you can already install and run it.

## Requirements

- **Node.js** v.20+ — [Download](https://nodejs.org/)
  (check version: `node -v`)
- **npm** v.10+ (goes along with Node.js)
  (check: `npm -v`)
- **Git** — [Download](https://git-scm.com/downloads)

## Setup
So, once you've downloaded all the tools, run these commands:


1. Clone this repo:
```bash
git clone https://THISREPO.git
cd rerule34
```

2. Download all dependencies:
```bash
npm install
```

3. Setup `.env` in server
```bash
cd server
copy .env.example .env
```

4. Open the `.env` file and configure it. 
It is important to set your `R34_API_KEY` and `R34_USER_ID`.

5. Then if you still in `server` folder, run: `npm run dev`

6. Open new terminal:
```bash
cd client
npm run dev 
```

That’s all! Now you can open your client localhost link and use client.