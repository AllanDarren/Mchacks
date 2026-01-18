require('dotenv').config();
const https = require('https');

const API_KEY = process.env.GEMINI_API_KEY;

console.log('Fetching available models from Gemini API...\n');

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models?key=${API_KEY}`,
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      
      if (response.models) {
        console.log('✅ Available models:\n');
        response.models.forEach(model => {
          if (model.supportedGenerationMethods && 
              model.supportedGenerationMethods.includes('generateContent')) {
            console.log(`📝 ${model.name}`);
            console.log(`   Display Name: ${model.displayName}`);
            console.log(`   Methods: ${model.supportedGenerationMethods.join(', ')}`);
            console.log('');
          }
        });
      } else {
        console.log('❌ Response:', data);
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Request error:', error);
});

req.end();
