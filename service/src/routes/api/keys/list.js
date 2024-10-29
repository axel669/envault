import jwt from "@tsndr/cloudflare-worker-jwt"

export const $get = async (c) => {
    const user = c.get("user")
    const apiKeys = await c.env.storage.prepare(
        "select * from api_keys where api_keys.users_asuid = ?1"
    ).bind(user.asuid).all()

    for (const res of apiKeys.results) {
        res.keyInfo = jwt.decode(res.key).payload
    }
    return c.json(apiKeys.results)
}
