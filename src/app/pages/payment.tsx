/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "@firebase/firestore";
import { faCalendar, faCalendarWeek, faClock, faListNumeric } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getAuth } from "firebase/auth";
import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { Button, CircularProgress } from "@mui/material";
import { addDays, formatDistanceToNow } from "date-fns";
import Center from "../hooks/center";
import { closePaymentModal, useFlutterwave } from "flutterwave-react-v3";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/ReactToastify.css';  // Import the Toastify CSS
import { useSaveUser } from "../hooks/firebase";


const Payment: React.FC = () => {
  const [expiryDate, setExpireyDate] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [daysNum, setDatsNum] = useState(14);
  const [userEmail,setUserEmail] = useState<string>('');

  
    useEffect(() => {
      const fetchEmail = async () => {
        const currentUser = getAuth().currentUser;
        const queryData = query(collection(db,'users'), where('userId','==',currentUser?.uid));
        const dataRef = await getDocs(queryData);
        if(!dataRef.empty){
        const data = dataRef.docs[0].data();
          setUserEmail(data.email);
          
        }
        
        }
      fetchEmail();
    },[]);

  
  const [config, setConfig] = useState<any>({
    public_key: process.env.NEXT_PUBLIC_FLUTTER_WAVE_API_KEY,
    tx_ref: Date.now(),
    amount: 200,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: 'user@gmail.com',
      phone_number: '09065590812',
      name: 'Lan enterprices',
    },
    customizations: {
      title: 'Activation',
      description: 'Payment for access to library',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  });

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
  
const addTime = async (newDays: number) => {
  const user = getAuth().currentUser;
  
  if (user) {
    try {
      // Get the user document reference
      const userRef = doc(db, 'users', user.uid);
      
      // Fetch the current expiry date
      const docSnap = await getDoc(userRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const currentExpiry = data?.expiry?.toDate ? data.expiry.toDate() : new Date();

        // Add the new days to the current expiry date
        const newExpiryDate = addDays(currentExpiry, newDays);
        
        // Update the expiry date in the database without overwriting other fields
        await setDoc(userRef, { expiry: newExpiryDate }, { merge: true });

        showToast('Time added successfully');
      } else {
        showToast2('User document does not exist');
      }
    } catch (e) {
      showToast2('Oops, something went wrong');
      console.error(e);
    }
  } else {
    showToast2('User not authenticated');
  }
};


  const router = useRouter();
  const user = getAuth().currentUser;

  const fetchExpiryDate = async () => {
    if (user) {
      const userRef = doc(db, 'users', `${user?.uid}`);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        const expiry = data.expiry.toDate();
        return expiry;
      }
    }
    return null;
  };

  const { amount, saveUserAmount } = useSaveUser();
  const processPayment = async (newAmount: number, newDays: number) => {
    setConfig((prevConfig: any) => ({
      ...prevConfig,
      customer: { ...prevConfig.customer, email: userEmail },
      amount: newAmount,
      newDays,  // Add newDays to config
    }));
  };

  useEffect(() => {
    if (config.newDays !== undefined && config.amount) {
      // Trigger payment only when config.newDays and amount are set
      handleFlutterPayment({
        callback: async (response) => {
          await addTime(config.newDays);  // Use config.newDays instead of newDays from processPayment
          setIsExpired(false);
          closePaymentModal();
          saveUserAmount();
          const updatedExpiryDate = await fetchExpiryDate();
          setExpireyDate(updatedExpiryDate);
        },
        onClose: () => {},
      });
    }
  }, [config]);  // Listen for changes in `config` and trigger payment when necessary


  useEffect(() => {
    const fetchData = async () => {
      const expiry = await fetchExpiryDate();
      if (expiry) {
        setExpireyDate(expiry);
        if (new Date() > expiry) {
          setIsExpired(true);
        }
      }
    };
    fetchData();
  }, [user?.uid]);

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

  if (!expiryDate) return <Center><CircularProgress /></Center>;

  const remainingTime = formatDistanceToNow(expiryDate, { addSuffix: true });
  

  
  

  return (
    <div className="flex flex-col justify-evenly p-5">
      {isExpired && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-700 bg-opacity-50 z-20">
          <div className="bg-white p-5 rounded-xl shadow-lg">
            <h2 className="font-bold text-xl text-red-600">Time has expired!</h2>
            <p>Your plan has expired. Please renew to continue.</p>
            <button
              onClick={() => processPayment(200, 14)}
              className="mt-3 rounded-lg bg-blue-600 text-white px-4 py-2"
            >
              Renew NGN 200
            </button>
          </div>
        </div>
      )}
      
      <div className="p-3 rounded-xl w-full h-44 bg-gradient-to-tr from-slate-300 to-blue-600 flex justify-center items-center flex-col gap-3 dark:bg-transparent">
        <h1 className="font-bold text-3xl"><FontAwesomeIcon icon={faClock} /></h1>
        <h3 className="font-bold text-white shadow p-2">{isExpired ? 'Expired' : 'Expires'} {remainingTime}</h3>
      </div>
      
      <h1 className="font-bold mt-5 opacity-70 text-lg dark:text-white">Renew plan</h1>
      
      <div className="rounded-2xl bg-gray-200 w-full h-16 mt-5 flex justify-between p-5 items-center dark:bg-transparent" style={{
        border: darkmode ? '1px solid white' : '',
        backdropFilter: darkmode ? 'blur(3px)' : ''
      }}>
        <h2 className="text-sm dark:text-white"><FontAwesomeIcon icon={faCalendarWeek} /> Weekly payment</h2>
        <Button
          variant={!darkmode ? 'outlined' : 'contained'}
          onClick={() => processPayment(200, 14)}
        >
          NGN 200
        </Button>
      </div>

      <div className="rounded-2xl bg-gray-200 w-full h-16 mt-5 flex justify-between p-5 items-center dark:bg-transparent" style={{
        border: darkmode ? '1px solid white' : '',
        backdropFilter: darkmode ? 'blur(3px)' : ''
      }}>
        <h2 className="text-sm dark:text-white"><FontAwesomeIcon icon={faCalendar} /> Monthly payment</h2>
        <Button
        variant={!darkmode ? 'outlined' : 'contained'}
        onClick={() => processPayment(400, 28)}
        >
          NGN 400
        </Button>
      </div>

      <h1 className="font-bold mt-5 text-sm opacity-65 dark:text-white">Query transaction</h1>
      <h1 className="font-bold mt-5 text-sm text-blue-400">Renew plan</h1>
      <p className="opacity-60 text-xs dark:text-white">Input transaction number from transaction receipt after successful transfer.</p>
      <div className="rounded-2xl bg-gray-200 w-full h-12 mt-5 flex justify-center items-center gap-1 mb-4 dark:bg-transparent" style={{
        border: darkmode ? '1px solid white' : '',
        backdropFilter: darkmode ? 'blur(3px)' : ''
      }}>
        <FontAwesomeIcon icon={faListNumeric} />
        <input type="number" className="w-72 p-1 bg-transparent outline-none" placeholder="Input transaction number here" />
      </div>
      <Button
      variant={'contained'}
       className="w-full mt-10">
        Query
      </Button>
      
      <ToastContainer aria-label={undefined} />
    </div>
  );
};

export default Payment;
