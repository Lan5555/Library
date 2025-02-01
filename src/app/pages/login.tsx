/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { CSSProperties, useCallback, useEffect, useState } from "react";
import { useSignIn } from "../hooks/firebase";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/ReactToastify.css';
import { useRouter } from "next/navigation";
import { CircularProgress } from "@mui/material";
import Notify from "../hooks/notification";
import 'react-toastify/ReactToastify.css';  // Import the Toastify CSS
import Register from "./register";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faLock, faMailBulk, faMailForward, faSlash } from "@fortawesome/free-solid-svg-icons";




interface Props {
  onclick: (condition: boolean) => void;
}

const Login: React.FC<Props> = ({ onclick }) => {
  const { signIn, loading, error, user } = useSignIn();
  const [mediaQuery, setMediaQuery] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  useEffect(() => {
    // Create the media query matcher
    const mobile = window.matchMedia('(max-width: 600px)');
    const tablet = window.matchMedia('(min-width:542px) and (max-width:1024px)');
    // Set the initial state based on the current screen size
    if (mobile.matches) {
      setMediaQuery('mobile');
    }else if(tablet.matches){
      setMediaQuery('tablet')
    }
     else {
      setMediaQuery('desktop');
    }

    // Update state on window resize
    const handleResize = () => {
      if (mobile.matches) {
        setMediaQuery('mobile');
      }else if(tablet.matches){
        setMediaQuery('tablet')
      }
       else {
        setMediaQuery('desktop');
      }
    };

    // Add event listener for resize
    window.addEventListener('resize', handleResize);

    // Clean up the event listener when the component is unmounted
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array means this effect runs once on mount


  const style: CSSProperties = {
    textShadow: '0px 0px 1px black',
  };

  const [formData, setFormData] = useState({ email: '', password: '' });

  const router = useRouter();
  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    toast(message, {
      position: "top-center",
      type: type,
    });
  };


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn(formData);
    if (result.success) {
      showToast(`Welcome, ${user?.name || 'User'}`);
        router.push('pages/homepage');
    } else {
      showToast('Oops, something went wrong.', 'warning');
    }
  };

    const [register, setRegister] = useState(false);
    const [isVisible, setIsvisble] = useState(false);
  return  mediaQuery === 'mobile' && !register ? (
    <div className="flex flex-col justify-evenly items-center mt-10 w-full">
    
      <img src="/avatar/login.png" alt="login" className="h-60 w-60" />
      <h1 className="font-bold text-2xl text-blue-700 relative top-6" style={style}>Login here</h1>
      <form onSubmit={handleLogin} className="mt-10 flex flex-col gap-7 w-full p-7">
      
<div className="relative flex items-center bg-blue-100 rounded shadow w-full mb-5">
  <FontAwesomeIcon
    icon={faMailBulk}
    className="absolute left-3 text-gray-600"  // You can adjust the size here
  />
  <input
    value={formData.email}
    type="email"
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    placeholder="Email"
    className="w-full pl-10 p-3 bg-blue-100 rounded text-black placeholder-gray-400 outline-none"
    required
  />
</div>


<div className="relative flex items-center bg-blue-100 rounded shadow w-full mb-5">
  <FontAwesomeIcon
    icon={faLock}
    className="absolute left-3 text-gray-600"
  />
  <input
    value={formData.password}
    type={!isVisible ? "password" : "text"}
    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    placeholder="Password"
    className="w-full pl-10 p-3 bg-blue-100 rounded text-black placeholder-gray-400 outline-none"
    required
  />
  <FontAwesomeIcon
    icon={!isVisible ? faEyeSlash : faEye}
    className="absolute right-3 text-gray-600 cursor-pointer"
    onClick={() => setIsvisble((prev) => !prev)} // Toggle visibility
  />
</div>


        <div className="flex w-full justify-end p-2">
          <a className="text-pretty text-xs">Forgotten your password?</a>
        </div>
        <button type="submit" className="text-white bg-blue-700 p-3 rounded-xl shadow-xl">
          {loading ? <CircularProgress /> : 'Sign in'}
        </button>
      </form>
      <a className="animate-pulse text-blue-700 select-none" onClick={() =>{
       onclick(true);
       setRegister(true);
      }
    }>Create an account</a>
      <h3 className="text-center mb-10">&copy; Computer Science Department. <br /> University of Jos.</h3>
      <ToastContainer aria-label="Toast messages" />
    </div>
  ): mediaQuery === 'mobile' && register ? (<Register onclick={()=>{}}/>) : (<Notify message="Desktop version coming soon!"></Notify>);
};

export default Login;
