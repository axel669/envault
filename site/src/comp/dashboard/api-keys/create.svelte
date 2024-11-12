<script>
    import {
        AsyncButton,
        Button,
        ElementToast,

        Flex,
    } from "@axel669/zephyr"
    import { onMount } from "svelte"
    import { writable } from "svelte/store"
    import yaml from "js-yaml"

    export let manager

    const keyBase = `description:\nallow:\n  vault-name:\n  - "*"`

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
        editor.session.setValue(keyBase)
    })
    const add = async (show) => {
        try {
            const { description, allow } = yaml.load(editor.session.getValue())

            const type = typeof allow
            if (type !== "object") {
                show(
                    5000,
                    {
                        message: "allow must be an object of string->string[]",
                        color: "@danger"
                    }
                )
                return
            }
            const keys = Object.keys(allow)
            if (keys.length === 0) {
                show(
                    5000,
                    {
                        message: "Must include at least one vault",
                        color: "@danger"
                    }
                )
                return
            }

            const success = await manager.addKey({ description, allow })
            if (success === false) {
                show(
                    5000,
                    {
                        message: "Failed to add API Key",
                        color: "@danger"
                    }
                )
                return
            }
            show(
                5000,
                {
                    message: "API Key Added",
                    color: "@secondary"
                }
            )
            editor.session.setValue(keyBase)
        }
        catch (err) {
            console.log(err)
        }
    }
</script>

<Flex>
    <ElementToast position="bottom" let:show>
        <AsyncButton handler={() => add(show)} fill color="@primary">
            Add Key
        </AsyncButton>
    </ElementToast>
    <div ws-x="[h 240px]" bind:this={editorDiv} />
</Flex>
