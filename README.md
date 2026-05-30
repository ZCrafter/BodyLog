# 📊 Life Tracker

A self-hosted personal health habit tracker. Log bathroom visits and dental care, see streaks, daily averages, and charts — all stored privately on your own computer. Nothing is ever sent to the internet.

---

## ✨ Features

- **💛 Pee tracking** — log visits and see daily patterns
- **🟤 Poo tracking** — monitor bowel movement regularity
- **🦷 Tooth brushing** — never forget if you brushed today
- **💧 Oral irrigator / flossing** — track water flosser habits
- **📈 Statistics dashboard** — timelines, averages, streaks, gaps
- **🔥 Streak tracking** — consecutive days of healthy habits
- **📱 Quick Log screen** — big simple buttons, perfect as a phone shortcut
- **🌙 Dark / light mode**
- **⚙️ Customisable** — choose which habits to track; set your name
- **🔒 100% private** — runs entirely on your machine, zero cloud, zero accounts

---

## 📋 System Requirements

| Requirement | Details |
|---|---|
| Operating system | Windows 10/11, macOS 10.15+, or Linux |
| Docker Desktop | Free — download instructions below |
| RAM | 512 MB free |
| Disk | ~200 MB for the app + your data |

---

## 🚀 Installation — Step by Step

### Step 1 — Install Docker Desktop

Docker is the tool that runs the app. Think of it like a self-contained box that holds everything the app needs. It is free and safe.

**On Windows:**
1. Open your web browser and go to **https://www.docker.com/products/docker-desktop/**
2. Click the big blue **"Download Docker Desktop for Windows"** button.
3. Once the file has downloaded (it will be in your Downloads folder), double-click it to run it.
4. Follow the on-screen installer. When asked, leave all options at their defaults and click **Next** then **Install**.
5. When the installer finishes, click **Close** and then **restart your computer**.
6. After restarting, Docker Desktop will start automatically. You will see a small whale icon (🐳) in your system tray (bottom-right of the screen near the clock). Wait until it stops animating — that means Docker is ready.

**On Mac:**
1. Open your web browser and go to **https://www.docker.com/products/docker-desktop/**
2. Click **"Download Docker Desktop for Mac"**. If you have an M1/M2/M3 Mac (newer Macs made after 2020), choose **"Mac with Apple chip"**. Otherwise choose **"Mac with Intel chip"**.
3. Once downloaded, open the `.dmg` file from your Downloads folder and drag the Docker icon into your Applications folder.
4. Open Docker from your Applications folder. You may be asked for your Mac password — that is normal.
5. Wait for the whale icon (🐳) in your menu bar (top-right of screen) to stop animating. Docker is ready when it is still.

---

### Step 2 — Download Life Tracker

1. Go to the Life Tracker GitHub page in your browser.
2. Click the green **"Code"** button near the top-right of the page.
3. Click **"Download ZIP"** from the dropdown menu.
4. A `.zip` file will download to your Downloads folder.
5. Find the `.zip` file and double-click it to unzip it. This will create a folder called something like `life-tracker-public-main`.
6. Move that folder somewhere easy to find — for example, your **Desktop** or your **Documents** folder.

---

### Step 3 — Start the App

**On Windows:**
1. Open the folder you just unzipped (e.g. `life-tracker-public-main`).
2. In the address bar at the top of the File Explorer window (where it shows the folder path), click once to select the text, then type `cmd` and press **Enter**. A black Command Prompt window will open.
3. In that window, type exactly the following and press **Enter**:
   ```
   docker compose up -d
   ```
4. You will see text scrolling — Docker is downloading and building the app. This only happens the first time and may take 2–5 minutes depending on your internet speed.
5. When you see the word `Started` or get your prompt back, the app is running!

**On Mac:**
1. Open the **Terminal** app. You can find it by pressing **Command + Space** and typing `Terminal`, then pressing Enter.
2. Type the following and press **Enter** (replace the path with where you actually unzipped the folder):
   ```
   cd ~/Desktop/life-tracker-public-main
   ```
   > **Tip:** You can also drag the folder from Finder into the Terminal window instead of typing the path.
3. Then type and press **Enter**:
   ```
   docker compose up -d
   ```
4. Wait for it to finish (1–5 minutes the first time). When you see `Started` or the prompt returns, you are done.

---

### Step 4 — Open the App

Open your web browser (Chrome, Firefox, Safari, Edge — any will work) and go to:

**http://localhost:5000**

You should see the Life Tracker welcome screen! 🎉

---

## 🎯 First-Time Setup (in the app)

When you open the app for the first time, you will see a setup screen. It takes about 30 seconds.

1. **Enter your name** in the text box (e.g. `Sarah` or `John`). The app uses this to greet you.
2. **Choose what to track** by clicking each option. A blue tick (✓) means it is selected. You can track any combination of:
   - 💛 Pee visits
   - 🟤 Poo / bowel movements
   - 🦷 Tooth brushing
   - 💧 Oral irrigator or flossing
3. Click **"Let's go! 🚀"** to finish.

That is it! You can change these choices at any time using the ⚙️ settings button.

---

## 📱 Daily Use

### Logging a bathroom visit

1. Tap the **Log** tab at the top.
2. Tap **💛 Pee** or **🟤 Poo** — the button will highlight to show it is selected.
3. The date and time are automatically filled in with *right now*. You can change them if needed (for example, if you forgot to log earlier).
4. Optionally, tap **🏠 Home**, **🏢 Work**, or **📍 Other** to record where you were.
5. Tap the blue **"Log Event"** button. It will flash green to confirm it was saved! ✅

### Logging a tooth brushing

1. Tap the **Dental** tab at the top.
2. The current date and time are pre-filled.
3. If you also used an oral irrigator or floss, tap **"Yes 💧"**.
4. Tap **"Log Brushing"**. Done! ✅

### Quick Log (great for your phone)

There is a simplified "big button" screen designed for quick one-tap logging. Open **http://localhost:5003** in your phone's browser and save it as a home screen shortcut for the fastest possible logging.

> **How to add to phone home screen (iPhone):** Open Safari, go to `http://YOUR-COMPUTER-IP:5003`, tap the Share button, then tap "Add to Home Screen".

> **Finding your computer's IP address:**
> - Windows: Open Command Prompt and type `ipconfig`. Look for "IPv4 Address" — it will look like `192.168.1.xx`.
> - Mac: Go to System Settings → Network → Wi-Fi → Details. Look for "IP address".

---

## 📊 Understanding Your Stats

Tap the **Stats** tab to see your statistics. Here is what everything means:

### Last logged chips
At the top you will see coloured pills showing how long ago you last logged each event, for example "💛 2.5h ago". This tells you the time since your last log.

### 🔥 Streaks & Gaps

| Term | What it means |
|---|---|
| **Current streak** | How many days in a row you have had at least one event of this type (ending today) |
| **Days since last** | How many days have passed since you last logged this event |
| **Best streak ever** | The longest consecutive-day streak you have ever achieved |
| **Longest gap ever** | The longest you have ever gone without logging this event |

**Example:** If "🦷 Tooth Brushing — Current streak: 5 days" shows, it means you have brushed your teeth every day for the last 5 days. Great work!

### 📈 Daily Averages

Shows your average number of events per day over three time periods:

| Column | Time period |
|---|---|
| **All Time** | Every day since you started using the app |
| **Last 3 Mo** | The last 91 days |
| **Last 7 Days** | The last 7 days |

The **Last 7 Days** column is colour-coded:
- 🟠 Orange = higher than your all-time average
- 🟢 Green = lower than your all-time average

### Timeline chart
Shows how many events you logged each day over the last 90 days. Hover over (or tap) any point to see the exact number.

### Location Breakdown
Shows where your bathroom visits happened (Home / Work / Other) as a bar chart.

### Dental Consistency
A bar chart of your brushings per day, with a dotted red line showing your 7-day rolling average.

---

## ✏️ Editing or Deleting a Log

If you made a mistake:

1. Go to the **Stats** tab.
2. Scroll down to "Recent Bathroom Logs" or "Recent Dental Logs".
3. Find the event you want to fix.
4. Click **Edit** to change the date/time or event type, or **Delete** to remove it.
5. You can also see every single event ever logged by clicking **"See all →"**.

---

## ⚙️ Changing Your Settings

Click the ⚙️ gear icon at the top of the main screen to:
- Change your name
- Turn individual tracking types on or off

---

## 💾 Backing Up Your Data

All your data is stored in a folder called `data` inside the life-tracker folder you unzipped. **Back this folder up regularly** to avoid losing your history.

**Simple backup steps:**
1. Find your `life-tracker-public-main` folder.
2. Inside it, find the `data` folder.
3. Copy the entire `data` folder to a USB drive, external hard drive, or cloud storage service (Google Drive, iCloud, Dropbox).

Repeat this weekly or monthly depending on how important your data is to you.

---

## 🔄 Stopping and Restarting the App

**To stop the app** (e.g. before shutting down):
```
docker compose down
```

**To start it again later:**
```
docker compose up -d
```

**The app does NOT start automatically when you restart your computer** unless you configure Docker to do so. You will need to run `docker compose up -d` each time after restarting, or enable Docker to start on boot in Docker Desktop settings.

---

## 🔧 Updating the App

When a new version is released:
1. Download the new ZIP from GitHub (same as Step 2 of installation).
2. Copy your `data` folder from the old app folder to the new one (this preserves all your history).
3. Open a terminal/command prompt in the new folder and run:
   ```
   docker compose up -d --build
   ```

---

## 🆘 Troubleshooting

### "I can't open http://localhost:5000 — it says the page can't be found"
- Make sure Docker Desktop is running (look for the 🐳 icon in your taskbar/menu bar).
- Open a terminal in the life-tracker folder and run `docker compose up -d`.
- Wait 30 seconds and try again.

### "Docker is not recognised as a command"
- Docker Desktop may not have finished installing, or your computer may need a restart.
- Try restarting your computer and opening Docker Desktop manually before trying again.

### "The app starts but my data is gone"
- Your data lives in the `data` folder inside the life-tracker folder.
- Make sure you are running `docker compose up -d` from the correct folder (the one that contains `docker-compose.yml`).

### "I want to run it on my phone too"
- The app must be running on your computer.
- Both your phone and computer must be on the same Wi-Fi network.
- Find your computer's local IP address (see the Quick Log section above).
- Open `http://192.168.1.XX:5000` on your phone (replace with your actual IP).

### "Port 5000 is already in use"
- Another program is using port 5000. Edit `docker-compose.yml` and change `"5000:5000"` to `"5001:5000"`, then open `http://localhost:5001` instead.

---

## ❓ FAQ

**Q: Is my data sent anywhere?**
A: No. Everything stays on your computer. The app has no internet connection, no accounts, no analytics.

**Q: Can multiple people in my household use it?**
A: The current version is designed for one person. Each person would need their own installation (in a separate folder with a different port number).

**Q: Can I use it on my phone?**
A: Yes! See the Quick Log section above. Your phone and computer need to be on the same Wi-Fi network.

**Q: What happens to my data if I uninstall Docker?**
A: Your data lives in the `data` folder, which is separate from Docker. As long as you keep that folder, your data is safe.

**Q: Can I import data I already have?**
A: Yes — the app has an import API at `/api/import/bathroom` and `/api/import/dental` that accepts JSON. See `import_google_forms.py` for a reference import script.

---

## 📄 Licence

MIT — free to use, modify, and share.
