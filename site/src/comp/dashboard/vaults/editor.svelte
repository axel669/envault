<script>
    import {
        AsyncButton,
        Button,
        Input,
        Paper,
        Screen,
        Text,
        Titlebar,

        Grid,
    } from "@axel669/zephyr"

    import { onMount } from "svelte"

    import api from "#api"

    export let vault
    export let close

    const hash = async (text) => {
        const bytes = await new Blob([text]).arrayBuffer()
        const hashBytes = await crypto.subtle.digest("SHA-512", bytes)
        return Array.from(
            new Uint8Array(hashBytes),
            (byte) => byte.toString(16).padStart(2, "0")
        ).join("")
    }

    const cancel = () => close(null)
    const open = async () => {
        const vaultKey = await hash(vault.key)
        const vaultInfo = await api.vault[vault.name]({
            headers: {
                "vault-key": vaultKey,
            }
        })
        vault.content = vaultInfo.data
        editor.session.setValue(vault.content)
    }
    const save = async () => {
        await vault.save(vault)
        if (vault.new === true) {
            close(true)
            return
        }
    }

    let editorDiv = null
    let editor = null
    onMount(() => {
        editor = ace.edit(editorDiv)
        editor.setOptions({
            theme: "ace/theme/twilight",
            fontSize: 14,
        })
        editor.session.setOptions({
            useSoftTabs: true,
            tabSize: 2,
            mode: "ace/mode/yaml"
        })
        editor.session.setValue(vault.content)
        editor.on(
            "change",
            () => vault.content = editor.session.getValue()
        )
    })

    $: display = vault.content === null ? "none" : "block"
</script>

<Screen bg.c="rgba(0, 0, 0, 0.42)">
    <Paper r="0px" layout={Grid}
    l-rows="min-content min-content min-content 1fr">
        <Titlebar slot="header" fill color="@primary">
            <Text slot="title" title>
                {vault.new ? "Create" : "Edit"} Vault
            </Text>

            <Button ground on:click={cancel} slot="action">
                {#if vault.new === true}
                    Cancel
                {:else}
                    Close
                {/if}
            </Button>
        </Titlebar>

        {#if vault.new === true}
            <Input label="Vault Name" bind:value={vault.name} />
        {:else}
            <Text title p="8px">
                Name: {vault.name}
            </Text>
        {/if}

        <Input label="Vault Key" bind:value={vault.key} />

        {#if vault.content === null}
            <AsyncButton handler={open} fill color="@primary"
            disabled={vault.key.length === 0}>
                Open Vault
            </AsyncButton>
        {:else}
            <AsyncButton handler={save} fill color="@secondary"
            disabled={vault.key.length === 0 || vault.name.trim().length === 0}>
                Save Vault
            </AsyncButton>
        {/if}
        <div ws-x="[h 100%] [disp {display}]" bind:this={editorDiv} />
    </Paper>
</Screen>
