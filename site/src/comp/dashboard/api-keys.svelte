<script>
    import {
        AsyncButton,
        Button,
        Input,
        Tabs,

        Grid,

        handler$,
    } from "@axel669/zephyr"

    import api from "#api"

    import KeyManager from "#comp/dashboard/api-keys/manager"
    import KeyCreate from "#comp/dashboard/api-keys/create"

    export let keys

    const refreshKeys = async () => {
        const keyList = await api.keys.list()
        keys = keyList.data
    }

    const addKey = async (data) => {
        const res = await api.keys.add({ data })
        console.log(res)
        if (res.data !== true) {
            return false
        }
        await refreshKeys()
        return true
    }

    const removeKey = async (key) => {
        const res = await api.keys.remove({ data: key.key })
        if (res.ok === false) {
            return
        }
        await refreshKeys()
    }

    const manager = { removeKey, addKey }
    let currentTab = "add"
    const options = [
        { label: "Manage Keys", value: "list" },
        { label: "Add Key", value: "add" },
    ]

    const subscreen = {
        list: KeyManager,
        add: KeyCreate,
    }
</script>

<Grid rows="min-content 1fr" p="0px" gap="0px" h="100%">
    <Tabs {options} bind:value={currentTab} fill color="@secondary" />

    <svelte:component this={subscreen[currentTab]} {keys} {manager} />
</Grid>
