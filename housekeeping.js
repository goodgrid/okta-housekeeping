import * as chores from './chores.js'

const chore = process.argv[3]

if (!chores[chore]) {
    console.log(`You're trying to let me do a chore I don't understand yet. You can choose from ${Object.keys(chores).join(", ")}`)

} else {

    console.log("*********************************************************************")
    console.log("*                                                                   *")
    console.log("*                   Okta Housekeeping                               *")
    console.log(`*                Chore: ${chore.padEnd(21)}*`)
    console.log("*                                                                   *")
    console.log("*********************************************************************")
    console.log("")

    const commandArgs = process.argv.slice(5, process.argv.length + 1)
    
    await chores[chore](commandArgs)

    console.log("")
    console.log("***************************** Finished ******************************")
}



