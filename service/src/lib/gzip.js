/**
Combine multiple Uint8Arrays into one.
@param {ReadonlyArray<Uint8Array>} chunks
@returns {Promise<Uint8Array>}
*/
async function hachiConcat(chunks) {
    const blob = new Blob(chunks)
    const buffer = await blob.arrayBuffer()
    return new Uint8Array(buffer)
}

const decompression = {
    /**
    @param {Uint8Array} bytes
    @return {string}
    */
    string: (bytes) => new TextDecoder().decode(bytes),
    /**
    @param {Uint8Array} bytes
    @return {Uint8Array}
    */
    raw: (bytes) => bytes,
}

/**
Compress a string (or other thing that blobs can load from)
@param {
    string
    | ArrayBuffer
    | DataView
    | Blob
    | Uint8Array
    | Uint16Array
    | Uint32Array
    | BigUint64Array
} source
@returns {Promise<Uint8Array>}
*/
export const compress = async (source) => {
    const stream = new Blob([source]).stream()

    const gzipStream = stream.pipeThrough(
        new CompressionStream("gzip")
    )

    const chunks = []
    for await (const chunk of gzipStream) {
        chunks.push(chunk)
    }
    return await hachiConcat(chunks)
}

/**
@param {Uint8Array} source
@returns {Promise<string>}
*/
const decompr = async (source, convert = decompression.string) => {
    const stream = new Blob([source]).stream()

    const gunzipStream = stream.pipeThrough(
        new DecompressionStream("gzip")
    )

    const chunks = []
    for await (const chunk of gunzipStream) {
        chunks.push(chunk)
    }
    const bytes = await hachiConcat(chunks)

    return await convert(bytes)
}

export const decompress = {
    /**
    Decompresses data into a string.
    @param {Uint8Array} source
    @returns {Promise<string>}
    */
    string: (source) => decompr(source, decompression.string),
    /**
    Decompresses data without decoding the format at all.
    @param {Uint8Array} source
    @returns {Promise<Uint8Array>}
    */
    raw: (source) => decompr(source, decompression.raw),
}
