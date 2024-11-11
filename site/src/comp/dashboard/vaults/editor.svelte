<script>
    import {
        Button,
        Grid,
    } from "@axel669/zephyr"

    import { onMount } from "svelte"

    export let vault

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
</script>

<Grid rows="min-content 1fr" p="0px" gap="0px">
    <Button on:click={vault.save}>
        Save
    </Button>
    <div ws-x="[h 100%]" bind:this={editorDiv} />
</Grid>
