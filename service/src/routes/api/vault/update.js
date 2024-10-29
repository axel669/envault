import asuid from "@axel669/asuid"

const batch = (db, batch) => {
    if (batch.length === 0) {
        return null
    }
    return db.batch(batch)
}
export const $post = async (c) => {
    // console.log(await c.req.json())
    const keys = await c.req.json()
    const user = c.get("user")

    console.log(user)

    const existing = keys.filter(key => key.status === "changed")
    const newkeys = keys.filter(key => key.status === "new")
    const deletedkeys = keys.filter(key => key.status === "deleted")

    const update = c.env.storage.prepare(
        "update vault set name = ?3, key = ?4, value = ?5 where users_asuid = ?1 and asuid = ?2"
    )
    const create = c.env.storage.prepare(
        "insert into vault(users_asuid, asuid, name, key, value) values(?1, ?2, ?3, ?4, ?5)"
    )
    const remove = c.env.storage.prepare(
        "delete from vault where users_asuid = ?1 and asuid = ?2"
    )
    const updateResults = await batch(
        c.env.storage,
        existing.map(
            key => update.bind(user.asuid, key.asuid, key.name, key.key, key.value)
        )
    )
    const newResults = await batch(
        c.env.storage,
        newkeys.map(
            key => create.bind(user.asuid, asuid(), key.name, key.key, key.value)
        )
    )
    const removedResults = await batch(
        c.env.storage,
        deletedkeys.map(
            key => remove.bind(user.asuid, key.asuid)
        )
    )

    return c.json({ updateResults, newResults, removedResults })
}
