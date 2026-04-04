import { useRouter } from "expo-router"
import { useSearchParams } from "expo-router/build/hooks"



const useGoTo = () => {

    const location = useSearchParams()
    const router = useRouter()

    const goTo = (url: string) => {
        
        if (url) {
            router.push(url)
        }
    }

    const reload = () => {

        router.reload()

    }

    const navigate = (url: string) => {
       
        if (url) {
            router.navigate(url)
        }
    }

    const goToNewScreen = (url: string) => {
        
        if (url) {
            router.replace(url)
        }
    }




    return {
        location,
        router,
        goTo,
        reload,
        navigate,
        goToNewScreen
    }
}

export default useGoTo