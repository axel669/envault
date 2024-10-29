export const $post = async (c) => {
    const user = c.get("user")
    const key = await c.req.json()

    const results = await c.env.storage.prepare(`
        delete from api_keys
        where
            users_asuid = ?1
            and key = ?2
    `).bind(user.asuid, key).all()

    return c.json(results)
}
