import http from "@axel669/http/browser"

const routeProxy = (base) => new Proxy(
    function() {},
    {
        get(_, name) {
            _[name] = _[name] ?? routeProxy(`${base}/${name}`)
            return _[name]
        },
        apply(_, _this, args) {
            const options = args[0] ?? {}
            const { method = null, ...opt } = options
            if (method === null && options.data === undefined) {
                return http.get({ url: base, ...opt })
            }
            return http[method ?? "post"]({ url: base, ...opt })
        }
    }
)

export default routeProxy("api")
