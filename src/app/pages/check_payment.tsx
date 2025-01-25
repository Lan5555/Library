/* eslint-disable @typescript-eslint/no-unused-vars */
import { getAuth } from "firebase/auth";
import { useState } from "react";

const CheckPayment:React.FC = () => {
    const auth = getAuth().currentUser;
    const [error, setError] = useState<string>('');
    const checkIfAuthenticated = () => {
        if(!auth){
            setError('User not authenticated');
        }

    }
    return (
        <div className="flex justify-evenly flex-col mt-10">

        </div>
    )
}
export default CheckPayment;