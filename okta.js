import axios from "axios";
import config from "./config.js";


const okta = axios.create({
    baseURL: `https://${config.oktaHost}/api/v1`,
    headers: {
        "Authorization": `SSWS ${config.oktaApiToken}`
    }
})

export default okta