/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/no-wrapper-object-types */
'use client'
/* eslint-disable @typescript-eslint/no-unused-vars */
import DesktopLayout from "../../layouts/desktop_layout";
import { useEffect, useState } from "react";
import { MobileLayout } from "../../layouts/mobile_layout";
import TabLayout from "../../layouts/tab_layout";
import Home from "../home";
import DocumentPage from "../document";
import Center from "../../hooks/center";
import ReadMode from "../read";
import Payment from "../payment";
import Settings from "../settings";
import Login from "../login";
import Register from "../register";
import Access from "../access";
import { getAuth } from "firebase/auth";
import { useFetchData } from "@/app/hooks/firebase";
import Notify from "@/app/hooks/notification";
import 'react-toastify/ReactToastify.css';  // Import the Toastify CSS


const Layout: React.FC = () => {
  const [mediaQuery, setMediaQuery] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [index, setIndex] = useState(0);
  const [course, setCourse] = useState<string>('');
  const [login, setLogin] = useState(false);
  const {data,Loading,errors,fetchUserData} = useFetchData();
  const handleCourse = (name:string) => {
    setCourse(name);
    setIndex(1);
  }

  useEffect(() => {
    fetchUserData({ collectionName: "users" });
  //  data.map((user) => {






  
  //   alert(user.name)
  //  })
    
  }, [fetchUserData]); // Only refetch if data is empty
 
  const pages = [
     
    <Home pushCourse={handleCourse}></Home>,
    <DocumentPage courseName={course}></DocumentPage>,
    <Payment></Payment>,
    <Settings></Settings>,
    <ReadMode></ReadMode>
    
  ];

  


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

  return (
    mediaQuery === 'mobile' ? <MobileLayout
     home={()=> setIndex(0)}
     library={()=> setIndex(1)}
     subscription={()=>setIndex(2)}
     settings={()=>setIndex(3)}
     read={()=>setIndex(4)}
     >
      {index < pages.length ? pages[index] : 
      <Center>
        <h1>No content yet</h1>
      </Center>}
    </MobileLayout> : mediaQuery === 'tablet' ?  <Notify message="Tablet version coming soon!"></Notify> : mediaQuery === 'desktop' ? <Notify message="Desktop version coming soon!"/>
    : <Access/>
  );
};

export default Layout;
