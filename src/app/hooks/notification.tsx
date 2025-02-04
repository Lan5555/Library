/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { faWarning } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface Props{
    message?:string
}
export const Notify:React.FC<Props> = ({message}) => {
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="w-auto h-56 rounded-xl animate-pulse bg-white flex justify-center items-center gap-5 flex-col p-4 shadow-xll">
                <img src="/avatar/man.png" alt="photo" className="w-32 h-32"></img>
                <h3 className="text-black">{message ?? 'Nothing passed'}</h3>
            </div>
        </div>
    )
}
export default Notify;