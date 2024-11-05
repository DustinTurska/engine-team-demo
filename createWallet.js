const fetch = require('node-fetch');
const fs = require('fs');

// Load environment variables from .env file
require('dotenv').config({ path: '.env.local' });

async function createSmartWallet() {
  try {
    const engineUrl = process.env.ENGINE_URL;
    const accessToken = process.env.ACCESS_TOKEN;

    if (!engineUrl || !accessToken) {
      console.error('Error: THIRDWEB_ENGINE_URL and THIRDWEB_ENGINE_ACCESS_TOKEN must be set in .env file');
      return;
    }

    console.log('Attempting to create smart wallet...');
    
    const response = await fetch(`${engineUrl}/backend-wallet/create`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: "smart:local"
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server responded with error:', errorData);
      return;
    }
    
    const data = await response.json();
    console.log('Smart Wallet Created:', data);
    
    // Save to file
    fs.writeFileSync('wallet.json', JSON.stringify(data, null, 2));
    console.log('Wallet details saved to wallet.json');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error('Error: Could not connect to the Engine. Make sure your ThirdWeb Engine is running and the URL is correct');
    } else {
      console.error('Error:', error);
    }
  }
}

createSmartWallet(); 