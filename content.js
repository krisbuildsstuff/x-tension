function extractThreadText() {
  const tweets = document.querySelectorAll('[data-testid="tweetText"]');
  const threadText = Array.from(tweets).map(tweet => {
    // Extract text and remove newlines
    let text = tweet.innerText.replace(/\n/g, ' ');
    // Remove any remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    return text.trim();
  }).join('\n\n');
  return threadText;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extractThread') {
    const threadText = extractThreadText();
    sendResponse({ text: threadText });
  }
});