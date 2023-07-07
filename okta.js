import axios from "axios";
import Bottleneck from "bottleneck";
import config from "./config.js";


const okta = axios.create({
    baseURL: `https://${config.oktaHost}/api/v1`,
    headers: {
        "Authorization": `SSWS ${config.oktaApiToken}`
    }
})


const limiter = new Bottleneck({
    minTime: config.oktaRequestDelayMs
  });

okta.interceptors.request.use(async reqConfig => {
    try {
        await limiter.schedule(() => {
            //console.log(`Throttling request to ${reqConfig.url}`)
        });

        return reqConfig
    } catch (error) {
        console.error("Error while throttling")
    }
}, error => {
    console.error("Error while thottling")
})

export default okta