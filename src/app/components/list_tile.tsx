//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode } from "react";


/* eslint-disable @typescript-eslint/no-explicit-any */
interface props{
    leading?:any,
    trailing?:ReactNode,
    title?:string,
    subtitle?:string,
    className?: string
    color?:string
}
export const ListTile:React.FC<props> = ({leading,trailing,title,subtitle,
    color,
    className= "h-auto w-full p-5 flex justify-between items-center shadow-xll rounded-2xl bg-white"
}) => {
    return (
        <div className={className} style={{
            backgroundColor:color
        }}>
            <div className="flex gap-5 justify-center items-center">
            {leading}
            <div className="flex flex-col">
                <h3>{title}</h3>
                <small className="opacity-50">{subtitle}</small>
            </div>
            </div>
            {trailing}
        </div>
    );
}

export default ListTile;