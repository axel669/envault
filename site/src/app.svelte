<script>
    import {
        Text,
        wsx
    } from "@axel669/zephyr"

    import api from "#api"

    import Dashboard from "./comp/dashboard.svelte"
    // const user = api.user()
    const loadUser = async () => {
        const [
            user,
            keys,
            vars,
        ] = await Promise.all([
            api.user(),
            api.keys.list(),
            api.vault.list(),
        ])

        return [user.data, keys.data, vars.data]
    }
    // window.http = http
</script>

<svelte:body use:wsx={{ "@@theme": "tron", "@@app": true }} />

{#await loadUser()}
    <Text>
        Loading
    </Text>
{:then [user, keys, vars]}
    <Dashboard {user} {keys} {vars} />
{/await}
