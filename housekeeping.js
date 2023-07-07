import * as chores from './chores.js'

const chore = process.argv[2]

if (!chores[chore]) {
    console.log(`You're trying to let me do a chore I don't understand yet. You can choose from ${Object.keys(chores).join(", ")}`)

} else {

    console.log("*********************************************************************")
    console.log("*                                                                   *")
    console.log("*                Holmatro Identity Housekeeping                     *")
    console.log(`*                Chore: ${chore.padEnd(21)}*`)
    console.log("*                                                                   *")
    console.log("*********************************************************************")
    console.log("")

    await chores[chore]()

    console.log("")
    console.log("***************************** Finished ******************************")
}



