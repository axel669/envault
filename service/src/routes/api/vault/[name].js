import aes from "#lib/aes"
import yaml from "js-yaml"
// import * as gzip from "#lib/gzip"

const countVault = (storage, asuid, vaultID) => {
    const datestring = new Date().toISOString().slice(0, 10)
    return storage.prepare(`
        insert into metrics(users_asuid, vault_id, datestring, count)
        values(?3, ?1, ?2, 1)
        on conflict do
            update set count = count + 1
    `).bind(vaultID, datestring, asuid).all()
}

export const $get = async (c) => {
    const { name } = c.req.param()
    const user = c.get("user")
    const key = c.req.header()["vault-key"]
    const reqKeys = c.req.query().keys

    const keyList = reqKeys?.split(",") ?? []
    const allow = user.allow ?? { [name]: ["*"] }
    const allowed = allow[name]

    if (allowed === undefined) {
        return c.json(
            { message: "API Key cannot access vault" },
            401
        )
    }

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

    const { results } = await c.env.storage.prepare(`
        select *
        from vault
        where
            users_asuid = ?2
            and name = ?1
    `).bind(name, user.asuid).all()

    if (results.length === 0) {
        return c.json({ message: "No vault found" }, 404)
    }

    await countVault(c.env.storage, user.asuid, results[0].id)

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
        const entries = Object.entries(
            yaml.load(vault)
        )
        return Response.json(
            entries.reduce(
                (env, [key, value]) => {
                    if (keyList.includes(key) === true) {
                        env[key] = value
                        return env
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
    await countVault(
        c.env.storage,
        user.asuid,
        results[0]?.id ?? writeInfo.meta.last_row_id
    )

    return Response.json(writeInfo)
}

export const $delete = async (c) => {
    const { name } = c.req.param()
    const user = c.get("user")

    if (user.allow !== undefined) {
        return c.json({ message: "Can only delete vaults from the UI" }, 403)
    }

    const info = await c.env.storage.prepare(`
        delete from vault
        where
            users_asuid = ?2
            and name = ?1
    `).bind(name, user.asuid).all()

    return c.json(info)
}
