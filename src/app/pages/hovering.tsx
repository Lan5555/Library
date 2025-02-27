/* eslint-disable @typescript-eslint/no-explicit-any */
import { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

/* eslint-disable @typescript-eslint/no-unused-vars */
interface Props{
    items:IconDefinition[]
    onPressed:(index:any) => void;
}
const Hover:React.FC<Props> = ({items, onPressed}) => {
    return (
        <div className="w-auto h-auto bg-black rounded-sm animate-pulse p-2 dark:bg-white z-20 absolute right-10 bottom-10 flex justify-evenly gap-2">
            {items.map((element:any,index) => 
             <FontAwesomeIcon 
             className="text-white dark:text-black cursor-pointer"
             key={index}
              icon={element} onClick={() => onPressed(index)}></FontAwesomeIcon>
            )}
        </div>
    );
}
export default Hover;