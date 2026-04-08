import React, { useEffect } from 'react'


const useNetwork = (trigger: boolean = true) => {



    useEffect(() => {

        if (trigger) {
            window.addEventListener(`offline`, toggleNetwork, false);
            window.addEventListener(`online`, () => { }, false);
        }

    }, [trigger])

    const toggleNetwork = (e: any) => {
        popNetwork()
    }

    const popNetwork = () => {
        // redirect
        window.location.href = '/no-network'
    }

    return { popNetwork }

}

export default useNetwork