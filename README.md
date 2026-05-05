 AI Page Summarizer — Chrome Extension
A Chrome Extension (Manifest V3) that extracts content from any webpage and generates a structured AI summary in one click.

🎥 Demo Video
Click here to watch the demo

🔗 GitHub Repository
Click here to view the code

📸 What It Does
When you click the extension icon on any webpage it will extract the main article content from the page, send it to an AI through a secure Vercel proxy server using Groq Llama 3.3 model, and display a 5 bullet point summary, 3 key insights, and estimated reading time. It also caches the result so it never calls the AI twice for the same page.

🗂️ Project Structure
manifest.json is the Extension ID card using Manifest V3. background.js calls the secure Vercel proxy server. content.js extracts readable text from webpages. The popup folder contains popup.html which is the structure of the popup window, popup.js which is the brain of the popup that connects everything, and popup.css which is the styling of the popup. The icons folder contains icon16.png, icon48.png, and icon128.png.

🚀 How To Install And Use
Step 1 — Download the project
Click the green Code button on this GitHub page, click Download ZIP, and extract the ZIP file on your computer.
Step 2 — Set up your proxy server
This extension uses a secure Vercel proxy server to protect the API key. To set up your own server go to https://console.groq.com and sign up for a free account. Click API Keys then Create API Key and copy your key which starts with gsk_. Then deploy the summarizer-proxy folder to Vercel and add your Groq key as an environment variable named GROQ_API_KEY. Copy your Vercel deployment URL.
Step 3 — Update the extension
Open background.js in any text editor. Find the line that says PROXY_URL and replace the URL with your own Vercel deployment URL. Save the file.
Step 4 — Load into Chrome
Open Chrome and go to chrome://extensions. Turn on Developer Mode using the top right toggle. Click Load unpacked and select the ai-page-summarizer folder. The extension will appear in Chrome.
Step 5 — Use it
Go to any news article or blog post. Click the ⚡ icon in your toolbar. Click Summarize Page and wait a few seconds for the AI summary.

🏗️ Architecture Explanation
When the user clicks Summarize Page, popup.js asks content.js to extract the page text. content.js removes clutter like menus, ads, and footers and returns clean article text. popup.js then sends the text to background.js. background.js checks chrome.storage cache first. If the result is cached it returns the saved result instantly. If not cached it calls the Vercel proxy server. The proxy server holds the Groq API key safely as an environment variable and calls the Groq AI API. Groq returns a structured JSON summary which the proxy sends back to the extension. background.js saves the result to cache and popup.js displays it to the user.

🤖 AI Integration Explanation
This extension uses the Groq API with the llama-3.3-70b-versatile model through a secure Vercel proxy server. Groq was chosen because it is free, fast, and works globally. The prompt instructs the AI to return strict JSON format containing summary bullets, key insights, and reading time. The response is cleaned and parsed before display. If parsing fails a friendly error message is shown.

🔐 Security Decisions
The API key is stored only as a Vercel environment variable and is never present in the extension code at all. The extension calls a proxy server instead of the AI API directly which means the key cannot be extracted from the extension files. Content is set via textContent and never innerHTML which prevents XSS injection attacks. Only minimal permissions are requested which are activeTab, scripting, and storage. Message passing is validated by the action field to prevent unexpected commands. Page content is limited to 8000 characters to prevent prompt injection attacks.

⚖️ Trade-offs
The proxy server approach adds one extra network hop but completely eliminates the risk of API key exposure. We try article and main content first and fall back to the full body if nothing is found. Summaries are cached forever until storage is cleared with no expiry time. Groq was chosen over paid OpenAI for accessibility and zero cost.

🛠️ Built With
Manifest V3 Chrome Extension APIs, Groq API with llama-3.3-70b-versatile, Vercel Serverless Functions for the proxy server, and Vanilla JavaScript with no frameworks.

👨‍💻 Author
Built as part of Frontend Wizards Stage 4A Challenge
