export async function fetchIpfsJson(ipfsUri: string) {
    if (!ipfsUri) return null;

    const url = ipfsUri.replace("ipfs://", "https://ipfs.io/ipfs/");

    const res = await fetch(url);
    if (!res.ok) return null;

    return await res.json();
}
