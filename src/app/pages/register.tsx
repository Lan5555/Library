/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useCreateUser, useSignIn } from "../hooks/firebase";
import { CircularProgress } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import 'react-toastify/ReactToastify.css'  // Import the Toastify CSS
import Notify from "../hooks/notification";

/* eslint-disable @next/next/no-img-element */
interface Props{
    onclick: (condition: boolean) => void
}
const Register:React.FC<Props> = ({onclick}) => {
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

    const levels:number[] = [
        100,200
    ];
    const [isClicked, setClicked] = useState(true);
        const handleClick = () => {
            setClicked(false);
            onclick(isClicked);
        }
        const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
            toast(message, {
              position: "top-center",  // You can modify the position if needed
              type: type,              // Type can be "success", "error", "info", or "warning"
            });
          };
        const {addUser,loading,error,success} = useCreateUser();
        const [formData, setFormData] = useState({name: "",  email: "", password: "",confirm:'', level: 100});
        const router = useRouter();
    return mediaQuery === 'mobile' ? (
        <div className="flex flex-col justify-evenly items-center mt-10 w-full">
            <img src="/avatar/register.png" alt="photo" className="h-60 w-60"></img>
            <h1 className="mt-10 font-bold text-2xl text-blue-600">Create Account</h1>
            <p className="relative top-5 text-center">Create an account<br></br>In order to access the documents</p>

            <form className="mt-10 flex flex-col gap-7 w-full p-7" onSubmit={async(e:React.FormEvent)=>{
                e.preventDefault();
                if(formData.password != formData.confirm){
                    showToast('Password Mismatch','warning');
                }else{
                const result = await addUser(formData);
                if(result.success){
                    showToast('Success');
                    setTimeout(() => {
                    router.push('/pages/endtime');
                    }, 4000);
                }else{
                    showToast(`Oops some thing went wrong`,'warning');
                }
                }
            }}>
                <input type="email"
                value={formData.email}
                onChange={(e)=> setFormData({...formData, email:e.target.value})}
                 placeholder="Email" className="w-full p-5 bg-blue-100 rounded-xl text-black placeholder-black shadow" required></input>
                <input
                value={formData.password}
                onChange={(e)=> setFormData({...formData, password:e.target.value})}
                 placeholder="Password" type="password" className="w-full p-5 bg-blue-100 rounded-xl text-black placeholder-black shadow" required></input>
                <input 
                value={formData.confirm}
                type="password"
                onChange={(e)=> setFormData({...formData,confirm:e.target.value})}
                placeholder="Confirm Password" className="w-full p-5 bg-blue-100 rounded-xl text-black placeholder-black shadow" required></input>
                <input 
                value={formData.name}
                onChange={(e)=>setFormData({...formData, name:e.target.value})}
                 placeholder="NickName" className="w-full p-5 bg-blue-100 rounded-xl text-black placeholder-black shadow" required></input>
                 <label htmlFor="set" className="relative left-2">Your current level</label>
                <select onChange={(e) => setFormData({...formData,level:parseInt(e.target.value)})} className="shadow-xll p-3 rounded-lg" id="set" required>
                    {levels.map((element,index) => 
                    <option key={index}>{element}</option>
                    )}
                </select>
                <button className="text-white bg-blue-700 p-3 rounded-xl shadow-xl mt-10" type="submit">{loading ? <CircularProgress/> : 'Sign up'}</button>
            </form>
            <a className="mb-4 text-blue-500" onClick={handleClick}>Already have an account?</a>
            <h3 className="text-center">&copy;Computer science department.<br></br>University of Jos.</h3>
            <ToastContainer aria-label={undefined}/>
        </div>
    ):(<Notify message="Desktop version coming soon"></Notify>);
}
export default Register;