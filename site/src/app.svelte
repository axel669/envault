<script>
    import {
        Text,
        wsx
    } from "@axel669/zephyr"

    import api from "#api"

    import Dashboard from "./comp/dashboard.svelte"
    const user = api.user()
    // window.http = http
</script>

<svelte:body use:wsx={{ "@@theme": "tron", "@@app": true }} />

{#await user}
    <Text>
        Loading
    </Text>
{:then user}
    <Dashboard user={user.data} />
{/await}
