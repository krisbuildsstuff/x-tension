document.getElementById('extractButton').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    // Inject the content script
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });

    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractThread' });
    
    if (response && response.text) {
      console.log('Extracted text:', response.text);
      // Display the text in the popup
      document.getElementById('result').innerHTML = `<pre>${response.text}</pre>`;
    } else {
      throw new Error('No response or empty text received');
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
  }
});

document.getElementById('generateEmailButton').addEventListener('click', async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'extractThread' });
    
    if (response && response.text) {
      const email = await generateEmail(response.text);
      document.getElementById('result').innerHTML = `<pre>${email}</pre>`;
    } else {
      throw new Error('No response or empty text received');
    }
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('result').innerHTML = `<p>Error: ${error.message}</p>`;
  }
});

async function generateEmail(threadText) {
  const apiKey = await chrome.runtime.sendMessage({ action: 'getApiKey' });
  
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: 'You are an assistant that transforms Twitter threads into engaging, informative newsletter content. Your task is to create compelling, well-structured articles that capture the essence of the thread, provide valuable insights, and are suitable for a wide audience. Include a catchy headline, an introductory paragraph, main points with subheadings, and a conclusion. Ensure the content is polished, professional, and ready for newsletter distribution.' },
        { role: 'user', content: `Summarize this Twitter thread and create a professional email from it: ${threadText}` }
      ],
      model: 'llama3-8b-8192'
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}