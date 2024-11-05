import aes from "#lib/aes"
import yaml from "js-yaml"
// import * as gzip from "#lib/gzip"

export const $get = async (c) => {
    const { name } = c.req.param()
    const user = c.get("user")
    const key = c.req.header()["vault-key"]
    const reqKeys = c.req.query().keys

    const { results } = await c.env.storage.prepare(`
        select *
        from vault
        where
            users_asuid = ?2
            and name = ?1
    `).bind(name, user.asuid).all()

    if (results.length === 0) {
        return new Response("")
    }

    const iv = new Uint8Array(results[0].iv)
    const keyBytes = new Uint8Array(
        key.match(/../g).map(hex => parseInt(hex, 16))
    )
    const key1 = keyBytes.slice(0, 32)
    const key2 = keyBytes.slice(32)

    const vault = new TextDecoder().decode(
        await aes.decrypt(
            await aes.decrypt(
                new Uint8Array(results[0].content),
                key2,
                iv
            ),
            key1,
            iv
        )
    )

    if (reqKeys !== undefined) {
        const keyList = reqKeys.split(",")

        const validKeyNames = user.allowed.map(
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

        const entries = Object.entries(
            yaml.load(vault)
        )
        return Response.json(
            entries.reduce(
                (env, [key, pair]) => {
                    if (keyList.includes(key) === true) {
                        return { ...env, ...pair }
                    }
                    return env
                },
                {}
            )
        )
    }

    return Response.json(vault)
}

export const $post = async (c) => {
    const { name } = c.req.param()
    const user = c.get("user")
    const key = c.req.header()["vault-key"]
    const vault = await c.req.json()

    const { results } = await c.env.storage.prepare(`
        select *
        from vault
        where
            users_asuid = ?2
            and name = ?1
    `).bind(name, user.asuid).all()

    const iv =
        (results.length === 0)
        ? crypto.getRandomValues(new Uint8Array(16))
        : new Uint8Array(results[0].iv)

    const keyBytes = new Uint8Array(
        key.match(/../g).map(hex => parseInt(hex, 16))
    )
    const key1 = keyBytes.slice(0, 32)
    const key2 = keyBytes.slice(32)

    const content = await aes.encrypt(
        await aes.encrypt(
            new TextEncoder().encode(vault),
            key1,
            iv
        ),
        key2,
        iv
    )

    const writeInfo = await c.env.storage.prepare(`
        insert into vault(users_asuid, name, iv, content)
        values(?1, ?2, ?3, ?4)
        on conflict do
            update set content = ?4
    `).bind(user.asuid, name, iv, content).all()

    return Response.json(writeInfo)
}
