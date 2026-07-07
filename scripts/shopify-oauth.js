// scripts/shopify-oauth.js
const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const CLIENT_ID = '43e7e906801f18078bd7e71163e8ccd7';
const CLIENT_SECRET = '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';
const SHOP = 'em8r1e-kv.myshopify.com';
const REDIRECT_URI = 'http://localhost:3000/auth/callback';
const SCOPES = 'read_products,write_products';
const PORT = 3000;

// Update .env.local file with the new token
function updateEnvFile(token) {
  const envPath = path.resolve(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    let content = fs.readFileSync(envPath, 'utf8');
    // Replace the old invalid token with the new one
    content = content.replace(
      /SHOPIFY_ADMIN_ACCESS_TOKEN=.*/,
      `SHOPIFY_ADMIN_ACCESS_TOKEN=${token}`
    );
    fs.writeFileSync(envPath, content, 'utf8');
    console.log('\n[✔] Successfully updated .env.local with new SHOPIFY_ADMIN_ACCESS_TOKEN');
  }
}

// Generate the authorization URL
const authUrl = `https://${SHOP}/admin/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&state=firstroom_migration_nonce`;

console.log('=== Shopify OAuth Token Generator ===\n');
console.log('To get your API token, please open this URL in your browser:');
console.log(`\n${authUrl}\n`);
console.log('Waiting for you to authorize the app...\n');

// Start a simple local server to listen for the callback
const server = http.createServer(async (req, res) => {
  const reqUrl = url.parse(req.url, true);

  if (reqUrl.pathname === '/auth/callback') {
    const { code, shop, state } = reqUrl.query;
    
    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      res.end('Error: No authorization code provided in callback.');
      return;
    }

    console.log('[+] Received authorization code! Exchanging for access token...');

    try {
      // Exchange the authorization code for a permanent access token
      const tokenResponse = await fetch(`https://${SHOP}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          code: code
        })
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.access_token) {
        console.log('\n[SUCCESS] Access token received!');
        console.log(`Token: ${tokenData.access_token}\n`);
        
        updateEnvFile(tokenData.access_token);
        
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
          <html>
            <body style="font-family: system-ui; text-align: center; margin-top: 100px;">
              <h1 style="color: #008060;">Authorization Successful!</h1>
              <p>Your access token has been generated and saved to your <code>.env.local</code> file.</p>
              <p>You can close this tab and return to Antigravity.</p>
            </body>
          </html>
        `);
        
        // Give time for the response to send before exiting
        setTimeout(() => {
          server.close();
          process.exit(0);
        }, 1000);
      } else {
        console.error('Failed to get access token:', tokenData);
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Failed to retrieve access token. Check console logs.');
      }
    } catch (error) {
      console.error('Error exchanging token:', error);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Server error exchanging token.');
    }
  }
});

server.listen(PORT, () => {
  // Automatically try to open the browser (macOS)
  exec(`open "${authUrl}"`);
});
