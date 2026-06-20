export const DEFAULT_ACTION_PASSWORD = "techops2026"

type PasswordResponse = {
  password?: unknown
}

function readPasswordFromPayload(payload: unknown) {
  if (typeof payload === "string") {
    return payload.trim()
  }

  if (
    payload &&
    typeof payload === "object" &&
    "password" in payload &&
    typeof (payload as PasswordResponse).password === "string"
  ) {
    return (payload as { password: string }).password.trim()
  }

  return ""
}

export async function fetchActionPassword(address?: string) {
  const passwordUrl = address ?? process.env.NEXT_PUBLIC_PASSWORD_URL

  if (!passwordUrl) {
    return {
      password: DEFAULT_ACTION_PASSWORD,
      source: "fallback" as const,
    }
  }

  try {
    const response = await fetch(passwordUrl, {
      cache: "no-store",
      headers: {
        accept: "application/json, text/plain;q=0.9",
      },
    })

    if (!response.ok) {
      throw new Error(`Password request failed: ${response.status}`)
    }

    const contentType = response.headers.get("content-type") ?? ""
    const payload = contentType.includes("application/json")
      ? await response.json()
      : await response.text()

    const password = readPasswordFromPayload(payload)

    return {
      password: password || DEFAULT_ACTION_PASSWORD,
      source: password ? ("remote" as const) : ("fallback" as const),
    }
  } catch {
    return {
      password: DEFAULT_ACTION_PASSWORD,
      source: "fallback" as const,
    }
  }
}
