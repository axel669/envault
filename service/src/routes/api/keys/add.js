import jwt from "@tsndr/cloudflare-worker-jwt"
import asuid from "@axel669/asuid"

export const $post = async (c) => {
    const user = c.get("user")
    const desc = await c.req.json()

    const keyID = asuid()
    const key = await jwt.sign(
        { userID: user.asuid, keyID, allowed: ["*"] },
        c.env.jwt_secret
    )

    await c.env.storage.prepare(`
        insert into
            api_keys(users_asuid, key, desc)
        values
            (?1, ?2, ?3)
    `).bind(user.asuid, key, desc).all()
    return c.json(true)
}
