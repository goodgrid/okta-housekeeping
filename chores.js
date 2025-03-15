import { stringify } from "csv-stringify/sync"
import { oktaExternal, oktaInternal } from "./okta.js"
import { csvFileToArray } from "./utils.js"
import config from "./config.js"

export const getAppProfiles = async (args) => {
    const [appLabel] = args

    const { data : apps } = await oktaExternal.get(`apps`)

    const appProfiles = await Promise.all(apps.filter(app => {
        const isActive = (app.status == 'ACTIVE')
        const isSsoApp = (["SAML_1_1", "SAML_2_0", "OPENID_CONNECT"].indexOf(app.signOnMode) > -1)
        const isRequested = (appLabel === undefined || app.label == appLabel)

        return (isActive && isSsoApp && isRequested)
    }).map(async app => {
        return {
            id: app.id,
            name: app.name,
            label: app.label,
            profiles: (await oktaExternal.get(`apps/${app.id}/users`)).data
        }
    }))

    console.log(appProfiles[0].profiles)
    
}


export const convertDomain = async (args) => {
    const [attributes, oldDomain, newDomain] = args

    const { data: users } = await oktaExternal.get(`users?search=${encodeURIComponent("profile.email eq \"split.test@notarisid.nl\"")}`)

    for (const user of users) {
        
        for (const attribute of attributes.split(",")) {

            user.profile[attribute] = user.profile[attribute].replace(oldDomain, newDomain)

        }
        
        const response = await oktaExternal.post(`users/${user.id}`, { profile: user.profile })

        console.log(``)
        
    }
}

export const setProfileAttribute = async (args) => {
    const [srcAttribute, dstAttribute] = args

    const { data: users } = await oktaExternal.get(`users?search=${encodeURIComponent("profile.email eq \"koen.bonnet@notarisid.nl\"")}`)

    for (const user of users) {
        
        user.profile[dstAttribute] = user.profile[srcAttribute]

        console.log(user.profile)
        const response = await oktaExternal.post(`users/${user.id}`, { profile: user.profile })

        console.log(response.statusText)
        
    }
}


export const unblockMailRecipients = async (args) => {
    const [emailAdresses] = args

    if (emailAdresses == undefined) {
        console.log(`You need to provide addressList as the third argument, multiple addresses comma separated`)
        process.exit()
    }

    const response = await oktaExternal.post(`org/email/bounces/remove-list`,{    
        "emailAddresses": emailAdresses.split(",")
    })

    console.log(response.data)

}

export const listAdmins = async () => {

    const admins = (await oktaInternal.get(`privileges/admins`)).data

    const users = await Promise.all(admins.map(async admin => {
        
        const user = (await oktaExternal.get(`users/${admin.userId}`)).data
        const roles = (await oktaExternal.get(`users/${admin.userId}/roles`)).data.map(role => role.label).join(", ")

        return {
            ...user.profile,
            lastLogin: user.lastLogin,
            roles:  roles
        }
    }))


    const csvOptions = {
        header: true,
        ...config.csvOptions
    }

    console.log(stringify(users,csvOptions))    
}

export const unrollAllFactorsExceptTypes = async(args) => {
    const [csvPath, factorTypesToExclude] = args

    const csv = await csvFileToArray(csvPath)

    for (let i=90;i<99;i++) {
        //console.log(csv[i][4])

        const { data : factors } = await oktaExternal.get(`users/${csv[i][4]}/factors`)

        for (let j=0;j<factors.length;j++) {
            if (factorTypesToExclude.split(",").indexOf(factors[j].factorType) == -1) {
                
                try {
                    await oktaExternal.delete(`users/${csv[i][4]}/factors/${factors[j].id}`)
                    console.log(`Resetting factor ${factors[j].vendorName} ${factors[j].factorType} from user ${csv[i][8]} (${csv[i][4]}).`)
                } catch(error) {
                    console.log(`Could not reset ${factors[j].vendorName} ${factors[j].factorType} from user ${csv[i][8]} (${csv[i][4]}). It was probably already removed with the other part of Okta Verify Push`)
                }
            }
        }
    }

}

export const unenrollFactorOfType = async(args) => {
    const [factorType, csvPath] = args

    if (factorType == undefined || csvPath == undefined) {
        console.log(`You need to provide factorType as the third argument and csvPath as the fourth argument`)
        process.exit()
    }

    const csvObject = await csvFileToArray(csvPath)

    for (const user of csvObject) {
        try {
            const enrolledFactors = (await oktaExternal.get(`users/${user.userId}/factors`)).data

            enrolledFactors.map(factor => {
                console.log(user.userId, factor.factorType)
            })

            const enrolledFactor = enrolledFactors.find(factor => factor.factorType == factorType)
            
            console.log(enrolledFactor)

            if (enrolledFactor) {
                //await oktaExternal.delete(`users/${user.userId}/factors/${enrolledFactor.id}?removeRecoveryEnrollment=false`)
                console.log(`User ${user.userId} now has factor '${factorType}' unenrolled.`)
            } else {
                console.log(`User ${user.userId} does not have an enrolled factor of type '${factorType}'`)
            }  
              
        }
        catch(error) {     
            console.log(`Unenrollment for user ${user.userId} failed`, error.response ? error.response.data : error)
        }
        
    }
    
}

export const listAllAccounts = async () => {
    const filter = "status eq \"STAGED\" or status eq \"PROVISIONED\" or status eq \"ACTIVE\" or status eq \"RECOVERY\" or status eq \"LOCKED_OUT\" or status eq \"PASSWORD_EXPIRED\" or status eq \"SUSPENDED\" or status eq \"DEPROVISIONED\""
    try {
        const response = await oktaExternal.get(`/users?search=${filter}` )
        
        const result = response.data.map(user => {
            return {
                //"ID": user.id,
                "Full name": `${user.profile.firstName} ${user.profile.lastName}`,
                "Username": `${user.profile.login}`,
                "Account status": `${user.status}`
            }            
        })

        console.log(stringify(result, config.csvOptions))

    } catch(error) {
        console.error(error.response.data)
    }
}
    


export const listDeactivatedAccounts = async () => {
    const filter = "status eq \"DEPROVISIONED\""
    try {
        const response = await oktaExternal.get(`/users?search=${filter}` )

        const result = response.data.map(user => {
            return {
                //"ID": user.id,
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
        const response = await oktaExternal.get(`/users?search=${filter}` )

        const result = response.data.map(user => {
            
            const dt = new Date(user.created)
            dt.setDate(dt.getDate() + config.activationLinkValidDays)
            return {
                //"ID": user.id,
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
        const response = await oktaExternal.get(`/users?search=${filter}` )

        const result = await Promise.all(response.data.map(async user => {
            return {
                //"ID": user.id,
                "Full name": `${user.profile.firstName} ${user.profile.lastName}`,
                "Username": `${user.profile.login}`,
                "API Response": getResponseMeaning(((await oktaExternal.delete(`/users/${user.id}`)).status))
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
        const response = await oktaExternal.get(`/users?search=${filter}` )

        const result = await Promise.all(response.data.map(async user => {      
            return {
                //"ID": user.id,
                "Full name": `${user.profile.firstName} ${user.profile.lastName}`,
                "Username": `${user.profile.login}`,
                "API Response": getResponseMeaning(((await oktaExternal.post(`/users/${user.id}/lifecycle/deactivate`)).status))
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