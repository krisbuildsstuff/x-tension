chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'extractThread' }, (response) => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    } else {
      console.log('Extracted text:', response.text);
      // You can save the text to storage or download it as a file here
    }
  });
});

let groqApiKey = '';

// Read the API key from the .env file
fetch(chrome.runtime.getURL('.env'))
  .then(response => response.text())
  .then(text => {
    const match = text.match(/GROQ_API_KEY=(.+)/);
    if (match) {
      groqApiKey = match[1].trim();
    }
  })
  .catch(error => console.error('Error loading .env file:', error));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getApiKey') {
    sendResponse(groqApiKey);
  }
});