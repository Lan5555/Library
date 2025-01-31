/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { useState } from "react"
import Login from "./pages/login";
import Register from "./pages/register";
import CheckTime from "./pages/endtime/page";
import PayDues from "./pages/check_payment";
//import Admin from "./pages/admin/page";

const Access = () => {
    const [currentState, setState] = useState(false);
    const handleClick = (condition:boolean) => {
        setState(condition);
    }
    const HandleClick2 = (condition:boolean) => {
        setState(condition);
    }
    return (
        //<PayDues/>
        !currentState ? <Login onclick={handleClick}></Login> : <Register onclick={HandleClick2}/>
    )
}
export default Access;