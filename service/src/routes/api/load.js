export const $post = async (c) => {
    const keyNames = await c.req.json()
    const user = c.get("user")

    if (user.allowed === undefined) {
        return c.json(
            { message: "Allowed key list not defined" },
            401
        )
    }

    const validKeyNames = user.allowed.map(
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
        where
            users_asuid = ?1
            and name = ?2
    `)
    const result = await Promise.all(
        keyNames.map(
            name => sql.bind(user.asuid, name).all()
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
