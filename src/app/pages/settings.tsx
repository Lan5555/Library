/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ListTile from "../components/list_tile";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { Alert, Snackbar, SnackbarContent, Switch } from "@mui/material";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { getAuth } from "firebase/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import 'react-toastify/ReactToastify.css';  // Import the Toastify CSS


export const Settings:React.FC = () => {
    const handleChange = (e: any) => {

    }
    const handleChange2 = (e: any) => {

    }
    const [view, setView] = useState<boolean>(false);
    const [open, setOpen] = useState<boolean>(false);

    const handleChange3 = (e: any) => {
        setView(e.target.checked);
        setOpen(true);
    }
    const handleClose = (reason:any) => {
        if(reason === 'clickaway'){
            return;
        }
        setOpen(false);
    }
    const [condition, setCondition] = useState(false);
    const router = useRouter();
    const showToast = (message?: string) => {
        toast.warning(message ?? "Nothing passed.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          
        });
        window.scrollTo(0,0);
      };
    const handleChange5 = (e: number) => {
        if(e === 41568){
            setCondition(false);
            router.push('/pages/admin');
        }else{
            showToast('Warning user not permitted');
        }
    }
    const [email, setEmail] = useState('');
    const [level, setLevel] = useState(0);
    const fetchUserData = async() => {
        const user = getAuth().currentUser;
        try{
        const queryData = query(collection(db,'users'), where('userId','==', user?.uid));
        const dataRef = await getDocs(queryData);

        if(!dataRef.empty){
            const data = dataRef.docs[0].data();
            setEmail(data.email);
            setLevel(data.level);
        }
    }catch(e){
        showToast('Error fetching user details');
     }
    }

    useEffect(() => {
        fetchUserData();
    },[]);
    
    return (
        <div className="w-full h-auto p-2">
            <ListTile
            leading={<FontAwesomeIcon icon={faBell} style={{
                height:'20px'
            }}></FontAwesomeIcon>}
            title="Push notifications"
            subtitle="Enable custom notifications"
            trailing={<Switch onChange={handleChange}></Switch>}
            className="h-auto w-full p-5 flex justify-between items-center shadow-xll rounded-2xl mt-3"
            ></ListTile>
            <br></br>
             <ListTile
            leading={<FontAwesomeIcon icon={faBell} style={{
                height:'20px'
            }}></FontAwesomeIcon>}
            title="Save Login details"
            subtitle="Auto login"
            trailing={<Switch onChange={handleChange2}></Switch>}
            ></ListTile>
            <br></br>
            <div className="flex gap-5 relative p-2 justify-end items-center">
                <h1 className="text-end">{!view ? 'View mode':'Edit mode'}</h1>
                <Switch checked={view} onChange={handleChange3}></Switch>
            </div>
            <div className="w-full h-auto p-3">
            <h2>Email Address</h2>
            {view ? (<input className="w-full p-3 outline-none rounded shadow mt-3" placeholder="Edit"></input>):
            <input className="w-full p-3 outline-none rounded shadow mt-3" readOnly value={email}></input>
            }
            <h2 className="mt-2">Current level</h2>
            {view ? (
            <input className="w-full p-3 outline-none rounded shadow mt-3" placeholder="Edit"></input>
            ):(
            <input className="w-full p-3 outline-none rounded shadow mt-3" readOnly value={level}></input>
            )
            }
            <button className="w-full rounded-lg p-2 bg-gradient-to-tr from-slate-300 to-blue-600 text-center mt-8 shadow hover:bg-green-300 text-white" onClick={()=>{
                showToast('You cant edit your details.');
            }}>{view? 'Confirm' : 'Static'}</button>
            <h2 className="mt-10 font-bold">About</h2>
            <p className="mt-5">Department of computer science. &copy;University of Jos</p>
            </div>
            <Snackbar
            open={open}
            autoHideDuration={3000}
            message={view ? 'Switched to edit mode' : 'Switched to static mode'}
            onClose={handleClose}
            ></Snackbar>
            <button className="rounded p-2 bg-slate-500 relative left-3 text-white hover:bg-gray-200 mb-20" onClick={() => setCondition(true)}>Mode</button>
           {condition && (<div className="flex justify-center items-center w-auto h-auto p-4 rounded bg-blue-600" style={{
            position:'absolute',
            top:'50%',
            left:'50%',
            transform:'translate(-50%,-50%)'
            }}>
                <h2 className="text-white">Enter permit</h2>
                <input className="w-full shadow-xll p-2" type="number" onChange={(e) => handleChange5(parseInt(e.target.value))}></input>
            </div>)}
            <ToastContainer aria-label={undefined}/>
        </div>
    );
}
export default Settings;