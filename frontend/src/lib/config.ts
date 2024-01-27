interface PublicEnv {
    PUBLIC_CHAIN_ID: string
}

declare global {
    var __PUBLIC_ENV__: PublicEnv
}

export const getConfig = () => {
    const config = globalThis.__PUBLIC_ENV__
    return { 
        chainId: config.PUBLIC_CHAIN_ID
    }
}