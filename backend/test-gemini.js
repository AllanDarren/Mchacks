require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  const API_KEY = process.env.GEMINI_API_KEY;
  
  console.log('API Key:', API_KEY ? API_KEY.substring(0, 20) + '...' : 'NOT FOUND');
  console.log('\nTesting Gemini API...\n');

  const genAI = new GoogleGenerativeAI(API_KEY);

  // Try the simplest possible call
  const modelNames = [
    'models/gemini-2.0-flash',
    'models/gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-pro'
  ];

  for (const modelName of modelNames) {
    try {
      console.log(`\n📝 Testing: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const prompt = "Say hello in one sentence";
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      console.log(`✅ SUCCESS with ${modelName}!`);
      console.log(`Response: ${text}`);
      console.log(`\n🎉 USE THIS MODEL: "${modelName}"\n`);
      return modelName;
    } catch (error) {
      console.log(`❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ All models failed. Checking API key validity...');
  console.log('Visit: https://aistudio.google.com/app/apikey to verify your key');
}

testGemini();
