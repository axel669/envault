<script>
    import {
        AsyncButton,
        Button,
        Input,
        Paper,
        Text,
        EntryButton,
        Icon,

        Modal,
        Confirm,

        Grid,
        Flex,

        handler$,
    } from "@axel669/zephyr"

    import Suspend from "#comp/suspend"
    import VaultEditor from "#comp/dashboard/vaults/editor"

    import api from "#api"

    export let vaults

    const hash = async (text) => {
        const bytes = await new Blob([text]).arrayBuffer()
        const hashBytes = await crypto.subtle.digest("SHA-512", bytes)
        return Array.from(
            new Uint8Array(hashBytes),
            (byte) => byte.toString(16).padStart(2, "0")
        ).join("")
    }

    let currentVault = null
    const save = async (vault) => {
        const vaultKey = await hash(vault.key)
        const res = await api.vault[vault.name.trim()]({
            data: vault.content,
            headers: {
                "vault-key": vaultKey,
            }
        })
        if (vault.new === true) {
            const res = await api.vaults()
            vaults = res.data
            return
        }
    }
    const createVault = () => ({
        vault: {
            new: true,
            name: "",
            key: "",
            content: "",
            save,
        }
    })
    const openVault = handler$(
        (vault) => ({
            vault: {
                new: false,
                name: vault.name,
                content: null,
                key: "",
                save,
            }
        })
    )
    let confirmModal = null
    const removeVault = handler$(
        async (vault) => {
            const confirm = await confirmModal.show({
                title: "Delete Vault",
                message: `Delete ${vault.name}?`,
                okText: "Continue"
            })
            if (confirm !== true) {
                return
            }
            await api.vault[vault.name]({ method: "delete" })
            const res = await api.vaults()
            vaults = res.data
        }
    )
</script>

<Modal component={Confirm} bind:this={confirmModal} />
<Grid rows="min-content 1fr" p="0px" h="100%">
    <EntryButton props={createVault} component={VaultEditor} color="@secondary"
    outline>
        + Create Vault
    </EntryButton>

    <Flex p="0px">
        {#each vaults as vault}
            <Paper card color="@primary" layout={Grid}
            l-cols="48px 1fr 48px" l-p="2px">
                <AsyncButton handler={removeVault(vault)} color="@danger" ground>
                    <Icon name="trash" />
                </AsyncButton>

                <Text>{vault.name}</Text>

                <EntryButton props={openVault(vault)} component={VaultEditor}
                fill color="@secondary" ground>
                    <Icon name="pencil-square" />
                </EntryButton>
            </Paper>
        {:else}
            <Text>
                No vaults created
            </Text>
        {/each}
    </Flex>
</Grid>
