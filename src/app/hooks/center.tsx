import { ReactNode } from "react"

interface props{
    children:ReactNode
}
const Center:React.FC<props> = ({children}) => {
    return <div className="flex justify-center items-center">
        {children}
    </div>
}
export default Center;