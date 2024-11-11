<script>
    export let component
    $: list = Object.entries($$restProps)
    $: wait = Promise.all(
        list.map(
            async pair => [pair[0], await pair[1]]
        )
    )
    // $: console.log(list)
</script>

{#await wait}
    <slot name="loading">
        Loading
    </slot>
{:then entries}
    <slot>
        <svelte:component this={component} {...Object.fromEntries(entries)} />
    </slot>
{:catch error}
    <slot name="error">
        {error}
    </slot>
{/await}
