import axios from "axios";
import Bottleneck from "bottleneck";
import config from "./config.js";


export const oktaExternal = axios.create({
    baseURL: `https://${config.oktaHost}/api/v1`,
    headers: {
        "Authorization": `SSWS ${config.oktaApiToken}`
    }
})

export const oktaInternal = axios.create({
    baseURL: `https://${config.oktaHost}/api/internal`,
    headers: {
        "Authorization": `SSWS ${config.oktaApiToken}`
    }
})


const limiter = new Bottleneck({
    minTime: config.oktaRequestDelayMs
})

oktaExternal.interceptors.request.use(async reqConfig => {
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

oktaExternal.interceptors.response.use(async response => {

    let totalData = response.data

    const next = nextPage(response.headers.link)

    if (next !== undefined) {

        try {

            const nextResponse = await oktaExternal.get(next)
            totalData = totalData.concat(nextResponse.data)
        } catch (error) {
            console.error(error)
        }
    }

    response.data = totalData
    return response;
});

oktaInternal.interceptors.request.use(async reqConfig => {
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

oktaInternal.interceptors.response.use(async response => {

    let totalData = response.data

    const next = nextPage(response.headers.link)

    if (next !== undefined) {
        try {

            const nextResponse = await oktaInternal.get(next)
            totalData = totalData.concat(nextResponse.data)
        } catch (error) {
            console.error(error)
        }
    }

    response.data = totalData
    return response;
});


const nextPage = (linkHeaders) => {

    if (linkHeaders == undefined) return undefined


    const nextLink = linkHeaders.split(",")
        .find(header => {
            return (header.indexOf(`rel="next"`) > -1)
        })

    if (!nextLink) return undefined

    return nextLink.split(";")[0].trim().replace(/[<>]/g, "")

}
