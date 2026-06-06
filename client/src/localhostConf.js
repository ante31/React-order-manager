const mode = "production";

const productionUrl = process.env.REACT_APP_RAILWAY_URL;
const productionUrlBackup = process.env.REACT_APP_VERCEL_URL;

export const backendUrl =
  mode === "production"
    ? productionUrl
    : "http://192.168.1.40:3000";

export const backendUrlBackup =
  mode === "production"
    ? productionUrlBackup
    : "https://servertest-production-dc6f.up.railway.app";
