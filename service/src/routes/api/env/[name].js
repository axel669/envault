// import aes from "#lib/aes"
import yaml from "js-yaml"

import { loadVault } from "#lib/vault"

export const $post = async (c) => {
    const { name } = c.req.param()
    const user = c.get("user")
    const requestData = await c.req.json()
    const { vaultKey, keys } = requestData

    // console.log(requestData)

    // const keyList = reqKeys?.split(",") ?? []
    const keyList = Object.keys(keys)
    const allow = user.allow ?? { [name]: ["*"] }
    const allowed = allow[name]

    const validKeyNames = allowed.map(
        name => new RegExp(`^${name.replace("*", ".*?")}$`)
    )
    const invalidNames = keyList.filter(
        name => {
            for (const check of validKeyNames) {
                if (check.test(name) === true) {
                    return false
                }
            }
            return true
        }
    )
    if (invalidNames.length > 0) {
        return c.json(
            { message: "Invalid env items requested", invalidNames },
            401
        )
    }

    const vaultText = await loadVault(user, c.env.storage, name, vaultKey)
    const vault = yaml.load(vaultText)
    const envVars = Object.fromEntries(
        Object.entries(keys).map(
            ([ source, dest ]) => [
                dest,
                vault[source]
            ]
        )
    )

    return c.json(envVars)
}
