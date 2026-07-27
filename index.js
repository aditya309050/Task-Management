/**
 * This file exists purely to intercept Render's default "node index.js" start command.
 * It will run database migrations first, then start the compiled server.
 */
const { execSync } = require('child_process');

// Only run db push in production (Render) to avoid issues locally
if (process.env.NODE_ENV === 'production') {
  console.log("Running Prisma DB Push to ensure tables exist on Render...");
  try {
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log("Prisma DB Push complete!");
  } catch (error) {
    console.error("Failed to push Prisma schema:", error);
  }
}

// Pass execution to the actual compiled TypeScript app
console.log("Starting compiled server...");
require('./dist/index.js');
