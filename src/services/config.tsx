﻿import * as fs from "fs";

const envVarRegex = /^\$\{(.*)\}$/

/**
 *
 Standalone config management util.
 It will read a specified JSON config file (or created it if it doesn't exist)
 and parse any value that is written like ${ENV_VAR_NAME} with it's os equivalent

 There basic config is as follow :
 {
        "ENV" : "DEV",
        "DEV":{}
    }

 * @type {{}}
 */
let config = {}
let configName: string = "NONE"

/**
 *
 Read and search for the ENV key in the config file(json) to set the current config

 @param configPath: config path to read or create the config at
 @param strict: WIll crash if some variables are not found in environment, otherwise will replace by undefined
 @return: the current parsed config
 */
function initConfig(configPath: string, strict = false) {
    let fullConfig: any = {}

    // Creating default file
    if (!fs.existsSync(configPath)) {
        fs.writeFileSync(configPath, '{"ENV" : "DEV","DEV":{}}')
    }

    // Opening default file
    const data: any = fs.readFileSync(configPath)
    fullConfig = JSON.parse(data)

    function __tryParseEnvVarFromConfig(potentialEnvVar: string): string {
        /**
         *
         Will parse every value that written like "${SOME_VALUE}"
         with the value stored in the environment variable named SOME_VALUE

         If the envvar dosen't exist, it raises an error in strict mode
         */
        if (potentialEnvVar.match(envVarRegex)) {
            const match = potentialEnvVar.match(envVarRegex) ?? []
            const envVarName = match[1] ?? "UNDEFINED"

            const val = process.env[envVarName]
            if (val === undefined) {
                if (strict) {
                    throw new ReferenceError(`The ${envVarName} environment variable is not present in your environment`)
                } else {
                    return "UNDEFINED"
                }
            }
            
            return val

        } else {
            return potentialEnvVar
        }
    }

    function __recursParceEnvVar(config: any) {
        Object.entries(config).forEach(([key, val]) => {
            if (typeof val === "object") {
                config[key] = __recursParceEnvVar(val)
            } else if (typeof val === "string") {
                config[key] = __tryParseEnvVarFromConfig(val)
            }
        })

        return config
    }

    // Parce Env vars
    fullConfig = __recursParceEnvVar(fullConfig)

    if (!Object.keys(fullConfig).includes("ENV")) {
        throw new ReferenceError("The 'ENV' key is not present in the config file. Unable to set the current environment")
    }

    if (!Object.keys(fullConfig).includes(fullConfig["ENV"])) {
        console.error('Unable to set the current environment')
        throw new ReferenceError(`The ${fullConfig["ENV"]} key is not present in the config.json. `)
    }

    configName = __tryParseEnvVarFromConfig(fullConfig["ENV"])
    config = fullConfig[fullConfig["ENV"]]
    return config
}

/**
 *     @param key: optional, key to search, in the format "key.key2.key3" for nested props
 *     @param defaultVal : optional, value if not found in the config, will throw an error if not foudn and no default value
 @return: The whole config if no key was specified, the value otherwise
 */
function getConfig(key = "", defaultVal: any) {
    if (key.trim() !== "" && !key.match('(\\w\\.?)*')) {
        throw new Error("The key must be in the format key1.key2.key3...")
    }

    let val: any = {...config}
    key.split('.').forEach(subKey => {
        if (subKey === "") {
            return
        }

        if (!Object.keys(val).includes(key)) {
            throw new ReferenceError(`The key ${key} wasn't found in the config ${configName}`)
        }

        if (val[key] == null && defaultVal !== undefined) {
            console.warn(`The value of ${key} was undefined in the config ${configName}, using default val ${defaultVal}`)
            val = defaultVal
            return
        }

        if (val[key] == null && defaultVal === undefined) {
            throw new ReferenceError(`The value of ${key} was undefined in the config ${configName} and no default value is given.`)
        }

        val = val[key]
    })

    return val
}

/**
 * Return a function to safely access the config properties
 * @param configFilePath
 * @returns {getConfig}
 */
module.exports = (configFilePath = "config.json") => {
    initConfig(configFilePath)
    return getConfig
}