const mode = "NOproduction";

const productionUrl = process.env.REACT_APP_RAILWAY_URL;
const productionUrlBackup = process.env.REACT_APP_VERCEL_URL;

export const backendUrl =
  mode === "production"
    ? productionUrl
    : "http://192.168.1.65:3000";

export const backendUrlBackup =
  mode === "production"
    ? productionUrlBackup
    : "http://10.99.86.14:3000";
