<script>
    import {
        Link,
        Paper,
        Route,
        Screen,
        Text,
        Titlebar,

        Grid,
    } from "@axel669/zephyr"

    import { onMount } from "svelte"

    import api from "#api"

    import Suspend from "./suspend.svelte"
    import APIKeys from "./dashboard/api-keys.svelte"
    import Vaults from "./dashboard/vaults.svelte"

    export let user

    const loadKeys = async () => {
        const res = await api.keys.list()
        return res.data
    }
    const loadVaults = async () => {
        const res = await api.vaults()
        return res.data
    }
</script>

<Screen>
    <Paper card r="0px" color="@primary">
        <Titlebar fill color="@primary" slot="header">
            <Text title slot="title">
                ENVault
                <Text subtitle>
                    User: {user.email}
                </Text>
            </Text>
        </Titlebar>

        <Route exact>
            <Grid cols="1fr 1fr">
                <Link href="#/api-keys" button outline>
                    Manage API Keys
                </Link>
                <Link href="#/vaults" button outline>
                    View Vaults
                </Link>
            </Grid>
        </Route>

        <Route path="api-keys">
            <Suspend component={APIKeys} keys={loadKeys()} />
        </Route>
        <Route path="vaults">
            <Suspend component={Vaults} vaults={loadVaults()} />
        </Route>
    </Paper>
</Screen>
