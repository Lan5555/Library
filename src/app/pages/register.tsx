/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect, useState } from "react";
import { useCreateUser, useSignIn } from "../hooks/firebase";
import { CircularProgress } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import 'react-toastify/ReactToastify.css'  // Import the Toastify CSS
import Notify from "../hooks/notification";
import Login from "./login";
import { subDays } from "date-fns";
import { doc, setDoc } from "@firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../../firebaseConfig";

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
    const [login, setLogin] = useState(false);

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

    const [isClicked, setClicked] = useState(true);
        const handleClick = () => {
            setLogin(true);
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
        
          const addTime = async() => {
                  const user = getAuth().currentUser;
                  if(user){
                  try{
                  const expiryDate = subDays(new Date(), 4);
                  const userRef = doc(db,'users',`${user?.uid}`);
                  await setDoc(userRef,{expiry:expiryDate},{merge:true});
                  showToast('Successful');
                  }catch(e){
                  }
               }else{
                  
                  }
                }
        
    return mediaQuery === 'mobile' && !login ? (
        <div className="flex flex-col justify-evenly items-center w-full" style={{
          backgroundImage: darkmode ? 'url(/avatar/forest.jpg)' : 'url(/avatar/bg2.jpg)',
          backgroundPosition:'center',
          backgroundSize:'cover',
          backgroundRepeat:'no-repeat',
          
        }}>
            <img src="/avatar/register.png" alt="photo" className="h-52 w-52"></img>
            <h1 className="mt-4 font-bold text-2xl text-blue-600 dark:text-white">Create Account</h1>
            <p className="relative top-5 text-center text-xs dark:text-white">Create an account<br></br>In order to access the documents</p>

            <form className="mt-10 flex flex-col gap-7 w-full p-7" onSubmit={async(e:React.FormEvent)=>{
                e.preventDefault();
                if(formData.password != formData.confirm){
                    showToast('Password Mismatch','warning');
                }else{
                const result = await addUser(formData);
                if(result.success){
                    showToast('Success');
                    setTimeout(() => {
                      addTime();
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
                 placeholder="Email" className="w-full p-3 bg-blue-100 rounded-xl text-black placeholder-black shadow" required></input>
                <input
                value={formData.password}
                onChange={(e)=> setFormData({...formData, password:e.target.value})}
                 placeholder="Password" type="password" className="w-full p-3 bg-blue-100 rounded-xl text-black placeholder-black shadow" required></input>
                <input 
                value={formData.confirm}
                type="password"
                onChange={(e)=> setFormData({...formData,confirm:e.target.value})}
                placeholder="Confirm Password" className="w-full p-3 bg-blue-100 rounded-xl text-black placeholder-black shadow" required></input>
                <input 
                value={formData.name}
                onChange={(e)=>setFormData({...formData, name:e.target.value})}
                 placeholder="NickName" className="w-full p-3 bg-blue-100 rounded-xl text-black placeholder-black shadow" required></input>
                 <label htmlFor="set" className="relative left-2 dark:text-white">Your current level</label>
                <select onChange={(e) => setFormData({...formData,level:parseInt(e.target.value)})} className="shadow-xll p-3 rounded-lg bg-white" id="set" required>
                    {levels.map((element,index) => 
                    <option key={index}>{element}</option>
                    )}
                </select>
                <button className="text-white bg-blue-700 p-3 rounded-xl shadow-xl mt-10" type="submit">{loading ? <CircularProgress/> : 'Sign up'}</button>
            </form>
            <a className="mb-4 text-blue-500 select-none" onClick={handleClick}>Already have an account?</a>
            <h3 className="text-center mb-10 dark:text-white">&copy;Computer science department.<br></br>University of Jos.</h3>
            <ToastContainer aria-label={undefined}/>
        </div>
    ):mediaQuery === 'mobile' && login ? (<Login onclick={()=>{}}/>): (<Notify message="Desktop version coming soon"></Notify>)
}
export default Register;