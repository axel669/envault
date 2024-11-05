/**
@param {BlobPart} key
@return {Promise<CryptoKey>}
*/
const genkey = async (key) => crypto.subtle.importKey(
    "raw",
    await new Blob([key]).arrayBuffer(),
    "AES-CTR",
    false,
    ["encrypt", "decrypt"]
)

/**
@param {BlobPart} iv
@return {{
    name: string
    counter: ArrayBuffer
    length: int
}}
*/
const genopt = async (iv) => ({
    name: "AES-CTR",
    counter: await new Blob([iv]).arrayBuffer(),
    length: 64
})

export default {
    /**
    @param {BlobPart} data
    @param {BlobPart} key
    @param {BlobPart} iv
    @return {Promise<ArrayBuffer>}
    */
    encrypt: async (data, key, iv) => crypto.subtle.encrypt(
        await genopt(iv),
        await genkey(key),
        data
    ),
    /**
    @param {BufferSource} data
    @param {BlobPart} key
    @param {BlobPart} iv
    @return {Promise<ArrayBuffer>}
    */
    decrypt: async (data, key, iv) => crypto.subtle.decrypt(
        await genopt(iv),
        await genkey(key),
        data
    ),
}
