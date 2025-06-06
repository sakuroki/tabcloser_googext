# Tab Closer Chrome Extension

This extension automatically closes tabs that have been open for more than a few days. By default, tabs open for over **3 days** are closed.

## Installation

1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode**.
4. Click **Load unpacked** and select this folder.

The extension will run in the background and periodically close old tabs.

You can change the maximum open time by editing `MAX_DAYS_OPEN` in `background.js`.
