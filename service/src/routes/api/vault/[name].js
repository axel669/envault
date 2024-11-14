import aes from "#lib/aes"
import { countVault, loadVault } from "#lib/vault"

export const $get = async (c) => {
    const { name } = c.req.param()
    const user = c.get("user")
    const key = c.req.header()["vault-key"]

    if (user.allow !== undefined) {
        return c.json(
            { message: "API Key cannot access vault" },
            401
        )
    }

    const vault = await loadVault(user, c.env.storage, name, key)

    if (vault === null) {
        return c.json({ message: "No vault found" }, 404)
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
