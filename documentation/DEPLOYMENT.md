# Deployment

The server is deployed on an EC2 instance. Deployments are handled automatically through GitHub Actions. To manually deploy (ie. to test changes), you can run the following commands:

```bash
npm install -g node-gyp # Needed for better-sqlite3
npm install
node index.js
```