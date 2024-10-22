export const onRequest = async (ctx) => {
    ctx.request.headers.append("user", JSON.stringify(null))
    return await ctx.env.api.fetch(ctx.request)
}
