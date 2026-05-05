// content.js
// This file runs inside whatever webpage the user is on
// Its job is to extract the readable text from the page

function extractPageContent() {

  // Get the page title and URL
  const url = window.location.href;
  const title = document.title;

  // These are the best places to find the main article content
  // We try each one in order until we find something
  const selectors = [
    'article',
    'main',
    '[role="main"]',
    '.post-content',
    '.article-body',
    '.entry-content'
  ];

  let contentEl = null;

  // Loop through each selector and stop when we find content
  for (const selector of selectors) {
    contentEl = document.querySelector(selector);
    if (contentEl) break; // found something, stop looking
  }

  // If we found nothing above, just use the whole body of the page
  const rawEl = contentEl || document.body;

  // Make a copy of the content so we don't change the real page
  const clone = rawEl.cloneNode(true);

  // Remove all the clutter we don't want
  // (menus, ads, footers, sidebars, etc.)
  const noise = clone.querySelectorAll(
    'nav, header, footer, aside, script, style, noscript, iframe, form'
  );
  noise.forEach(el => el.remove());

  // Get the clean text
  const text = clone.innerText
    .replace(/\s{3,}/g, '\n\n') // remove extra blank lines
    .trim()
    .slice(0, 8000); // only take first 8000 characters (AI has limits)

  // Count words and estimate reading time
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // average person reads 200 words/min

  // Send everything back
  return { title, url, text, wordCount, readingTime };
}


// This listens for a message from the popup
// When popup says "extractContent", we run the function above
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'extractContent') {
    const data = extractPageContent();
    sendResponse({ success: true, data });
  }
  return true; // this keeps the connection open while we work
});