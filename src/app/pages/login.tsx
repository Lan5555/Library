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
      showToast(`Welcome, ${user?.displayName || 'User'}`);
        router.push('pages/homepage');
    } else {
      showToast('Oops, something went wrong.', 'warning');
    }
  };


  return  mediaQuery === 'mobile' ? (
    <div className="flex flex-col justify-evenly items-center mt-10 w-full">
    
      <img src="/avatar/login.png" alt="login" className="h-60 w-60" />
      <h1 className="font-bold text-2xl text-blue-700 relative top-12" style={style}>Login here</h1>
      <form onSubmit={handleLogin} className="mt-20 flex flex-col gap-7 w-full p-7">
        <input
          value={formData.email}
          type="email"
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="Email"
          className="w-full p-5 bg-blue-100 rounded-xl text-black placeholder-black shadow"
          required
        />
        <input
          value={formData.password}
          type="password"
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          placeholder="Password"
          className="w-full p-5 bg-blue-100 rounded-xl text-black placeholder-black shadow"
          required
        />
        <div className="flex w-full justify-end p-2">
          <a className="text-pretty text-blue-700">Forgotten your password?</a>
        </div>
        <button type="submit" className="text-white bg-blue-700 p-3 rounded-xl shadow-xl">
          {loading ? <CircularProgress /> : 'Sign in'}
        </button>
      </form>
      <a className="animate-pulse" onClick={() => onclick(true)}>Create an account</a>
      <h3 className="text-center">&copy; Computer Science Department. <br /> University of Jos.</h3>
      <ToastContainer aria-label="Toast messages" />
    </div>
  ):(<Notify message="Desktop version coming soon!"></Notify>)
};

export default Login;
