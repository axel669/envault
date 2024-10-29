<script>
    import {
        Screen,
        Titlebar,
        Text,
        Button,
        Input,
        Paper,
        AsyncButton,

        Grid,
    } from "@axel669/zephyr"

    import api from "#api"

    import EditVariable from "./dashboard/edit-variable.svelte"

    export let user
    export let keys
    export let vars

    vars = vars.map(
        item => ({
            status: "saved",
            ...item,
        })
    )

    const add = () => {
        vars = [
            ...vars,
            { asuid: null, name: "", key: "", value: "", status: "new" }
        ]
    }
    const save = async () => {
        const changed = vars.filter(
            item => item.status !== "saved"
        )
        const res = await api.vault.update(changed)
        console.log(res)
        const vault = await api.vault.list()
        console.log(vault)
        vars = vault.data
    }
    const removeItem = (evt) => {
        vars = vars.filter(
            item => item !== evt.detail
        )
    }

    const addkey = async () => {
        const desc = prompt("key description", "")
        if (desc === null) {
            return
        }
        const res = await api.keys.add(desc)
        console.log(res)
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

        <AsyncButton handler={addkey} outline color="@primary">
            Add Key
        </AsyncButton>

        {#each user.apiKeys as key}
            <div>
                <div>
                    Issued: {new Date(key.keyInfo.iat * 1000).toLocaleString()}
                </div>
                {key.desc}
            </div>
        {/each}

        <Button color="@primary" on:click={() => console.log(items)}>
            View Keys
        </Button>

        <Grid cols="1fr 1fr 1fr">
            <Button on:click={add} outline color="@primary">
                Add Variable
            </Button>
            <AsyncButton handler={save} outline color="@primary">
                Save
            </AsyncButton>
        </Grid>

        <Grid cols="repeat(1, 1fr)">
            {#each vars as item (item)}
                <EditVariable bind:item on:remove={removeItem} />
            {/each}
        </Grid>

        <!-- <Button color="@primary" on:click={() => console.log(items)}>
            View
        </Button> -->
    </Paper>
</Screen>
