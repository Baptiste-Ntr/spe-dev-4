export const fetcher = async (url: string, options: RequestInit = {}) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${url}`, options)
    if (!res.ok) {
        const errorRes = await res.json()
        const error = new Error(errorRes.message ?? res.statusText)
        throw error
    }
    return res.json()
}