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

    export let user

    let items = user.items.map(
        item => ({ ...item })
    )

    const add = () => {
        items = [
            ...items,
            { asuid: null, name: "", key: "", value: "" }
        ]
    }
    const save = async () => {
        const res = await api.vault.update(items)
        console.log(res)
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

        <Grid cols="1fr 1fr 2fr">
            {#each items as item}
                <Input lined label="Name" bind:value={item.name} />
                <Input lined label="Key" bind:value={item.key} />
                <Input lined label="Value" bind:value={item.value} />
            {/each}
        </Grid>

        <Button color="@primary" on:click={() => console.log(items)}>
            View
        </Button>
    </Paper>
</Screen>
