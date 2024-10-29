export const $get = async (c) => {
    const user = c.get("user")
    const { results } = await c.env.storage.prepare(
        "select * from vault where users_asuid = ?1"
    ).bind(user.asuid).all()
    for (const item of results) {
        item.status = "saved"
    }
    return c.json(results)
}
