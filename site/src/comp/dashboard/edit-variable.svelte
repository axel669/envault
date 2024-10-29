<script>
    import {
        Button,
        Icon,
        Input,
        Paper,
        Text,

        Grid,
    } from "@axel669/zephyr"

    import { createEventDispatcher } from "svelte"

    export let item

    const fire = createEventDispatcher()
    const {name, key, value} = item
    const calcStatus = (item) => {
        if (item.asuid === null) {
            return "new"
        }
        if (item.status === "deleted") {
            return item.status
        }
        const changed = (
            name !== item.name
            || key !== item.key
            || value !== item.value
        )
        if (changed === true) {
            return "changed"
        }
        return "saved"
    }
    const toggle = () => {
        if (item.status === "new") {
            return fire("remove", item)
        }
        if (item.status !== "deleted") {
            item.status = "deleted"
            return
        }
        item.status = ""
        item.status = calcStatus(item)
    }
    $: item.status = calcStatus(item)
    $: color = (item.status === "saved") ? "@secondary" : "@accent"
    $: disabled = (item.status === "deleted")
</script>

<Grid cols="repeat(6, 1fr)" b.l="4px solid {color}">
    <Input flat bind:value={item.name} {disabled} col="span 5">
        <Text adorn slot="start" h="100%">
            Name:
        </Text>
    </Input>
    <Button on:click={toggle} color="@danger" ground fill>
        {#if item.status !== "deleted"}
            <Icon name="trash" />
        {:else}
            Keep
        {/if}
    </Button>
    <Input lined label="Key" bind:value={item.key} {disabled} col="span 2" />
    <Input lined label="Value" bind:value={item.value} {disabled} col="span 4" />
</Grid>
