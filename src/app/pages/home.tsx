/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBookAtlas, faComputer, faEllipsis, faStarHalfAlt } from '@fortawesome/free-solid-svg-icons';
import { getAuth } from 'firebase/auth';
import { db } from '../../../firebaseConfig'; // Ensure this path is correct
import { collection, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';
import { addDays, formatDistanceToNow } from 'date-fns';
import { useFlutterwave, closePaymentModal } from 'flutterwave-react-v3';
import { toast } from 'react-toastify';
import 'react-toastify/ReactToastify.css';
import Center from '../hooks/center';
import { CircularProgress } from '@mui/material';
import Login from './login';
import { useSaveUser } from '../hooks/firebase';



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
  const user = getAuth().currentUser;

  const [userEmail,setUserEmail] = useState('');
  const [newCode, setNewCode] = useState(['MTH','GST','CHM','BIO','CSC',]);


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
    if (user) {
      try {
        const expiryDate = addDays(new Date(), newDays);
        const userRef = doc(db, 'users', `${user.uid}`);
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
    if (user?.uid) {
      const userRef = doc(db, 'users', `${user.uid}`);
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.expiry.toDate();
      }
    }
    return null;
  }, [user]);

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
  }, [fetchExpiryDate, user]);

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
        const user = getAuth().currentUser;
        if (!user) {
          setError('User is not authenticated.');
          return;
        }
  
        // Fetch the user's data using 'userId' from the 'users' collection
        const userQuery = query(collection(db, 'users'), where('userId', '==', user.uid));
        const userSnapshot = await getDocs(userQuery);
  
        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          const userLevel = userData.level;
          setLevel(userLevel); // Set user level (100, 200, etc.)
          
          // Fetch courses based on the user's level by querying the relevant level collection
          const coursesQuery = query(collection(db, `level:${userLevel}`)); // Fetch courses from the respective level collection
          const coursesSnapshot = await getDocs(coursesQuery);
  
          if (!coursesSnapshot.empty) {
            const fetchedCourses = coursesSnapshot.docs.map((doc) => {
              const data = doc.data();
              
              console.log('Fetched Course Data:', data);
  
              // Extract the first course code (from the courses object)
              const courseCode = data.courses ? data.courses.code : ''; // Access the actual code value directly
              const courseTitles = data.courseTitles || [];
  
              if (!courseCode) {
                console.error('Course code is missing in the document:', data);
              }
  
              return { code: courseCode, titles: courseTitles };
            });
  
            setCourses(fetchedCourses); // Set the courses (code + titles)

          } else {
            setError('No courses found for this level.');
          }
        } else {
          setError('User not found in the database.');
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while fetching courses.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserLevelAndCourses();
  }, []); // Empty dependency array means this effect runs only once after component mount
  
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
      <div className="rounded-lg p-2 bg-gradient-to-tr from-blue-800 to-black w-[95%] h-48 flex justify-center items-center shadow" style={{
        backgroundImage:'url("/avatar/bg.jpeg")',
        backgroundPosition:'center',
        backgroundSize:'cover',
        backgroundRepeat:'no-repeat',
        //border:'1px solid rgba(0,0,0,0.2)'
      }}>
        <div className="flex gap-5">
          <div className="rounded-full p-2 flex justify-center items-center bg-gradient-to-tr h-20 w-20" style={{
            backgroundImage:'url("/avatar/man.png")',
            backgroundPosition:'center',
            backgroundSize:'cover',
            backgroundRepeat:'no-repeat',
            border:'1px solid rgba(0,0,0,0.2)'
          }}>
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-black font-extrabold opacity-65">Your current level: {level}</h1>
            <p className="text-black opacity-65">Courses Available: {courses.length}</p>
          </div>
        </div>
      </div>
        <h2 className='font-bold'>Trending courses</h2>
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
      <div className="flex flex-start ml-5 flex-col w-[90%]">
        <h2 className="text-left font-bold">
          <FontAwesomeIcon icon={faStarHalfAlt} /> Your courses
        </h2>
        <small className='animate-pulse'>Make sure you select a course before going to the library.</small>
      </div>
    
      <div className="p-3 h-auto w-auto grid grid-cols-2 gap-10 place-items-center mb-10">
        {courses.map((course, index) => (
          <div
            key={index}
            className="rounded-xl h-36 w-36 shadow-xll p-2 flex justify-center items-center flex-col gap-3 hover:bg-blue-300"
            onClick={() => pushCourse(course.code)} // Passing the full course code
           style={{
            backgroundImage:'url("/avatar/book5.jpeg")',
            backgroundPosition:'center',
            backgroundSize:'cover',
            backgroundRepeat:'no-repeat',
            border:'1px solid rgba(0,0,0,0.2)'
           }}>
            <FontAwesomeIcon icon={faEllipsis} className="relative left-14 -top-1" onClick={() => {}} />
            <FontAwesomeIcon icon={faBookAtlas} color="blue" style={{ height: '40px' }} className="relative left-5" />
            <h1 className="font-bold relative left-5" style={{
              textShadow:'4px 8px 18px blue'
            }}>{course.code || 'No Code Available'}</h1> {/* Displaying the course code or fallback message */}
            <small className='font-bold animate-pulse'>Click to preview</small>
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
