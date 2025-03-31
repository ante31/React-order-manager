const mode = process.env.REACT_APP_MODE;

const localhost = process.env.REACT_APP_LOCALHOST;
const devPort = process.env.REACT_APP_DEV_PORT;
const productionUrl = process.env.REACT_APP_PRODUCTION_URL;

export const backendUrl = mode === 'production'
  ? productionUrl 
  : `http://${localhost}:${devPort}`; 
