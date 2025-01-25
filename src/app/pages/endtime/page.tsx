/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import { faBook, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {useFlutterwave, closePaymentModal} from 'flutterwave-react-v3';
import { useEffect, useState } from "react";
import {addDays} from 'date-fns';
import { getAuth } from "firebase/auth";
import { collection, doc, setDoc } from "firebase/firestore";
import { db } from "../../../../firebaseConfig";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/ReactToastify.css';  // Import the Toastify CSS
import { useRouter } from "next/navigation";
import Notify from "@/app/hooks/notification";


const CheckTime:React.FC = () => {

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
  
    const [amount, setAmount] = useState(200);
    const config:any = {
        public_key: process.env.NEXT_PUBLIC_FLUTTER_WAVE_API_KEY,
        tx_ref: Date.now(),
        amount: amount,
        currency: 'NGN',
        payment_options: 'card,mobilemoney,ussd,banktransfer',
        customer: {
          email: 'user@gmail.com',
           phone_number: '09065590812',
          name: 'john doe',
        },
        customizations: {
          title: 'Activation',
          description: 'Payment for access to library',
          logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
        },
      };
    
      
      const showToast = (message?: string) => {
        toast.success(message ?? "Nothing passed.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          
        });
      };
      const showToast2 = (message?: string) => {
        toast.warning(message ?? "Nothing passed.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          
        });
      };

      const handleFlutterPayment = useFlutterwave(config);
      const addTime = async() => {
        const user = getAuth().currentUser;
        if(user){
        try{
        const expiryDate = addDays(new Date(), 14);
        const userRef = doc(db,'users',`${user?.uid}`);
        await setDoc(userRef,{expiry:expiryDate},{merge:true});
        showToast('Successful');
        }catch(e){
        showToast2('Oops something went wrong');
        }
     }else{
        showToast2('User not authenticated');
        }
      }
   
      const router = useRouter();
    return mediaQuery === 'mobile' ? (
        <div className="w-full h-screen flex justify-center items-center flex-col p-3">
            <div className="w-72 rounded shadow-xll h-96 flex justify-center items-center flex-col gap-10 p-3">
                <div className="fixed top-0 left-0 w-36 shadow-xll rounded h-auto p-2 flex gap-2 items-center">
                    <FontAwesomeIcon icon={faBook}></FontAwesomeIcon>
                    <h1 className="font-bold">Library</h1>
                </div>
                <FontAwesomeIcon icon={faInfoCircle} style={{
                    height:'60px',
                    color:'blue'
                }} className="animate-pulse"></FontAwesomeIcon>
                <h1 className="font-bold">Information</h1>
                <p className="text-center">You are required to subscribe before getting your pass, and after two weeks, you will have to resubscribe.</p>
                <button className="p-2 rounded w-full text-white bg-blue-600 hover:bg-black" onClick={() => {
                    handleFlutterPayment({
                        callback:  (response) => {
                            addTime();
                            router.push('/pages/homepage')
                            closePaymentModal();
                        },
                        onClose: () => {},
                        
                    });
                }}>₦200</button>
            </div>
            <footer className="mt-28 mb-10">
            <p className="text-center">&copy;Department of Computer Science<br></br>University of Jos.</p>
            </footer>
            <ToastContainer aria-label={undefined}></ToastContainer>
        </div>
    ):(<Notify message="Desktop version coming soon!"></Notify>)
}

export default CheckTime;