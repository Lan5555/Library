/* eslint-disable @typescript-eslint/no-unused-vars */

import { Button } from "@mui/material";
import { useState } from "react";

export const PayDues = () => {
    const [isVisible, setIsvisble] = useState(false);

    const renderInputs = () => {
       return Array.from({length:4}).map((_,index) => (
            <div
            key={index}
             className="h-16 w-full rounded shadow-xll">
            </div>
       ));
    }
    return (
        <div className="flex justify-center items-center h-screen flex-col">
            
            <div className="p-2 rounded-sm flex justify-center items-center flex-col gap-3 shadow-2xl w-96 h-60">
            {isVisible && renderInputs()}
            </div>
            <Button variant={'contained'} color={'success'} onClick={()=>{
                setIsvisble(prev => !prev)
            }} className="mt-32">Toggle</Button>
        </div>
    )
}
export default PayDues;