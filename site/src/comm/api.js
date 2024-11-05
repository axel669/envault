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
            if (options.data === undefined) {
                return http.get({ url: base, ...options })
            }
            return http.post({ url: base, ...options })
        }
    }
)

export default routeProxy("api")
