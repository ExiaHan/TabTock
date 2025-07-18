# TabTock - Chrome Extension

TabTock is a Chrome extension that allows users to set a timer for their current tab. Once the timer ends, the extension will automatically close the tab. Users can view each timer at any time. This extension features a user-friendly popup UI designed with material design principles.

## Features

- Set a timer using four input fields: days, hours, minutes, and seconds.
- Material design styled popup for a modern look and feel.
- Automatically closes the current tab when the timer expires.
- View each timer 

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/exiahan/TabTock.git
   ```
2. Navigate to the project directory:
   ```
   cd TabTock
   ```
3. Install the necessary dependencies:
   ```
   pnpm install
   ```

## Usage

1. Load the extension in Chrome:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click on "Load unpacked" and select the `TabTock` directory.
   
2. Click on the TabTock icon in the Chrome toolbar to open the popup.
3. Set your desired timer duration using the input fields.
4. Click the "Start Timer" button to begin the countdown.
5. The current tab will close automatically when the timer ends.

## Development

- The extension is built using TypeScript and follows the Material Design guidelines.
- The source code is organized into the following directories:
  - `src/popup`: Contains the HTML, TypeScript, and CSS for the popup UI.
  - `src/material`: Contains the material design styles.
  - `src/utils`: Contains utility functions for timer management.

## License

This project is licensed under the GPLv3 License. See the LICENSE file for more details.