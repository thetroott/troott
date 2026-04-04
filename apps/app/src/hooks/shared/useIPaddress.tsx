import type { IResult } from "@/utils/interfaces.util"

const getIpAddress = async (): Promise<IResult> => {
  const result: IResult = {
    error: false,
    message: "",
    code: 200,
    data: {},
  }

  try {
    const response = await fetch("https://www.cloudflare.com/cdn-cgi/trace")

    if (!response.ok) {
      result.error = true
      result.message = "Failed to fetch IP data"
      result.code = response.status
      return result
    }

    const raw = await response.text()

    const parsed = raw
      .trim()
      .split("\n")
      .reduce((acc, pair) => {
        const [key, value] = pair.split("=")
        acc[key] = value
        return acc
      }, {} as Record<string, string>)

    result.data = parsed
  } catch (err: any) {
    result.error = true
    result.message = err.message || "An error occurred"
    result.code = 500
  }

  return result
}

export default getIpAddress