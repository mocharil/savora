// Script to check available models from Kolosal API
// Run with: node scripts/check-kolosal-models.js

const OpenAI = require('openai');

const client = new OpenAI({
  apiKey: process.env.KOLOSAL_API_KEY,
  baseURL: 'https://api.kolosal.ai/v1'
});

async function listModels() {
  try {
    console.log('Fetching available models from Kolosal API...\n');

    // Using the /v1/models endpoint from the API spec
    const response = await fetch('https://api.kolosal.ai/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.KOLOSAL_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Available Models:');
    console.log(JSON.stringify(data, null, 2));

    return data;
  } catch (error) {
    console.error('Error fetching models:', error.message);
    return null;
  }
}

async function testChatModel() {
  try {
    console.log('\n\nTesting chat completion with MiniMax M2...\n');

    const completion = await client.chat.completions.create({
      model: 'MiniMax M2',
      messages: [
        { role: 'user', content: 'Halo, sebutkan 3 makanan khas Indonesia!' }
      ]
    });

    console.log('Response:', completion.choices[0].message.content);
    console.log('\nUsage:', completion.usage);
  } catch (error) {
    console.error('Error testing chat:', error.message);
  }
}

async function main() {
  if (!process.env.KOLOSAL_API_KEY) {
    console.error('Error: KOLOSAL_API_KEY environment variable not set');
    console.log('Please add KOLOSAL_API_KEY to your .env.local file');
    process.exit(1);
  }

  await listModels();
  await testChatModel();
}

main();
