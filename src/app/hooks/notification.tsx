/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @next/next/no-img-element */
import { faWarning } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useState, useEffect } from "react";

interface Props{
    message?:string
}

export const Notify:React.FC<Props> = ({message}) => {
    const [darkmode,setDarkmode] = useState(false);
      useEffect(() => {
        // Check localStorage for a saved theme preference
        const savedTheme = localStorage.getItem('theme');
    
        if (savedTheme) {
            // If a theme is saved, apply it
            document.documentElement.classList.add(savedTheme);
            setDarkmode(savedTheme === 'dark');
        } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // If no theme saved, and the user prefers dark mode
            document.documentElement.classList.add('dark');
            setDarkmode(true);
        }
    }, []);
    return (
        <div className="w-full h-screen flex justify-center items-center dark:bg-black">
            <div className="w-auto h-56 rounded-xl animate-pulse bg-white flex justify-center items-center gap-5 flex-col p-4 shadow-xll dark:bg-transparent b-b">
                <img src="/avatar/man.png" alt="photo" className="w-32 h-32"></img>
                <h3 className="text-black dark:text-white">{message ?? 'Nothing passed'}</h3>
            </div>
        </div>
    )
}
export default Notify;