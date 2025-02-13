//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ReactNode, useEffect, useState } from "react";


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
        <div className={className} style={{
            backgroundColor:color,
            border: darkmode ? '1px solid white' : '',
            backdropFilter: darkmode ? 'blur(3px)' : ''
        }}>
            <div className="flex gap-5 justify-center items-center">
            {leading}
            <div className="flex flex-col">
                <h3 className="dark:text-white">{title}</h3>
                <small className="opacity-50 dark:text-white">{subtitle}</small>
            </div>
            </div>
            {trailing}
        </div>
    );
}

export default ListTile;