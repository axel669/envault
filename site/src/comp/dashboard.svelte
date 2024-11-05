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
    // export let vars

    // vars = vars.map(
    //     item => ({
    //         status: "saved",
    //         ...item,
    //     })
    // )

    // const add = () => {
    //     vars = [
    //         ...vars,
    //         { asuid: null, name: "", key: "", value: "", status: "new" }
    //     ]
    // }
    // const save = async () => {
    //     const changed = vars.filter(
    //         item => item.status !== "saved"
    //     )
    //     const res = await api.vault.update(changed)
    //     console.log(res)
    //     const vault = await api.vault.list()
    //     console.log(vault)
    //     vars = vault.data
    // }
    // const removeItem = (evt) => {
    //     vars = vars.filter(
    //         item => item !== evt.detail
    //     )
    // }

    const refreshKeys = async () => {
        const keyList = await api.keys.list()
        keys = keyList.data
    }
    let allow = ""
    let desc = ""
    $: allowed =
        allow.trim()
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(name => name !== "")
    const addkey = async () => {
        const description = desc
        if (allowed.length === 0) {
            console.log("no keys")
            return
        }
        const res = await api.keys.add({
            data: { description, allowed }
        })
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
            const res = await api.keys.remove({ data: key.key })
            if (res.ok === false) {
                return
            }
            await refreshKeys()
        }
    )
    const copyKey = handler$(
        async (key) => {
            await navigator.clipboard.writeText(key.key)
            console.log("copied!")
            // console.log(key)
        }
    )

    let vaultKey = ""
    let vault = null
    const loadVault = async () => {
        const key = await hash(vaultKey)
        const res = await api.vault.default({
            headers: {
                "vault-key": key
            },
        })
        vault = res.data
    }
    const saveVault = async () => {
        const key = await hash(vaultKey)
        console.log(
            await api.vault.default({
                data: vault,
                headers: {
                    "vault-key": key
                },
            })
        )
    }

    const hash = async (text) => {
        const bytes = await new Blob([text]).arrayBuffer()
        const hashBytes = await crypto.subtle.digest("SHA-512", bytes)
        return Array.from(
            new Uint8Array(hashBytes),
            (byte) => byte.toString(16).padStart(2, "0")
        ).join("")
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

            <Button on:click={() => console.log(vault)} slot="menu" ground>
                Debug
            </Button>
        </Titlebar>

        <Input lined label="Key Description" bind:value={desc} />
        <Input lined type="area" label="Allowed Env Vars" bind:value={allow} h="6em" />
        <AsyncButton handler={addkey} outline color="@primary" disabled={allowed.length === 0}>
            Add Key
        </AsyncButton>

        {#each keys as key}
            <div>
                <AsyncButton handler={removeKey(key)}>
                    Remove
                </AsyncButton>
                <Button on:click={copyKey(key)} color="@secondary">
                    Copy API Key
                </Button>
                <div>
                    Issued: {new Date(key.keyInfo.iat * 1000).toLocaleString()}
                </div>
                {key.desc}
            </div>
        {/each}

        <Grid cols="1fr 1fr">
            <Input label="Vault Key" bind:value={vaultKey} col="span 2" />
            <Button on:click={loadVault} outline color="@primary" disabled={vaultKey.length === 0}>
                Load Vault
            </Button>
            <!-- <AsyncButton handler={saveVault} outline color="@primary" disabled={vault === null}>
                Save Vault
            </AsyncButton> -->
            <Button on:click={saveVault} outline color="@primary" disabled={vault === null}>
                Save Vault
            </Button>
        </Grid>

        {#if vault !== null}
            <Input type="area" label="Vault" bind:value={vault} />
        {/if}

        <!-- <Button color="@primary" on:click={() => console.log(items)}>
            View
        </Button> -->
    </Paper>
</Screen>
