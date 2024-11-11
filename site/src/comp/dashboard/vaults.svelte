<script>
    import {
        Button,
        Input,
        Paper,
        Text,

        Grid,
        Flex,

        handler$,
    } from "@axel669/zephyr"

    import Suspend from "#comp/suspend"
    import VaultEditor from "#comp/dashboard/vaults/editor"

    import api from "#api"

    export let vaults

    vaults.forEach(
        vault => vault.key = ""
    )
    const hash = async (text) => {
        const bytes = await new Blob([text]).arrayBuffer()
        const hashBytes = await crypto.subtle.digest("SHA-512", bytes)
        return Array.from(
            new Uint8Array(hashBytes),
            (byte) => byte.toString(16).padStart(2, "0")
        ).join("")
    }

    let currentVault = null
    const loadVault = async (vault) => {
        const vaultKey = await hash(vault.key)
        const vaultInfo = await api.vault[vault.name]({
            headers: {
                "vault-key": vaultKey,
            }
        })
        const self = {
            content: vaultInfo.data,
            async save() {
                const res = await api.vault[vault.name]({
                    data: self.content,
                    headers: {
                        "vault-key": vaultKey,
                    }
                })
                console.log(res)
            }
        }
        return self
    }
</script>

<Grid rows="1fr 1fr" p="0px" gap="0px" h="100%">
    <Flex p="0px">
        {#each vaults as vault}
            <Paper card color="@primary">
                <Text title>{vault.name}</Text>
                <Input bind:value={vault.key}>
                    <Text adorn slot="start" t.ws="pre" flex fl-center h="100%">
                        Vault Key
                    </Text>

                    <Button slot="end" fill color="@secondary" disabled={vault.key.trim() === ""}
                    on:click={() => currentVault = loadVault(vault)}>
                        Load
                    </Button>
                </Input>
            </Paper>
        {/each}
    </Flex>
    {#if currentVault !== null}
        <Suspend component={VaultEditor} vault={currentVault} />
    {/if}
</Grid>
