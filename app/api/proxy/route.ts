import { NextResponse } from "next/server"

const API_BASE = "https://nestfilm.hopto.org"

export async function GET(req: Request) {
  try {
    const incoming = new URL(req.url)
    const path = incoming.searchParams.get("path") || incoming.searchParams.get("url")
    if (!path) return new NextResponse("Missing path or url", { status: 400 })

    // build target URL
    const target = path.startsWith("http")
      ? new URL(path)
      : new URL(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`)

    // copy other query params to target (except path/url/token)
    incoming.searchParams.forEach((v, k) => {
      if (k === "path" || k === "url" || k === "token") return
      target.searchParams.set(k, v)
    })

    // resolve token from ?token= or cookie 'nest-auth-token' / legacy key
    let token = incoming.searchParams.get("token") || ""
    if (!token) {
      const cookie = req.headers.get("cookie") || ""
      const m = cookie.match(/(?:^|;\s*)nest-auth-token=([^;]+)/) || cookie.match(/(?:^|;\s*)nest_auth_token=([^;]+)/)
      if (m) token = decodeURIComponent(m[1])
    }

    // if backend expects token as query param, include it as well
    if (token) {
      target.searchParams.set("token", token)
    }

    // forward selective headers and inject Authorization if token present
    const headers: Record<string, string> = {}
    if (token) headers["Authorization"] = `Bearer ${token}`
    const range = req.headers.get("range")
    if (range) headers["Range"] = range
    const accept = req.headers.get("accept")
    if (accept) headers["Accept"] = accept
    const ua = req.headers.get("user-agent")
    if (ua) headers["User-Agent"] = ua

    // For JSON flows (e.g., requesting a link), keep redirects manual.
    // For media streaming, follow redirects server-side to avoid CORS issues in the browser.
    const redirectMode = accept && accept.includes("application/json") ? "manual" : "follow"

    const backendRes = await fetch(target.toString(), {
      method: "GET",
      headers,
      redirect: redirectMode as RequestRedirect,
    })

    const resHeaders = new Headers(backendRes.headers)
    resHeaders.set("Access-Control-Allow-Origin", "*")
    resHeaders.set("Access-Control-Expose-Headers", "Content-Range, Accept-Ranges, Content-Length, Content-Type")

    // If we kept redirects manual (JSON flow), forward them to the browser
    if (
      (redirectMode === "manual") && (
        backendRes.status === 301 ||
        backendRes.status === 302 ||
        backendRes.status === 303 ||
        backendRes.status === 307 ||
        backendRes.status === 308
      )
    ) {
      return new NextResponse(null, { status: backendRes.status, headers: resHeaders })
    }

    return new NextResponse(backendRes.body, { status: backendRes.status, headers: resHeaders })
  } catch (err) {
    return new NextResponse("Proxy error", { status: 500 })
  }
}