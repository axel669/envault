<script>
    import {
        Text,
        HexagonSpinner as Spinner,

        wsx
    } from "@axel669/zephyr"

    import api from "#api"

    import Suspend from "./comp/suspend.svelte"
    import Dashboard from "./comp/dashboard.svelte"
    // window.http = http
    const load = async () => {
        await scriptLoad
        const userInfo = await api.user()
        return userInfo.data
    }
</script>

<svelte:body use:wsx={{ "@@theme": "dark", "@@app": true }} />

<Suspend component={Dashboard} user={load()}>
    <div slot="loading" ws-x="[w 100%] [h 100%] [flex] [fl-center]">
        <Spinner size="200px" />
    </div>
</Suspend>

<!-- {#await loadUser()}
    <Text>
        Loading
    </Text>
{:then [user, keys, vars]}
    <Dashboard {user} {keys} />
{/await} -->
