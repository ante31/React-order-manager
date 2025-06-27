
const mode = "NOproduction"
const productionUrl = process.env.REACT_APP_RAILWAY_URL;
const productionUrlBackup = process.env.REACT_APP_VERCEL_URL;

export const backendUrl = mode === 'production'
  ? productionUrl 
  : `http://localhost:3000`; 

export const backendUrlBackup = mode === 'production'
  ? productionUrlBackup
  : `http://localhost:3000`;
