import { useState } from "react";
import Login from "./login";
import Register from "./register";

const Access = () => {
    const [currentState, setState] = useState(false);

    const handleToggle = () => {
        setState((prevState) => !prevState); // Toggle the state between Login and Register
    };

    return (
        !currentState ? <Login onclick={handleToggle} /> : <Register onclick={handleToggle} />
    );
};

export default Access;
