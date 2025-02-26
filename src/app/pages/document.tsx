/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ListTile from "../components/list_tile";
import { faAngleRight, faArrowDownLong, faBook, faScroll } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { getAuth } from "firebase/auth"; // Firebase Authentication
import { db } from "../../../firebaseConfig"; // Your Firebase DB initialization
import { query, collection, where, getDocs } from "firebase/firestore"; // Firebase Firestore methods
import Center from "../hooks/center";
import { CircularProgress, Fab, IconButton } from "@mui/material";
import 'react-toastify/ReactToastify.css';  // Import the Toastify CSS


interface Props {
  courseName?: string; // courseName passed as prop
}

const DocumentPage: React.FC<Props> = ({ courseName = '' }) => {
  const [level, setLevel] = useState<number | null>(null); // Initialize with null instead of 0 to better handle the check
  const [courses, setCourses] = useState<any[]>([]);
  const [links, setLinks] = useState<any[]>([]);

  // Fetch user data and set level
  const fetchUserData = async () => {
    const user = getAuth().currentUser;

    if (!user) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Fetch user data to get their level
      const querySnapShot = query(collection(db, 'users'), where('userId', '==', user.uid));
      const snapShot = await getDocs(querySnapShot);

      if (!snapShot.empty) {
        const userData = snapShot.docs[0].data();
        const userLevel = userData.level;
        setLevel(userLevel); // Set the user level state

        // Fetch courses and links from the Firestore collections
        const coursesQuery = await getDocs(collection(db, `level:${userLevel}`));
        const linksQuery = await getDocs(collection(db, `links:${userLevel}`));

        const newCourses: any[] = [];
        const newLinks: any[] = [];
        

        if (!coursesQuery.empty) {
          coursesQuery.forEach((doc) => {
            const data = doc.data();
            if (data) {
              const code = data.courses.code;
              const courseTitles = data.courses.courseTitles;
              const courseNames = courseTitles ? Object.values(courseTitles) : [];
              newCourses.push({ code, courseNames });
            } else {
              console.warn('Document data is undefined or empty');
            }
          });
        }

        if (!linksQuery.empty) {
          linksQuery.forEach((doc) => {
            const data = doc.data();
            if (data) {
              const codeName = data.links.code;
              const courseLinks = data.links.respectiveLinks;
              const linksArray = courseLinks ? Object.values(courseLinks) : [];
              newLinks.push({ codeName, courseLinks, linksArray });
            } else {
              console.warn('Document data is undefined or empty');
            }
          });
          
        }

        setCourses(newCourses);
        setLinks(newLinks);
      } else {
        console.error('User data not found');
      }
    } catch (e) {
      console.error('Error fetching user data:', e);
    }
  };

  // const handleScroll = () => {
  //   const elementId = 'course';
  //   console.log(`Scrolling to element with ID: ${elementId}`);
    
  //   const element = document.getElementById(elementId);
    
  //   if (element) {
  //     console.log(`Found element: ${elementId}`);
  //     element.scrollIntoView({ behavior: "smooth", block: "start" });
  //   } else {
  //     console.error(`Element with ID ${elementId} not found`);
  //   }
  // };
  
  
  
  

  useEffect(() => {
    fetchUserData();
  }, []); 

  // useEffect(() => {
  //   if (courses.length > 0) {
  //     // Use setTimeout to delay the scroll just to give the DOM time to render
  //     setTimeout(() => {
  //       handleScroll(); // Scroll to the first course and title
  //     }, 1000); // Delay in milliseconds (adjust if needed)
  //   }
  // }, [courses]); // This triggers when courses are updated
  
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

  const showToast = (message?: string) => {
    toast.success(message ?? "Nothing passed.", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  
  const [shouldMove, setCondition] = useState(false);
  // Handle link click and store the selected course in localStorage
  const handleLinkClick = (courseIndex: number, titleIndex: number) => {
    const selectedCourse = courses[courseIndex];
    const selectedLink = links[courseIndex]?.linksArray[titleIndex];
    if (selectedCourse && selectedLink) {
      // Store the selected course and its link in localStorage
      const selectedData = selectedLink;
      localStorage.setItem('link', selectedData);
      showToast('Course ready, now click the book icon below to read!');
      setCondition(true);
    }
  };

  const divBadge = () => {
    setTimeout(()=>{
      setCondition(false);
    },1000);
    return (
      <div className="w-full absolute top-7 flex justify-center">
        <FontAwesomeIcon icon={faBook} className="rounded-full text-blue-700 shadow w-5 h-5  move-down dark:text-white">
        </FontAwesomeIcon>
      </div>
      
    );
  }

  const handleScrollToCourse = (courseTitle: string) => {
    const element = document.getElementById(courseTitle);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      console.error(`Element with title ${courseTitle} not found`);
    }
  };
  

  return (
    <div className="h-auto w-auto flex flex-col gap-5" id="page">
      {courses.length > 0 ? (
        courses.map((course, courseIndex) => (
          course.courseNames.map((title: string, titleIndex: number) => {
            // Check if this course is the one that should be highlighted (if the courseName is provided)
            const isSelected = courseName && course.code === courseName;
            return (
              <div
                className={`p-4 ${isSelected && !darkmode ? 'bg-blue-100' : isSelected && darkmode ? 'bg-gray-400' : ''}`} // Optional: apply a background if the course is selected
                key={titleIndex}
                onClick={() => handleLinkClick(courseIndex, titleIndex)}
               id={title}>
                <ListTile
                  leading={<FontAwesomeIcon icon={faBook} color={darkmode ? "white": "blue"} style={{ height: '25px' }} />}
                  title={title} // Display course title
                  subtitle={'Click to view'}
                  trailing={<FontAwesomeIcon icon={faAngleRight} className="dark:text-white"/>}
                  color={isSelected && !darkmode ? 'lightblue' : darkmode ? 'transparent' : isSelected && darkmode ? 'grey' : ''}
                
                />
              </div>
            );
          })
        ))
      ) : (
        <div className="flex justify-center items-center h-full">
          <Center>
            <CircularProgress />
          </Center>
        </div>
      )}
      <ToastContainer aria-label={undefined} />
      <button className="fixed top-20 right-5 rounded border-none animate-pulse bg-black p-2">
        <FontAwesomeIcon icon={faArrowDownLong} className="text-white" onClick={()=>{
          handleScrollToCourse(courses[2]?.courseNames[8]); // Pass the first course name here
          }}></FontAwesomeIcon>
      </button>
      {shouldMove && divBadge()}
    </div>
  );
};

export default DocumentPage;
