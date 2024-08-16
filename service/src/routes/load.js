export const $post = async (c) => {
    const keyNames = await c.req.json()
    const apiKey = c.req.header("api-key") ?? ""

    const keyValid = await c.env.storage.prepare(
        "select * from api_keys where key = ?1"
    ).bind(apiKey).all()

    if (keyValid.results.length === 0) {
        return c.json("nope", 403)
    }

    const validKeyNames = JSON.parse(keyValid.results[0].allowed).map(
        name => new RegExp(`^${name.replace("*", ".*")}$`)
    )
    const invalidKeys = keyNames.filter(
        name => {
            for (const check of validKeyNames) {
                if (check.test(name) === true) {
                    return false
                }
            }
            return true
        }
    )
    if (invalidKeys.length > 0) {
        return c.json(
            { message: "Invalid keys requested", invalidKeys },
            401
        )
    }

    const sql = c.env.storage.prepare(`
        select * from vault
        where name = ?1
    `)
    const result = await Promise.all(
        keyNames.map(
            name => sql.bind(name).all()
        )
    )
    const env = Object.fromEntries(
        result.map(
            res => {
                const item = res.results[0]
                if (item === undefined) {
                    return []
                }
                return [item.key, item.value]
            }
        )
    )
    return c.json(env)
}
