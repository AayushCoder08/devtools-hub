# DevTools Hub

A responsive hub website that puts multiple browser-based utilities in one place. Includes a built-in Resume Maker page.

## Included tools
- JSON Formatter / Minifier
- Word Counter
- Case Converter
- QR Code Generator (uses an external QR service; internet required)
- Image Compressor (browser-side image processing)
- Resume Maker (live preview and print-to-PDF)
- Base64 Encoder / Decoder
- Password Generator

## Run locally on Windows
1. Extract the ZIP.
2. Open the `DevTools-Hub` folder.
3. Double-click `index.html`.
4. Search for tools, filter by category, and open any tool.
5. Resume Maker is linked from the hub and lives in `resume/index.html`.

No build tools or package installs are needed for the basic version. Some features use internet access (Google Fonts and QR service). Passwords and image processing are handled locally in the browser. Avoid entering sensitive data into any online QR service.

## Add more tools
1. Open `index.html`.
2. Copy an existing `<article class="tool-card" ...>` inside `#toolGrid`.
3. Give the new card a unique `data-name`, `data-category`, description, and button `data-tool`.
4. For a new interactive tool, open `script.js`, add its title to the `titles` object and add a render function to the `render` object in `openModal()`.
5. Implement the new tool's JavaScript function below the existing functions.
6. Add the new category to `#categoryPills` if needed. Use `Developer`, `Images`, or `Everyday` for existing categories.
7. Update this README to document the new tool.

## Important
- This is a front-end starter project, not a production backend.
- The QR generator sends the text/URL to an external QR service to generate the image.
- Test the site in Chrome or Edge before publishing.
- Before monetization, add a privacy policy, terms page, contact page, accessible navigation, and review ad-network requirements.
