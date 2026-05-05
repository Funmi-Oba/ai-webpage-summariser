// background.js
// Now calls our secure Vercel proxy server instead of Groq directly
// API key is safely stored on the server - not exposed here at all

const PROXY_URL = 'https://summarizer-proxy-seven.vercel.app/api/summarize';


// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'summarize') {

    handleSummarize(message.data)
      .then(result => sendResponse({ success: true, result }))
      .catch(err => sendResponse({ success: false, error: err.message }));

    return true;
  }
});


async function handleSummarize({ title, text, url }) {

  // STEP 1: Check cache first
  const cached = await getCachedSummary(url);
  if (cached) {
    console.log('Returning cached summary');
    return cached;
  }

  // STEP 2: Call our Vercel proxy server
  const response = await fetch(PROXY_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ title, text, url })
  });


  // STEP 3: Handle errors
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || 'Proxy server request failed');
  }


  // STEP 4: Read the response
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'Summarization failed');
  }


  // STEP 5: Cache and return
  await cacheSummary(url, data.result);
  return data.result;
}


// Save summary to Chrome storage
async function cacheSummary(url, data) {
  return new Promise(resolve => {
    chrome.storage.local.set({ [url]: data }, resolve);
  });
}


// Get saved summary from Chrome storage
async function getCachedSummary(url) {
  return new Promise(resolve => {
    chrome.storage.local.get([url], result => {
      resolve(result[url] || null);
    });
  });
}