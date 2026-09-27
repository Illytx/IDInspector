# IDInspector

[![BetterDiscord Plugin](https://img.shields.io/badge/BetterDiscord-Plugin-5865F2?style=flat-square&logo=discord&logoColor=white)](https://betterdiscord.app/)
[![Version](https://img.shields.io/badge/version-1.1.8-blue?style=flat-square)](https://github.com/Illytx/IDInspector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

A lightweight BetterDiscord plugin that adds a direct context menu option to inspect user details, view account creation dates, and download high-resolution avatars and custom banners.

---

## Features

- **One-Click Inspection**: Right-click any user in a chat or member list and select **Inspect User ID**.
- **Accurate Timestamps**: Automatically calculates account creation date and exact UTC time from the user's snowflake ID.
- **Banner Extraction**: Detects and extracts custom profile banners (both server-specific and global Nitro banners) directly from the client cache.
- **Full-Resolution Asset Downloads**: Opens static assets (`.png`) and animated avatars/banners (`.gif`) at 4096px resolution in your default browser.
- **Non-Intrusive**: Displays an enabled notice only on first run—zero alert spam on Discord reloads.

---

## Installation

1. Make sure you have [BetterDiscord](https://betterdiscord.app/) installed.
2. Download [`IDInspector.plugin.js`](https://raw.githubusercontent.com/Illytx/IDInspector/main/IDInspector.plugin.js) (right-click the link and choose **"Save link as..."**).
3. Open your BetterDiscord plugins folder:
   - In Discord, go to **User Settings** $\rightarrow$ **Plugins** (under *BetterDiscord*).
   - Click **Open Plugins Folder** at the top.
4. Drag and drop `IDInspector.plugin.js` into that directory.
5. Enable **IDInspector** in your plugins list.

---

## Usage

1. Right-click on any user profile or chat message.
2. Select **Inspect User ID** from the context menu.
3. Use the modal to copy their ID, review their account creation date, or click **Get Avatar** / **Get Banner** to view the full-resolution asset.

---

## License

This project is licensed under the [MIT License](LICENSE).
