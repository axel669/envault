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

        handler$,
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

    const refreshKeys = async () => {
        const keyList = await api.keys.list()
        keys = keyList.data
    }
    let allow = ""
    let desc = ""
    const addkey = async () => {
        const description = desc
        const allowed = allow.trim().split(/\r?\n/).map(line => line.trim())
        const res = await api.keys.add({description, allowed})
        console.log(res)
        if (res.data !== true) {
            return
        }
        desc = ""
        allow = ""
        await refreshKeys()
    }

    const removeKey = handler$(
        async (key) => {
            const res = await api.keys.remove(key.key)
            if (res.ok === false) {
                return
            }
            await refreshKeys()
        }
    )
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

            <Button on:click={() => console.log(user)} slot="menu" ground>
                Debug
            </Button>
        </Titlebar>

        <Input lined label="Key Description" bind:value={desc} />
        <Input lined type="area" label="Allowed Env Vars" bind:value={allow} h="6em" />
        <AsyncButton handler={addkey} outline color="@primary">
            Add Key
        </AsyncButton>

        {#each keys as key}
            <div>
                <AsyncButton handler={removeKey(key)}>
                    Remove
                </AsyncButton>
                <div>
                    Issued: {new Date(key.keyInfo.iat * 1000).toLocaleString()}
                </div>
                {key.desc}
            </div>
        {/each}

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
