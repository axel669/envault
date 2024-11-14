const vscode = require("vscode")
const yaml = require("js-yaml")
const fs = require("fs-jetpack")
const path = require("node:path")
const url = require("node:url")

const hash = async (text) => {
    const bytes = await new Blob([text]).arrayBuffer()
    const hashBytes = await crypto.subtle.digest("SHA-512", bytes)
    return Array.from(
        new Uint8Array(hashBytes),
        (byte) => byte.toString(16).padStart(2, "0")
    ).join("")
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
    console.log("ENVault activated")

    context.environmentVariableCollection.persistent = false

    const command = vscode.commands.registerCommand(
        "envault.load",
        async () => {
            const [sourceFolder] = vscode.workspace.workspaceFolders ?? []

            if (sourceFolder === undefined) {
                vscode.window.showWarningMessage(
                    "Can only load environment variables in a project"
                )
                return
            }

            const root = url.fileURLToPath(sourceFolder.uri.toString())

            const target = path.resolve(root, "envault.yml")
            if (fs.exists(target) !== "file") {
                vscode.window.showWarningMessage(
                    "envault.yml does not exist, or is not a file"
                )
                return
            }

            const settings = yaml.load(
                fs.read(target)
            )
            const envKeyName = settings.apiKeyName ?? "envault_key"
            const apiURL = new URL("/api/env", settings.origin).href

            const apiKey = process.env[envKeyName]

            const vaults = Object.entries(settings.vaults)

            vscode.window.showInformationMessage(
                "Loading env vars..."
            )
            let envVars = {}
            for (const [vaultName, vaultInfo] of vaults) {
                const vaultKey = process.env[vaultInfo.vaultKeyName]
                const key = await hash(vaultKey)
                const res = await fetch(
                    `${apiURL}/${vaultName}`,
                    {
                        method: "POST",
                        headers: {
                            "api-key": apiKey,
                        },
                        body: JSON.stringify({
                            vaultKey: key,
                            keys: vaultInfo.keys,
                        }),
                    }
                )
                const keyPart = await res.json()
                envVars = { ...envVars, ...keyPart }
            }

            for (const [key, value] of Object.entries(envVars)) {
                context.environmentVariableCollection.append(key, value)
            }
            vscode.window.showInformationMessage(
                [
                    `Environment variables added: ${Object.keys(envVars).join(", ")}.`,
                    "These will only apply to terminals opened after this was run.",
                ].join("\n")
            )
        }
    )

    context.subscriptions.push(command);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
