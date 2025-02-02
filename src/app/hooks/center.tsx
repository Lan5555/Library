import { ReactNode } from "react"

interface Props{
    children:ReactNode,
}
const Center:React.FC<Props> = ({children}) => {
    return <div className="flex justify-center items-center centered">
        {children}
    </div>
}
export default Center;