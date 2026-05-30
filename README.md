# 📊 BodyLog

A self-hosted personal health habit tracker. Log bathroom visits and dental care, see streaks, daily averages, and charts — all stored privately on your own computer. Nothing is ever sent to the internet.

---

## ✨ Features

- **💛 Pee tracking** — log visits and see daily patterns
- **🟤 Poo tracking** — monitor bowel movement regularity
- **🦷 Tooth brushing** — never forget if you brushed today
- **💧 Oral irrigator / flossing** — track water flosser habits
- **📈 Statistics dashboard** — timelines, averages, streaks, and gaps
- **🔥 Streak tracking** — consecutive days of healthy habits
- **📱 Quick Log screen** — big simple buttons, great as a phone shortcut
- **🌙 Dark / light mode**
- **⚙️ Customisable** — choose which habits to track and set your name
- **🔒 100% private** — runs entirely on your machine, zero cloud, zero accounts

---

## 📋 System Requirements

| Requirement | Details |
|---|---|
| Operating system | Windows 10/11 or macOS 10.15+ |
| Python | Version 3.8 or newer (free to download) |
| Disk space | ~50 MB |

---

## 🚀 Installation — Step by Step

### Step 1 — Install Python

**On Windows:**
1. Open your browser and go to **https://www.python.org/downloads/**
2. Click the big yellow **"Download Python"** button
3. Run the downloaded installer
4. ⚠️ **Important:** On the very first screen, check the box that says **"Add Python to PATH"** before clicking anything else. This is easy to miss and the app will not work without it.
5. Click **Install Now** and wait for it to finish
6. Click **Close** when done

**On Mac:**
1. Open your browser and go to **https://www.python.org/downloads/**
2. Click the big yellow **"Download Python"** button
3. Open the downloaded `.pkg` file and follow the installer steps
4. Click through all the default options

**Verify Python installed correctly:**

Open a terminal (instructions below) and type:
```
python --version
```
You should see something like `Python 3.11.4`. If you see an error, try `python3 --version` instead — and use `python3` everywhere in this guide instead of `python`.

---

### Step 2 — Download BodyLog

1. Go to the BodyLog GitHub page in your browser
2. Click the green **"Code"** button near the top right
3. Click **"Download ZIP"**
4. Open your Downloads folder and double-click the ZIP file to unzip it
5. Move the unzipped folder (called something like `BodyLog-main`) to somewhere easy to find, like your **Desktop**

---

### Step 3 — Open a terminal inside the BodyLog folder

**On Windows:**
1. Open the `BodyLog-main` folder in File Explorer
2. Click once on the address bar at the top of the window (where the folder path is shown) to highlight it
3. Type `cmd` and press **Enter**
4. A black Command Prompt window will open, already pointed at the right folder ✅

**On Mac:**
1. Open the **Terminal** app — press **Command + Space**, type `Terminal`, press Enter
2. Type `cd ` (the letters c, d, and a space — do not press Enter yet)
3. Open Finder, find your `BodyLog-main` folder, and drag it into the Terminal window
4. Press **Enter** — you are now inside the folder ✅

---

### Step 4 — Create a virtual environment

A virtual environment is a clean, isolated space for BodyLog's code to live. It prevents any conflicts with other Python software on your computer and avoids permission errors on Windows.

Type each of the following commands, pressing **Enter** after each one:

**Windows:**
```
python -m venv venv
```
```
venv\Scripts\activate
```

**Mac:**
```
python3 -m venv venv
```
```
source venv/bin/activate
```

You will know it worked when your prompt changes to show `(venv)` at the very start of the line, like this:
```
(venv) C:\Users\YourName\Desktop\BodyLog-main>
```

> **Every time you want to run BodyLog in the future**, open a terminal in the folder and run the activate command above first. The app will not start without it.

---

### Step 5 — Install dependencies

With the virtual environment active (you should see `(venv)` in your prompt), run:

```
pip install flask flask-cors requests
```

You will see a list of packages downloading and installing. When you get your prompt back, it worked.

---

### Step 6 — Set up the database

```
python init_db.py
```

You should see: `✅ Database initialised successfully!`

---

### Step 7 — Start the app

```
python app.py
```

You should see:
```
 * Running on http://0.0.0.0:5000
```

Open your browser and go to **http://localhost:5000** — you should see the BodyLog welcome screen! 🎉

---

## 🎯 First-Time Setup (in the app)

When you open the app for the first time you will see a setup screen. It takes about 30 seconds.

1. **Enter your name** in the text box (e.g. `Sarah` or `John`). The app uses this to greet you.
2. **Choose what to track** by clicking each option. A blue tick (✓) means it is selected. Click again to deselect. You can track any combination of:
   - 💛 Pee visits
   - 🟤 Poo / bowel movements
   - 🦷 Tooth brushing
   - 💧 Oral irrigator or flossing
3. Click **"Let's go! 🚀"** to finish.

You can change any of these choices at any time using the ⚙️ settings button in the top right corner of the main screen.

---

## 📱 Daily Use

### Logging a bathroom visit

1. Tap the **Log** tab at the top
2. Tap **💛 Pee** or **🟤 Poo** — the button highlights to show it is selected
3. The date and time are automatically filled with right now — change them if you forgot to log earlier
4. Optionally tap **🏠 Home**, **🏢 Work**, or **📍 Other** to record where you were
5. Tap **"Log Event"** — it flashes green to confirm it saved ✅

### Logging a tooth brushing

1. Tap the **Dental** tab at the top
2. The current date and time are pre-filled
3. If you also used an oral irrigator or floss, tap **"Yes 💧"**
4. Tap **"Log Brushing"** ✅

### Quick Log screen (great for your phone)

There is a simplified screen with large buttons designed for quick one-tap logging. Go to **http://localhost:5000/home-tracker** and save it as a bookmark or home screen shortcut.

> **To use on your phone** — your phone and computer must be on the same Wi-Fi network. Find your computer's local IP address, then open `http://192.168.1.XX:5000/home-tracker` on your phone.
>
> - **Windows:** Open Command Prompt and type `ipconfig`. Look for "IPv4 Address" — it looks like `192.168.1.XX`
> - **Mac:** Go to System Settings → Network → Wi-Fi → Details → IP Address

---

## 📊 Understanding Your Stats

Tap the **Stats** tab to see your statistics.

### Last logged chips
Coloured pills at the top showing how long ago you last logged each event — for example "💛 2.5h ago".

### 🔥 Streaks & Gaps

| Term | What it means |
|---|---|
| **Current streak** | How many days in a row you have logged at least one event of this type |
| **Days since last** | How many days have passed since your last log of this type |
| **Best streak ever** | The longest consecutive-day streak you have ever achieved |
| **Longest gap ever** | The longest you have ever gone without logging this event |

### 📈 Daily Averages

| Column | Time period |
|---|---|
| **All Time** | Every day since you started |
| **Last 3 Mo** | The last 91 days |
| **Last 7 Days** | The last 7 days |

The **Last 7 Days** column is colour-coded — 🟠 orange means higher than your average, 🟢 green means lower.

### Charts

- **Timeline** — events logged per day over the last 90 days
- **Location Breakdown** — where your bathroom visits happened (Home / Work / Other)
- **Dental Consistency** — brushings per day with a 7-day rolling average

---

## ✏️ Editing or Deleting a Log

1. Go to the **Stats** tab
2. Scroll to "Recent Bathroom Logs" or "Recent Dental Logs"
3. Click **Edit** to correct a mistake, or **Delete** to remove it
4. Click **"See all →"** to browse your complete history

---

## 💾 Backing Up Your Data

All your data is stored in a folder called `data` inside your `BodyLog-main` folder. Back this up regularly.

1. Find your `BodyLog-main` folder
2. Inside it, find the `data` folder
3. Copy the entire `data` folder to a USB drive, external hard drive, or cloud storage (Google Drive, iCloud, Dropbox)

Repeat this weekly or monthly depending on how important your history is to you.

---

## 🔄 Starting and Stopping BodyLog

**To start BodyLog:**
1. Open a terminal in the `BodyLog-main` folder
2. Activate the virtual environment:
   - Windows: `venv\Scripts\activate`
   - Mac: `source venv/bin/activate`
3. Start the app: `python app.py`
4. Leave the terminal window open while you use the app

**To stop BodyLog:**
Press **Ctrl + C** in the terminal window, or simply close it.

> BodyLog does not start automatically when you restart your computer — you need to follow the steps above each time.

---

## 🆘 Troubleshooting

### pip install fails with "WinError 2" or "Failed to write executable"

This is a Windows permissions issue. The fix is to use a virtual environment, which avoids it entirely. Follow Step 4 of the installation guide above to create one, then run the `pip install` command again from inside the activated environment (you should see `(venv)` in your prompt).

If you already tried without a venv, just start fresh:
```
python -m venv venv
venv\Scripts\activate
pip install flask flask-cors requests
```

### "pip is not recognised" or "python is not recognised"

Python was installed without the "Add to PATH" option ticked. The easiest fix:

1. Go to **https://www.python.org/downloads/** and download Python again
2. Run the installer — click **"Modify"** if offered, otherwise uninstall first
3. On the first screen, make sure **"Add Python to PATH"** is ticked ✅
4. Complete the install, then open a **new** Command Prompt window and try again

### "I can't open http://localhost:5000"

- Make sure the terminal running `python app.py` is still open and has not been closed
- Check the terminal for any error messages in red
- Try http://127.0.0.1:5000 instead — it is the same address

### The app starts but shows an error about the database

Run `python init_db.py` first, then try `python app.py` again.

### "Address already in use" error when starting

Another program is using port 5000. Open `app.py` in a text editor, find the very last line:
```python
app.run(host='0.0.0.0', port=5000, debug=False)
```
Change `5000` to `5001`, save the file, and open **http://localhost:5001** instead.

### My data disappeared after moving the folder

Your data lives in the `data` sub-folder. Make sure you moved the entire `BodyLog-main` folder, not just some of the files inside it. The `data` folder must be in the same place as `app.py`.

---

## ❓ FAQ

**Q: Is my data sent anywhere?**
A: No. Everything stays on your computer. There are no accounts, no analytics, and no internet connection required after installation.

**Q: Can I use it on my phone?**
A: Yes — see the Quick Log section. Your phone and computer need to be on the same Wi-Fi network.

**Q: Can multiple people use it?**
A: The current version is designed for one person. Each person would need their own copy in a separate folder.

**Q: What happens to my data if I delete the app?**
A: Your data is in the `data` folder. As long as you keep that folder, your history is safe. You can copy it back into a fresh installation at any time.

**Q: Do I need an internet connection to use BodyLog?**
A: Only for the initial `pip install` step. After that, everything works completely offline.

---

## 📄 Licence

MIT — free to use, modify, and share.
