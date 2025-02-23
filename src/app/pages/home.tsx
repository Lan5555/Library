/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookAtlas, faComputer, faEllipsis, faLightbulb, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../../firebaseConfig'; // Ensure this path is correct
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { addDays, formatDistanceToNow } from 'date-fns';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import Center from '../hooks/center';
import { CircularProgress } from '@mui/material';
import Login from './login';
import { useSaveUser } from '../hooks/firebase';
import { unsubscribe } from 'diagnostics_channel';



interface CourseProps {
  pushCourse: (name: string) => void;
}

export const Home: React.FC<CourseProps> = ({ pushCourse }) => {
  const [courses, setCourses] = useState<{ code: string; titles: string[] }[]>([]); // Store course codes and titles
  const [level, setLevel] = useState<number | null>(null); // Store the user's level
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  const [expiryDate, setExpiryDate] = useState<Date | null>(null);
  const [daysNum, setDaysNum] = useState(14);
  const [id, setId] = useState<any>(null); // Initially set to null
  const [isExpired, setIsExpired] = useState(false);
  //const user = getAuth().currentUser;
  const [currentUser, setUser] = useState<any>(null);

  const [userEmail,setUserEmail] = useState('');
  const [newCode, setNewCode] = useState(['MTH','GST','CHM','BIO','CSC','PHY','PSB','SLT']);


  useEffect(() => {
    const fetchEmail = async () => {
      const currentUser = getAuth().currentUser;
      if (currentUser?.uid) {
        const queryData = query(collection(db, 'users'), where('userId', '==', currentUser.uid));
        const dataRef = await getDocs(queryData);
        if (!dataRef.empty) {
          const data = dataRef.docs[0].data();
          setUserEmail(data.email);
        }
      }
    };
    fetchEmail();
   
  },[]);
 
 
  const [config, setConfig] = useState<any>({
    public_key: process.env.NEXT_PUBLIC_FLUTTER_WAVE_API_KEY,
    tx_ref: Date.now(),
    amount: 200,
    currency: 'NGN',
    payment_options: 'card,mobilemoney,ussd,banktransfer',
    customer: {
      email: `user@gmail.com`,
      phone_number: '09065590812',
      name: 'Lan enterprices',
    },
    customizations: {
      title: 'Activation',
      description: 'Payment for access to library',
      logo: 'https://st2.depositphotos.com/4403291/7418/v/450/depositphotos_74189661-stock-illustration-online-shop-log.jpg',
    },
  });

  const showToast = (message: string, type: "success" | "error" | "info" | "warning" = "success") => {
    toast(message, {
      position: "top-center",
      type: type,
    });
  };

  const handleFlutterPayment = useFlutterwave(config);

  const addTime = async (newDays: number) => {
    if (currentUser?.uid) {
      try {
        const expiryDate = addDays(new Date(), newDays);
        const userRef = doc(db, 'users', `${currentUser.uid}`);
        await setDoc(userRef, { expiry: expiryDate }, { merge: true });
        showToast('Payment Successful!', 'success');
      } catch (e) {
        showToast('Oops, something went wrong.', 'error');
      }
    } else {
      showToast('User not authenticated! Kindly log in again', 'warning');
    }
  };

  const fetchExpiryDate = useCallback(async () => {
    if (currentUser?.uid) {
      const userRef = doc(db, 'users', `${currentUser.uid}`);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.expiry.toDate();
      }
    }
    return null;
  }, [currentUser]);

  useEffect(() => {
    const fetchData = async () => {
      const expiry = await fetchExpiryDate();
      if (expiry) {
        setExpiryDate(expiry);
        if (new Date() > expiry) {
            const expired = new Date() > expiry;
          setIsExpired(expired);
          
          
        }
      }
    };
    fetchData();
  }, [fetchExpiryDate]);

  const remainingTime = expiryDate ? formatDistanceToNow(expiryDate, { addSuffix: true }) : null;
  const { amount, saveUserAmount } = useSaveUser();

  const processPayment = async (newAmount: number, newDays: number) => {
    setConfig({ ...config, customer:{...config.customer,email:userEmail},amount: newAmount });
    handleFlutterPayment({
      callback: async (response) => {
        await addTime(newDays);
        setIsExpired(false);
        closePaymentModal();
        saveUserAmount();
        const updatedExpiryDate = await fetchExpiryDate();
        setExpiryDate(updatedExpiryDate);
        setTimeout(() => {
          window.location.reload();
        },2000);
      },
      onClose: () => { },
    });
   
  };

  const [index1, setIndex1] = useState(0);
  const [index2, setIndex2] = useState(0);
  const [index3, setIndex3] = useState(0);

  useEffect(() => {
    // Function to generate unique indices
    const generateUniqueIndices = () => {
      const indices: number[] = [];
      while (indices.length < 3) {
        const randomIndex = Math.floor(Math.random() * newCode.length);
        // Check if the random index is not already in the array
        if (!indices.includes(randomIndex)) {
          indices.push(randomIndex);
        }
      }
      return indices;
    };

    // Generate the unique indices
    const [uniqueIndex1, uniqueIndex2, uniqueIndex3] = generateUniqueIndices();

    // Set the indices
    setIndex1(uniqueIndex1);
    setIndex2(uniqueIndex2);
    setIndex3(uniqueIndex3);
  }, [newCode.length]); // Depend on newCode.length to re-run if it changes

  const [backToLogIn,setBackToLogin] = useState(false);

    useEffect(() => {
      const fetchUserLevelAndCourses = async () => {
        setLoading(true);
        setError(null); // Reset any previous error
    
        try {
          const auth = getAuth();
          const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
              setUser(user); // Setting currentUser properly here
            } else {
              setError('User Not Authenticated');
            }
          });
    
          // Wait until user state is set
          if (currentUser?.uid) {
            const auth = getAuth().currentUser;
            const userQuery = query(collection(db, 'users'), where('userId', '==', auth?.uid));
            const userSnapshot = await getDocs(userQuery);
    
            if (!userSnapshot.empty) {
              const userData = userSnapshot.docs[0].data();
              const userLevel = userData.level;
              setLevel(userLevel); // Set user level (100, 200, etc.)
    
              const coursesQuery = query(collection(db, `level:${userLevel}`));
              const coursesSnapshot = await getDocs(coursesQuery);
    
              if (!coursesSnapshot.empty) {
                const fetchedCourses = coursesSnapshot.docs.map((doc) => {
                  const data = doc.data();
                  const courseCode = data.courses ? data.courses.code : ''; // Extract course code
                  const courseTitles = data.courseTitles || [];
    
                  return { code: courseCode, titles: courseTitles };
                });
    
                setCourses(fetchedCourses);
              } else {
                setError('No courses found for this level.');
              }
            } else {
              setError('User not found in the database.');
            }
          }
        } catch (err: any) {
          setError(err.message || 'An error occurred while fetching courses.');
        } finally {
          setLoading(false);
        }
      };
    
      fetchUserLevelAndCourses();
    }, [currentUser]); // Depend on currentUser to trigger this when it changes

    const [fact, setFact] = useState<string>('');
    const [loading3, setLoading3] = useState<boolean>(true);
    useEffect(() => {
      // Function to fetch a random fact
      const fetchRandomFact = async () => {
        try {
          const response = await fetch("https://uselessfacts.jsph.pl/random.json?language=en");
          const data = await response.json();
          setFact(data.text); // Set the fact text from the API response
          setLoading3(false);
        } catch (error) {
          console.error("Error fetching fact:", error);
          setLoading3(false);
        }
      };
  
      
      fetchRandomFact();
  
      // Set up the interval to fetch a new fact every 10 seconds
      const intervalId = setInterval(fetchRandomFact, 10000); 
  
      
      return () => clearInterval(intervalId);
    }, []); 

  const colors = ['blue','red','pink','grey','black','darkred']
  const [selectedcolor, setSelectedColor] = useState('');
  useEffect(() => {
    const changeColor = () => {
      const randomIndex = Math.floor(Math.random() * colors.length);
        setSelectedColor(colors[randomIndex]);
    }
    changeColor();
    const intervalId = setInterval(changeColor, 5000); 
    return () => clearInterval(intervalId);
  },[]);

  const [darkmode,setDarkMode] = useState(false);
  useEffect(() => {
    // Check localStorage for a saved theme preference
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        // If a theme is saved, apply it
        document.documentElement.classList.add(savedTheme);
        setDarkMode(savedTheme === 'dark');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // If no theme saved, and the user prefers dark mode
        document.documentElement.classList.add('dark');
        setDarkMode(true);
    }
}, []);
    
  // Handle loading and errors
  if (loading) {
    return <Center><CircularProgress/></Center>
  }

  if (error) {
    setTimeout(()=>{
      window.location.href = "/#";
    },3000);
    return <div className='p-3'>Error: {error} falling back to log in page.</div>;
  }
  const settings = {
    dots:true,
    infinite:true,
    speed:500,
    slidesToShow:1,
    slidesToScroll:1
  }

  return !backToLogIn ? (
    <div className="p-3 flex justify-evenly items-center flex-col gap-10">
      <div className="rounded-lg p-2 w-[95%] h-48 flex justify-center items-center shadow dark:bg-transparent" style={{
       backgroundImage: darkmode ? '':'url("/avatar/bg.jpeg")',
        backgroundPosition:'center',
        backgroundSize:'cover',
        backgroundRepeat:'no-repeat',
        border: darkmode ? '1px solid white' : '',
        backdropFilter: darkmode ? 'blur(3px)' : ''
      }}>
        <div className="flex gap-5">
          <div className="rounded-full p-2 flex justify-center items-center bg-gradient-to-tr h-20 w-20" style={{
            backgroundImage:'url("/avatar/man.png")',
            backgroundPosition:'center',
            backgroundSize:'cover',
            backgroundRepeat:'no-repeat',
            border: !darkmode ? '1px solid rgba(0,0,0,0.2)' : '1px solid white'
          }}>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-white font-extrabold" style={{
              textShadow: !darkmode ? '2px 4px 8px black' : ''
            }}>Your current level: {level}</h1>
            <p className="text-black opacity-65 dark:text-white">Courses Available: {courses.length}</p>
          </div>
        </div>
      </div>
        <h2 className='font-bold dark:text-white'>Trending courses</h2>
        <div className='grid gap-4 grid-cols-3 place-items-center'>
          {Array.from({length:3}).map((_,index) => 
            <div key={index} className='w-24 shadow-xll rounded bg-white h-16  flex justify-center items-center animate-pulse' style={{
              backgroundImage:'url("/avatar/book6.jpeg")',
              backgroundPosition:'center',
              backgroundSize:'cover',
              backgroundRepeat:'no-repeat',
              backdropFilter:'blur(3px)'
            }}>
              {
              index === 0 ? <h2 className='text-white font-bold'>{newCode[index1]}</h2> : index === 1 ? <h2 className='text-white font-bold'>{newCode[index2]}</h2> : <h2 className='text-white font-bold'>{newCode[index3]}</h2>}
            </div>
          )}
        </div>
        <h2 className='font-bold relative -top-5 dark:text-white'><FontAwesomeIcon icon={faLightbulb}/> Did you know?</h2>
        <div className='w-80 h-20 rounded p-2 shadow-xll bg-white relative flex justify-center items-center overflow-auto text-sm -top-10 dark:bg-transparent' style={{
          fontFamily:'lora',
          borderLeft:'2px solid blue',
          backdropFilter: darkmode ? 'blur(6px)' : ''
        }}>
          {loading3 ? <Center><CircularProgress/></Center> : <p style={{
            color:selectedcolor,
            transition:'1s ease-in-out',
          }}>{fact}</p>}
        </div>
      <div className="flex flex-start ml-5 flex-col w-[90%]">
        <h2 className="text-left font-bold relative -top-10 dark:text-white">
          <FontAwesomeIcon icon={faStarHalfAlt} /> Your courses
        </h2>
        <small className='animate-pulse relative -top-10 dark:text-white'>Make sure you select a course before going to the library.</small>
      </div>
    
      <div className="p-3 h-auto w-auto grid grid-cols-2 gap-10 place-items-center mb-10 relative -top-16">
        {courses.map((course, index) => (
          <div
            key={index}
            className="rounded-xl h-36 w-36 shadow-xll p-2 flex justify-center items-center flex-col gap-3 hover:bg-blue-300"
            onClick={() => pushCourse(course.code)} // Passing the full course code
           style={{
            backgroundImage:!darkmode ? 'url("/avatar/book5.jpeg")' : '',
            backgroundPosition:'center',
            backgroundSize:'cover',
            backgroundRepeat:'no-repeat',
            border: !darkmode ? '1px solid rgba(0,0,0,0.2)' : '1px solid white',
            backdropFilter: darkmode ? 'blur(6px)' : ''
           }}>
            <FontAwesomeIcon icon={faEllipsis} className="relative left-14 -top-1 dark:text-white" onClick={() => {}} />
            <FontAwesomeIcon icon={faBookAtlas} color={!darkmode ? "blue" : 'white'} style={{ height: '40px' }} className="relative left-5" />
            <h1 className="font-bold relative left-5 dark:text-white" style={{
              textShadow:'4px 8px 18px blue'
            }}>{course.code || 'No Code Available'}</h1> {/* Displaying the course code or fallback message */}
            <small className='font-bold animate-pulse dark:text-white'>Click to preview</small>
          </div>
        ))}
      </div>
      {isExpired && (
        <div className="absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center bg-gray-700 bg-opacity-50">
          <div className="bg-white p-5 rounded-xl shadow-lg">
            <h2 className="font-bold text-xl text-red-600">Time expired {remainingTime}</h2>
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
    </div>
  ):(<Login onclick={()=>{}}/>);
};

export default Home;
