import AxiosService from './axios'
import AuthAPI from '../authentication/auth'
import UserAPI from '../users/guest/user'


/**
 * Internal API client
 * Holds all feature modules
 */
class TroottAPIClient {
  public auth: AuthAPI
  public user: UserAPI

  constructor(axiosService: AxiosService) {
    this.auth = new AuthAPI(axiosService)
    this.user = new UserAPI(axiosService)
  }
}

/**
 * Global instance for internal SDK use
 */
let globalInstance: TroottAPIClient | null = null

function setGlobalInstance(instance: TroottAPIClient): void {
  globalInstance = instance
}

/**
 * Accessor used by hooks and internal helpers
 */
export function troottAPIClient(): TroottAPIClient {
  if (!globalInstance) {
    throw new Error(
      'Troott SDK not initialized. Create an instance first with new Troott(baseUrl)'
    )
  }
  return globalInstance
}

/**
 * Main SDK class exposed to users
 *
 * Example:
 * const Troott = new Troott('http://localhost:5015/api/v1')
 * await Troott.auth.loginUser(...)
 */
class Troott extends TroottAPIClient {
  constructor(baseUrl: string) {
    const axiosService = new AxiosService(baseUrl)
    super(axiosService)
    setGlobalInstance(this)
  }
}

export default Troott
