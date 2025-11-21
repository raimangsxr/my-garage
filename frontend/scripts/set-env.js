const fs = require('fs');
const path = require('path');

// Define the path to the environment files
const envDir = path.join(__dirname, '../src/environments');
const targetPath = path.join(envDir, 'environment.ts');
const targetPathProd = path.join(envDir, 'environment.prod.ts');

// Ensure the environments directory exists
if (!fs.existsSync(envDir)) {
    fs.mkdirSync(envDir, { recursive: true });
}

// Get environment variables
const apiUrl = process.env.API_URL || '/api/v1';
const production = process.env.NODE_ENV === 'production';

// Define the content for the environment file
const envConfigFile = `export const environment = {
  production: ${production},
  apiUrl: '${apiUrl}'
};
`;

// Write the content to the respective file
// For simplicity in this script, we write to both or choose based on NODE_ENV
// But typically you might want distinct files. 
// Here we will overwrite environment.ts which is used by default, 
// and environment.prod.ts if we are in production mode or just always to ensure consistency.

console.log(`Generating environment.ts with API_URL=${apiUrl}`);
fs.writeFileSync(targetPath, envConfigFile);

console.log(`Generating environment.prod.ts with API_URL=${apiUrl}`);
const envProdConfigFile = `export const environment = {
  production: true,
  apiUrl: '${apiUrl}'
};
`;
fs.writeFileSync(targetPathProd, envProdConfigFile);
