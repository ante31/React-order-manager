import { backendUrl, backendUrlBackup } from '../localhostConf';
import emailjs from '@emailjs/browser';

const service_id = process.env.REACT_APP_SERVICE_ID;
const template_id = process.env.REACT_APP_TEMPLATE_ID;
const public_key = process.env.REACT_APP_PUBLIC_KEY;



const sendFailureEmail = async (url, error) => {
  console.log("Sending failure email...", service_id, template_id, public_key);
  try {
    await emailjs.send(
      service_id,
      template_id,
      {
        to_name: "Ante",
        message: `Primary backend (${backendUrl}) failed.\nURL: ${url}\nError: ${error.message}`,
        reply_to: "antemelvan123@example.com",
      },
      public_key
    );
    console.log("Email sent");
  } catch (emailErr) {
    console.error("Failed to send failure email:", emailErr);
  }
};

  export const safeFetch = async (url, options = {}) => {
    try {
      const res = await fetch(url, options);
      if (!res.ok) throw new Error('Primary fetch failed');
      return res;
    } catch (err) {
      console.log(`Primary fetch failed: ${err.message}, trying backup...`);
      console.warn(`Primary fetch failed, trying backup: ${err.message}`);
      //sendFailureEmail(url, err);
      console.log("sendFailureEmail", sendFailureEmail);
      const resBackup = await fetch(url.replace(backendUrl, backendUrlBackup), options);
      return resBackup;
    }
  };
