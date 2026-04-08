import { useLocation, useNavigate } from "react-router-dom"


const useGoTo = () => {

    const location = useLocation()
    const navigate = useNavigate()

    const goTo = (url: string) => {
        if (url) {
            navigate(url)
        }
    }

    return {
    
        location,
        navigate,
        goTo
    }
}

export default useGoTo