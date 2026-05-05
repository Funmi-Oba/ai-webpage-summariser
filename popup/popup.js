// popup.js
// This is the brain of the popup
// It connects the button clicks to content.js and background.js

// ================================
// GET ALL THE HTML ELEMENTS
// ================================
const summarizeBtn = document.getElementById('summarizeBtn');
const clearBtn = document.getElementById('clearBtn');
const loadingState = document.getElementById('loadingState');
const errorMsg = document.getElementById('errorMsg');
const outputArea = document.getElementById('outputArea');
const pageTitleEl = document.getElementById('pageTitle');
const wordInfoEl = document.getElementById('wordInfo');
const summaryList = document.getElementById('summaryList');
const insightsList = document.getElementById('insightsList');
const readingTimeEl = document.getElementById('readingTime');
const copyBtn = document.getElementById('copyBtn');

let currentPageData = null;


// ================================
// WHEN POPUP OPENS: Show page title
// ================================
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  pageTitleEl.textContent = tab?.title || 'Unknown Page';
});


// ================================
// WHEN USER CLICKS "Summarize Page"
// ================================
summarizeBtn.addEventListener('click', async () => {

  // Show loading, hide everything else
  setLoading(true);
  clearError();
  hideOutput();

  try {

    // STEP 1: Find the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // STEP 2: Inject content script into the page (just in case)
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    }).catch(() => {}); // ignore error if already injected

    // STEP 3: Ask content.js to extract the page text
    const extractResponse = await chrome.tabs.sendMessage(tab.id, {
      action: 'extractContent'
    });

    if (!extractResponse?.success) {
      throw new Error('Could not read this page. Try refreshing it first.');
    }

    // STEP 4: Save the page data and show word count
    currentPageData = extractResponse.data;
    wordInfoEl.textContent = `~${currentPageData.wordCount} words · ${currentPageData.readingTime} min read`;

    // STEP 5: Send text to background.js to call OpenAI
    const summaryResponse = await chrome.runtime.sendMessage({
      action: 'summarize',
      data: currentPageData
    });

    if (!summaryResponse?.success) {
      throw new Error(summaryResponse?.error || 'Summarization failed. Try again.');
    }

    // STEP 6: Show the summary
    renderOutput(summaryResponse.result);

  } catch (err) {
    showError(err.message || 'Something went wrong. Please try again.');
  } finally {
    setLoading(false);
  }

});


// ================================
// WHEN USER CLICKS "Clear" button
// ================================
clearBtn.addEventListener('click', () => {
  hideOutput();
  clearError();
  wordInfoEl.textContent = '';
  currentPageData = null;
});


// ================================
// WHEN USER CLICKS "Copy" button
// ================================
copyBtn.addEventListener('click', () => {
  if (!currentPageData) return;

  // Build a text version of the summary
  const summaryText = [...summaryList.querySelectorAll('li')]
    .map(li => `• ${li.textContent}`)
    .join('\n');

  const insightsText = [...insightsList.querySelectorAll('li')]
    .map(li => `💡 ${li.textContent}`)
    .join('\n');

  const fullText = `Summary:\n${summaryText}\n\nKey Insights:\n${insightsText}`;

  // Copy to clipboard
  navigator.clipboard.writeText(fullText).then(() => {
    copyBtn.textContent = 'Copied! ✅';
    setTimeout(() => copyBtn.textContent = 'Copy', 2000);
  });
});


// ================================
// HELPER FUNCTIONS
// ================================

// Show the summary on screen
function renderOutput({ summary, keyInsights, readingTime }) {
  summaryList.innerHTML = '';
  insightsList.innerHTML = '';

  (summary || []).forEach(point => {
    const li = document.createElement('li');
    li.textContent = sanitize(point); // safe — no innerHTML
    summaryList.appendChild(li);
  });

  (keyInsights || []).forEach(insight => {
    const li = document.createElement('li');
    li.textContent = sanitize(insight);
    insightsList.appendChild(li);
  });

  readingTimeEl.textContent = `⏱ ~${readingTime || '?'} min read`;
  outputArea.classList.remove('hidden');
}

// Remove any dangerous characters (security)
function sanitize(str) {
  return String(str).replace(/[<>]/g, '');
}

// Show or hide the loading spinner
function setLoading(state) {
  summarizeBtn.disabled = state;
  loadingState.classList.toggle('hidden', !state);
}

// Show an error message
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}

// Hide any error message
function clearError() {
  errorMsg.textContent = '';
  errorMsg.classList.add('hidden');
}

// Hide the output area
function hideOutput() {
  outputArea.classList.add('hidden');
}