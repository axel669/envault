<script>
    import {
        AsyncButton,
        Button,
        Input,

        handler$,
    } from "@axel669/zephyr"

    import api from "#api"

    export let keys

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
</script>

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
