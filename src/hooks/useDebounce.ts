import { useEffect, useState } from "react"

export const useDebounce = (value:any, delay:number) =>{
    const [ debouncedValue, setDebouncedValue ] = useState<any>();
    useEffect(() => {
        const timeOutFunction = 
        setTimeout(() =>{
            setDebouncedValue(value)
        }, delay) 

    return () => {
        clearTimeout(timeOutFunction)
    }
    }, [value, delay])
    return debouncedValue
}