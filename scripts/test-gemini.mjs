import fs from 'fs';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

const envContent = fs.readFileSync('.env', 'utf8');
let apiKey = '';
for (const line of envContent.split('\n')) {
  if (line.startsWith('GOOGLE_GENERATIVE_AI_API_KEY=')) {
    apiKey = line.substring('GOOGLE_GENERATIVE_AI_API_KEY='.length).trim().replace(/["']/g, '');
  }
}

const google = createGoogleGenerativeAI({ apiKey });

async function run() {
  try {
    const res = await generateText({
      model: google('gemini-2.5-flash'),
      prompt: 'Hello in 3 words'
    });
    console.log('SUCCESS:', res.text);
  } catch (err) {
    console.error('ERROR:', err);
  }
}

run();
