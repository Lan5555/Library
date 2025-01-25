'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import { faBackward, faComputer, faSignIn, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { addDoc, collection } from "firebase/firestore";
import { ChangeEvent, use, useEffect, useState } from "react";
import { db } from "../../../../firebaseConfig";
import { CircularProgress } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import { useRouter } from "next/navigation";
import 'react-toastify/ReactToastify.css';  // Import the Toastify CSS


const Admin:React.FC = () => {

    const [item, setItem] = useState(0);
    const [inputValue, setInputValue] = useState({});
    const [view, setView] = useState<boolean>(false);
    const  [links, setLinks] = useState({});
    const [level, setlevel] = useState(100);
    const [code, setCode] = useState<string>('');

    const handleInputChange = (index:number,e: ChangeEvent<HTMLInputElement>) => {
        const newValues = {...inputValue,[index]: e.target.value};
        setInputValue(newValues);
    }

    const handleInputChange2 = (index:number,e: ChangeEvent<HTMLInputElement>) => {
        const newValues = {...links,[index]: e.target.value.replace('view?usp=drive_link','preview')};
        setLinks(newValues);
    }
    const renderInputs = () => {
        return Array.from({length:item}).map((_,index) => (
            <input 
            key={index}
            type="text"
            onChange={((e)=> handleInputChange(index,e))}
            placeholder={`Course ${index + 1}`}
            className="shadow-xll rounded w-full p-3 mt-5"
            required/>
        ))
    }
    const renderlinks = () => {
        return Array.from({length:item}).map((_,index) => (
            <input 
            key={index}
            type="text"
            onChange={((e)=> handleInputChange2(index,e))}
            placeholder={`Course ${index + 1}`}
            className="shadow-xll rounded w-full p-3 mt-5"
            required/>
        ))
    }
    
    const useFirebase1 = () => {
        const [loading, setLoading] = useState(false);
       

        
    const setData1 = async(collectionName: string) => {
        setLoading(true);
        const data = {
            courses:{
            code,
            courseTitles: {...inputValue},
            }
        };
        try{
        const dataref = await addDoc(collection(db, collectionName),data );
        return {success:true, id: dataref.id}
        }catch(e){
            console.log(e);
            return { success: false, error: "Failed to add data." };
        } finally{
            setLoading(false);
        }
    }
    return {setData1, loading};
}
    const useFireBase2 = () => {
    const [loading2, setLoading2] = useState(false);
   
     const setData2 = async(collectionName: string) => {
        setLoading2(true);
        const data = {
            links:{
            code,
            respectiveLinks: {...links}
            }
        };
        try{
        const dataref = await addDoc(collection(db, collectionName),data );
        return {success:true, id: dataref.id}
        }catch(e){
            console.log(e);
            return { success: false, error: "Failed to add data." };
        } finally{
            setLoading2(false);
        }
    }
    return {setData2, loading2}
}
    const {setData1, loading} = useFirebase1();
    const {setData2, loading2} = useFireBase2();
    
    const showToast = (message?: string) => {
        toast.success(message ?? "Nothing passed.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          
        });
        window.scrollTo(0,0);
      };
      const router = useRouter();
      
    return (
        <div className="flex justify-evenly items-center h-auto w-auto p-5 flex-col gap-10">
            <div className="flex justify-between p-4 items-center mt-10 w-full">
            <h1 className="text-2xl font-bold"><FontAwesomeIcon icon={faComputer}></FontAwesomeIcon> Admin</h1>
            <FontAwesomeIcon icon={faSignOut} onClick={()=> {
                router.push('/pages/homepage');
            }}></FontAwesomeIcon>
            </div>
            <p>Upload courses first!</p>
            <div className="shadow-xll w-full h-auto bg-white flex justify-evenly items-center gap-5 flex-col">
                <div className="flex justify-start gap-10 w-full">
                <input type="number" placeholder="Enter number of courses" className="p-4 rounded w-full outline-none" onChange={(e) => setItem(parseInt(e.target.value))}></input>
                {/* <FontAwesomeIcon icon={faSignIn} onClick={()=> {
                   setView(prev => !prev);
                    }} className="relative right-4"></FontAwesomeIcon> */}
                </div>
            </div>
            <input className="p-3 rounded shadow-xll w-full" placeholder="Course code" onChange={(e)=> {
                setCode(e.target.value);
            }} required></input>

            <h1 className="font-bold text-lg">Level</h1>
            <select className="shadow-xll p-3 rounded w-full outline-none bg-white"
            value={level}
             onChange={(e)=> {
                setlevel(parseInt(e.target.value));
                }}>
                {[100,200].map((element,index) => 
                <option key={index}>{element}</option>
                )}
            </select>
            
            <form className="flex justify-evenly items-center flex-col w-full gap-5" onSubmit={async(event)=> {
                event.preventDefault();
                if(level === 100){
                    const state = await setData1(`level:${level}`);
                    if(state.success){
                        showToast('Success');
                    }
                    
                }else{
                   const state2 = await setData1(`level:${level}`);
                   if(state2.success){
                       showToast('Success');
                   }
                }
            }}>
            {renderInputs()}
            <button className="w-full rounded p-2 text-white bg-black" type="submit">{loading ? <CircularProgress/> : 'Submit'}</button>
            </form>
            <h1 className="font-bold text-lg">Links</h1>
            <h1 className="text-center">Upload links here <br></br>Make sure each link corresponds<br></br> with its respective course.</h1>
            <form className="flex justify-evenly items-center flex-col w-full gap-5" onSubmit={async(event)=>{
                event.preventDefault();
                if(level === 100){
                    const state = await setData2(`links${level}`);
                    if(state.success){
                        showToast('Success');
                    }
                }else{
                    const state2 = await setData2(`links:${level}`);
                    if(state2.success){
                        showToast('Success');
                    }
                }
            }}>
            {renderlinks()}
            <button className="w-full rounded p-2 text-white bg-black" type="submit">{loading2 ? <CircularProgress/> : 'Submit'}</button>
            </form>
            <ToastContainer aria-label={undefined}/>
        </div>
    )
}
export default Admin;