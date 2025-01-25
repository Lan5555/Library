import { faWarning } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface Props{
    message?:string
}
export const Notify:React.FC<Props> = ({message}) => {
    return (
        <div className="w-full h-screen flex justify-center items-center">
            <div className="w-auto h-56 rounded-xl animate-pulse bg-black flex justify-center items-center gap-5 flex-col p-4">
                <FontAwesomeIcon icon={faWarning} color="green"></FontAwesomeIcon>
                <h3 className="text-white">{message ?? 'Nothing passed'}</h3>
            </div>
        </div>
    )
}
export default Notify;