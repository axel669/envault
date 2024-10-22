import { githubAuth } from "@axel669/acheron"

export const onRequest = async (context) => {
    const { next } = context
    const result = await githubAuth(context, ["read:user", "user:email"])

    if (result.res !== undefined) {
        return result.res
    }

    context.data.user = result.user
    return await next()
}
