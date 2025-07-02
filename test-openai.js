// Simple script to test OpenAI API connection
const fs = require('fs');
const { OpenAI } = require('openai');

// Read .env.local file manually
const envContent = fs.readFileSync('.env.local', 'utf8');
const envVars = {};

envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    // Remove any quotes and trim whitespace
    const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    envVars[key.trim()] = value;
  }
});

const apiKey = envVars.OPENAI_API_KEY;

if (!apiKey) {
  console.error('Missing OpenAI API key in environment variables');
  process.exit(1);
}

console.log('OpenAI API Key:', apiKey.substring(0, 5) + '...');

const openai = new OpenAI({
  apiKey: apiKey
});

async function testConnection() {
  try {
    console.log('Testing OpenAI API connection...');
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Say hello!" }
      ],
      max_tokens: 10
    });
    
    console.log('OpenAI API response:', response.choices[0].message.content);
    console.log('Test completed successfully.');
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testConnection(); 