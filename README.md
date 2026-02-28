```markdown
# Asset Management System

A simple tool to keep track of company items like laptops, monitors, keyboards, and other equipment. Know what you have and whether it's available or assigned to someone.

## What Does This System Do?

- **Add new items** to your inventory (laptop, monitor, etc.)
- **See all items** in one place
- **Update item details** or change status (Available/Assigned)
- **Remove items** when they're no longer needed
- **Filter items** to see only available or only assigned ones

All your data stays in a file on your computer. No database setup needed.

## Who Is This For?

- Small IT teams
- Office managers
- Anyone who needs to track equipment without complicated software

## How It Looks

The app works on computers, tablets, and phones. Buttons are big enough to tap on mobile. You'll see:

- A form to add new items at the top
- Filter buttons (All, Available, Assigned)
- Cards showing each item with its details
- Edit and Delete buttons on each card
- Pop-up messages when something succeeds or fails

## What You Need Before Starting

- Python 3.7 or higher (check with `python --version`)
- A computer (Windows, Mac, Linux) or an Android phone with Termux
- Internet connection only to download once

## How to Run on Linux (Ubuntu/Debian)

Open terminal and run these commands one by one:

```bash

sudo apt update

sudo apt install python3 python3-pip -y

git clone https://github.com/yourusername/asset-management.git

cd asset-management

pip3 install flask flask-cors

python3 app.py
```

Now open your browser and go to: `http://127.0.0.1:5000`

To stop the app: Press `Ctrl + C` in the terminal




## How to Run on Termux (Android Phone)

Termux turns your Android phone into a Linux machine. Here's how:

### Step 1: Install Termux
- Go to F-Droid (not Google Play)
- Download and install Termux from f-droid.org

### Step 2: Open Termux and run:

```bash

pkg update && pkg upgrade -y

pkg install python git -y

git clone https://github.com/yourusername/asset-management.git

cd asset-management

pip install flask flask-cors

python app.py
```

### Step 3: Access from phone browser
- Open Chrome or any browser on your phone
- Go to: `http://127.0.0.1:5000`

### To access from another device on same WiFi:

```bash

python app.py --host=0.0.0.0

```

Then find your phone's IP address:
```bash

ifconfig

```

On another device, go to: `http://[your-phone-ip]:5000`

## How to Run on Git (Clone and Run Locally)

If you just want to download and run:

```bash

git clone https://github.com/yourusername/asset-management.git

cd asset-management

pip install flask flask-cors

python app.py

```

## Project Files Explained

```
asset-management-sytem/
│
├── app.py              # The main program (backend)
├── assets.json         # Where your items are saved
├── requirements.txt    # List of things to install
├── README.md          # This file
│
├── static/            # Files that don't change
│   ├── css/
│   │   └── style.css  # How things look
│   └── js/
│       └── script.js   # What buttons do
│
└── templates/
    └── index.html      # The page you see
```

## How to Use the App

### Adding an Item
1. Type the item name (like "Dell Laptop" or "LG Monitor")
2. Choose status (Available or Assigned)
3. Click "Add Asset" button
4. A green message pops up saying it worked

### Editing an Item
1. Find the item you want to change
2. Click "Edit" on its card
3. Change name or status
4. Click "Update"
5. Green message confirms it worked

### Deleting an Item
1. Find the item
2. Click "Delete"
3. Confirm you want to remove it
4. It disappears from the list

### Filtering Items
Click the buttons above the list:
- **All** - shows everything
- **Available** - shows only free items
- **Assigned** - shows only items in use

## Sample Items Already Loaded

The System comes with 20 sample items to start:
- Dell XPS Laptop
- MacBook Pro
- LG Monitor
- Logitech Mouse
- And more...

You can delete these and add your own.

## Common Problems and Fixes

**"python not found"**

```bash

python3 app.py
```

**"flask not found"**

```bash
pip install flask flask-cors
# or
pip3 install flask flask-cors
```

**Address already in use**

Port 5000 is busy. Either close the other program or run on different port:
```bash
# In app.py, change the last line to:
app.run(port=5001)
```

**Blank page in browser**

- Check if terminal shows "Running on http://127.0.0.1:5000"
- Make sure you used the right address
- Try `http://127.0.0.1:5000` instead of localhost

## Need Help?

If something doesn't work:
1. Check you're in the right folder (`pwd` command)
2. Make sure Flask installed without errors
3. Look at the error message in terminal
4. Try the common fixes above
