import fs from 'fs/promises'
import { parse } from 'csv-parse/sync'
import config from './config.js'


export const csvFileToArray = async (csvFile) => {

    const csvData = await fs.readFile(csvFile)
    return parse(csvData, config.csvOptions)

}