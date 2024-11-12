import jwt from "@tsndr/cloudflare-worker-jwt"
import asuid from "@axel669/asuid"

const verify = async (token, secret) => {
    try {
        const valid = await jwt.verify(token, secret)
        return valid
    }
    catch (err) {
        console.error(err)
        return false
    }
}
export const $any = async (c, next) => {
    const user = JSON.parse(
        c.req.header("user")
    )
    const apikey = c.req.header("api-key") ?? null

    if (user === null && apikey === null) {
        return c.json(null)
    }

    if (apikey !== null) {
        const valid = await verify(apikey, c.env.jwt_secret)
        if (valid === false) {
            c.status(401)
            return c.json({
                error: "Invalid API key"
            })
        }
        const info = jwt.decode(apikey).payload
        const keyInfo = await c.env.storage.prepare(`
            select * from api_keys where key = ?1 and users_asuid = ?2
        `).bind(apikey, info.userID).all()

        if (keyInfo.results.length === 0) {
            c.status(401)
            return c.json({
                error: "Invalid API key"
            })
        }

        c.set("user", { asuid: info.userID, allow: info.allow })
        return await next()
    }

    const inserted = await c.env.storage.prepare(`
        insert or ignore into users(email, asuid) values(?1, ?2)
    `).bind(user.email, asuid()).all()
    const userInfo = await c.env.storage.prepare(`
        select * from users where email = ?1
    `).bind(user.email).all()
    user.asuid = userInfo.results[0].asuid
    c.set("user", user)

    return await next()
}
