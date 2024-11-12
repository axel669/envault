<script>
    import {
        AsyncButton,
        Button,
        Icon,
        Paper,
        Modal,
        Confirm,

        ElementToast,

        Flex,
        Grid,

        handler$,
    } from "@axel669/zephyr"

    export let keys
    export let manager

    const copyKey = handler$(
        async (key, show) => {
            await navigator.clipboard.writeText(key.key)
            show(3000, { message: "Copied!", color: "@secondary" })
            console.log("copied")
        }
    )
    let confirmModal = null
    const remove = handler$(
        async (key) => {
            const confirm = await confirmModal.show({
                title: "Remove API Key?",
                message: `Description: ${key.desc}`
            })

            if (confirm !== true) {
                return
            }

            await manager.removeKey(key)
        }
    )
</script>

<Modal component={Confirm} bind:this={confirmModal} />
<Flex>
    {#each keys as key}
        <Paper layout={Grid} l-cols="48px 1fr 48px" l-over="visible">
            <AsyncButton handler={remove(key)} color="@danger" ground>
                <Icon name="trash" />
            </AsyncButton>

            <div>
                <div>
                    Issued: {new Date(key.keyInfo.iat * 1000).toLocaleString()}
                </div>
                {key.desc}
            </div>
            <ElementToast let:show
            flex="row-reverse" -x="100%" y="50%" tf="translateY(-50%)"
            x={null} -y={null}>
                <Button on:click={copyKey(key, show)} color="@secondary" ground>
                    <Icon name="copy" />
                </Button>
            </ElementToast>
        </Paper>
    {/each}
</Flex>
