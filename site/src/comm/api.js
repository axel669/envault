import http from "@axel669/http/browser"

const routeProxy = (base) => new Proxy(
    function() {},
    {
        get(_, name) {
            _[name] = _[name] ?? routeProxy(`${base}/${name}`)
            return _[name]
        },
        apply(_, _this, args) {
            if (args.length === 0) {
                return http.get(base)
            }
            return http.post({ url: base, data: args[0] })
        }
    }
)

export default routeProxy("api")
// export default {
//     user: () => http.get("api/user"),
//     vault: {
//         update: (items) => http.post({
//             url: "api/vault/update",
//             data: items,
//         }),
//         add: (desc) => http.post({
//             url: "api/keys/add",
//             data: desc
//         })
//     }
// }
