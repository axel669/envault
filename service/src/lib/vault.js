import aes from "#lib/aes"

export const countVault = (storage, asuid, vaultID) => {
    const datestring = new Date().toISOString().slice(0, 10)
    return storage.prepare(`
        insert into metrics(users_asuid, vault_id, datestring, count)
        values(?3, ?1, ?2, 1)
        on conflict do
            update set count = count + 1
    `).bind(vaultID, datestring, asuid).all()
}

export const loadVault = async (user, storage, name, key) => {
    const { results } = await storage.prepare(`
        select *
        from vault
        where
            users_asuid = ?2
            and name = ?1
    `).bind(name, user.asuid).all()

    if (results.length === 0) {
        return null
        // return c.json({ message: "No vault found" }, 404)
    }

    await countVault(storage, user.asuid, results[0].id)

    const iv = new Uint8Array(results[0].iv)
    const keyBytes = new Uint8Array(
        key.match(/../g).map(hex => parseInt(hex, 16))
    )
    const key1 = keyBytes.slice(0, 32)
    const key2 = keyBytes.slice(32)

    return new TextDecoder().decode(
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
}
