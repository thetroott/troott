import{ useEffect } from 'react'


const useNetwork = (trigger: boolean = true) => {



    useEffect(() => {

        if (trigger) {
            window.addEventListener(`offline`, toggleNetwork, false);
            window.addEventListener(`online`, () => { }, false);
        }

    }, [trigger])

    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    const toggleNetwork = () => {
        popNetwork()
    }

    const popNetwork = () => {
        // redirect
        window.location.href = '/no-network'
    }

    return { popNetwork }

}

export default useNetwork