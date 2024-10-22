export const $get = async (c) => {
    const user = c.get("user")
    const { results } = await c.env.storage.prepare(
        "select * from api_keys"
    ).all()
    return c.json(
        results.map(res => ({
            ...res,
            allowed: JSON.parse(res.allowed)
        }))
    )
}
