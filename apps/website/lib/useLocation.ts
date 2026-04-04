import { IResult, IUserLocation } from "@/utils/interface.utils"

export const getUserLocation = async (): Promise<IResult> => {
  const result: IResult = {
    error: false,
    message: "",
    code: 200,
    data: {},
  }

  try {
    const res = await fetch("https://ipapi.co/json")

    if (!res.ok) {
      result.error = true
      result.message = "Failed to fetch user location"
      result.code = res.status
      return result
    }

    const data: IUserLocation = await res.json()
    result.data = data
  } catch (err: any) {
    result.error = true
    result.message = err.message || "An error occurred"
    result.code = 500
  }

  return result
}
