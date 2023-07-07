import { stringify } from "csv-stringify/sync"
import okta from "./okta.js"
import config from "./config.js"

const csvOptions = {
    headers: true,
    delimiter: config.csvSeparator
}

export const listAllAccounts = async () => {
    const filter = "status eq \"STAGED\" or status eq \"PROVISIONED\" or status eq \"ACTIVE\" or status eq \"RECOVERY\" or status eq \"LOCKED_OUT\" or status eq \"PASSWORD_EXPIRED\" or status eq \"SUSPENDED\" or status eq \"DEPROVISIONED\""
    try {
        const response = await okta.get(`/users?search=${filter}` )
        
        const result = response.data.map(user => {
            return {
                "ID": user.id,
                "Full name": `${user.profile.firstName} ${user.profile.lastName}`,
                "Username": `${user.profile.login}`,
                "Account status": `${user.status}`
            }            
        })

        console.log(stringify(result, csvOptions))

    } catch(error) {
        console.error(error.response.data)
    }
}
    


export const listDeactivatedAccounts = async () => {
    const filter = "status eq \"DEPROVISIONED\""
    try {
        const response = await okta.get(`/users?search=${filter}` )

        const result = response.data.map(user => {
            return {
                "ID": user.id,
                "Full name": `${user.profile.firstName} ${user.profile.lastName}`,
                "Username": `${user.profile.login}`,
            }            
        })

        console.log(stringify(result, csvOptions))

    } catch(error) {
        console.error(error.response.data)
    }
}

export const listPendingAccounts = async () => {
    const filter = `status eq \"PROVISIONED\"`
    try {
        const response = await okta.get(`/users?search=${filter}` )

        const result = response.data.map(user => {
            
            const dt = new Date(user.created)
            dt.setDate(dt.getDate() + config.activationLinkValidDays)
            return {
                "ID": user.id,
                "Full name": `${user.profile.firstName} ${user.profile.lastName}`,
                "Username": `${user.profile.login}`,
                "Activation expiry": `${dt.toLocaleDateString('nl-NL')}`
            }            
        })

        console.log(stringify(result, csvOptions))

    } catch(error) {
        console.error(error.response.data)
    }
}


export const deleteDeactivatedAccounts = async () => {
    const filter = "status eq \"DEPROVISIONED\""
    try {
        const response = await okta.get(`/users?search=${filter}` )

        const result = await Promise.all(response.data.map(async user => {
            return {
                "ID": user.id,
                "Full name": `${user.profile.firstName} ${user.profile.lastName}`,
                "Username": `${user.profile.login}`,
                "API Response": getResponseMeaning(((await okta.delete(`/users/${user.id}`)).status))
            }            
        }))

        console.log(stringify(result,csvOptions))

    } catch(error) {
        console.error((error.response) ? error.response.data : error)
    }
}

export const deactivateExpiredPendingAccounts = async () => {
    const dt = new Date()
    dt.setDate(dt.getDate() - config.activationLinkValidDays)

    const filter = `status eq \"PROVISIONED\" and created lt \"${dt.toISOString()}\"`

    try {
        const response = await okta.get(`/users?search=${filter}` )

        const result = await Promise.all(response.data.map(async user => {      
            return {
                "ID": user.id,
                "Full name": `${user.profile.firstName} ${user.profile.lastName}`,
                "Username": `${user.profile.login}`,
                "API Response": getResponseMeaning(((await okta.post(`/users/${user.id}/lifecycle/deactivate`)).status))
            }            
        }))

        console.log(stringify(result,csvOptions))

    } catch(error) {
        console.error((error.response) ? error.response.data : error)
    }
}

const getResponseMeaning = (statusCode) => {
    if (statusCode >= 200 && statusCode < 300) return "OK"
    if (statusCode >= 500 && statusCode < 600) return "OK"
    else return "UNKNOWN"
}