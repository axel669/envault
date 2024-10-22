export const onRequest = async (ctx) => {
    // ctx.request.headers.append("user", JSON.stringify(ctx.data.user))
    const url = new URL(ctx.request.url)
    url.pathname = url.pathname.slice("/dashboard".length)
    const forward = new Request(
        url,
        {
            method: ctx.request.method,
            body: ctx.request.body,
            headers: {
                ...ctx.request.headers,
                user: JSON.stringify(ctx.data.user)
            }
        }
    )
    return await ctx.env.api.fetch(forward)
}
