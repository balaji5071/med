
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const path = require('path');

async function listModels() {
  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
      try {
        const envPath = path.join(__dirname, '../.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const match = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match) {
            apiKey = match[1].trim();
        }
      } catch (e) {
          console.log("Could not read .env.local");
      }
  }

  if (!apiKey) {
    console.error("No API key found");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    // There isn't a direct listModels method on the instance in some versions, 
    // but let's try to just run a simple prompt on gemini-pro to see if it works,
    // or if we can find a way to list.
    // Actually, the error message suggested calling ListModels. 
    // In the Node SDK, it might be different.
    // Let's try to use the model and see if we can get a better error or success.
    
    // Wait, the SDK doesn't expose listModels directly on the client usually?
    // It seems we might need to use the REST API to list models if the SDK doesn't support it easily.
    
    // Let's try to fetch the list via REST
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await response.json();
    console.log("Available models:", JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error("Error:", error);
  }
}

listModels();
