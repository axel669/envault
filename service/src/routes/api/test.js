import jwt from "@tsndr/cloudflare-worker-jwt"
import cookie from "cookie"

export const $get = async (c) => {
    const cookies = cookie.parse(
        c.req.header("cookie")
    )
    const user = await jwt.decode(cookies.CF_Authorization)
    return c.json({
        email: user.payload.email
    })
}
