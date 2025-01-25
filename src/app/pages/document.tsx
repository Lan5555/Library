/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ListTile from "../components/list_tile";
import { faAngleRight, faBook } from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect, SetStateAction } from "react";
import { ToastContainer, toast } from "react-toastify";
import { getAuth } from "firebase/auth"; // Firebase Authentication
import { db } from "../../../firebaseConfig"; // Your Firebase DB initialization
import { query, collection, where, getDocs } from "firebase/firestore"; // Firebase Firestore methods
import Center from "../hooks/center";
import { CircularProgress } from "@mui/material";

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
              newCourses.push({
                code,
                courseNames, // Array of course titles
              });
            } else {
              console.warn('Document data is undefined or empty');
            }
          });
        } else {
          console.warn('No documents found for this level');
        }

        setCourses(newCourses);

        if (!linksQuery.empty) {
          linksQuery.forEach((doc) => {
            const data = doc.data();
            if (data) {
              const codeName = data.links.code;
              const courseLinks = data.links.respectiveLinks;

              const linksArray = courseLinks ? Object.values(courseLinks) : [];
              newLinks.push({
                codeName,
                linksArray, // Array of links for each course
              });
            } else {
              console.warn('Document data is undefined or empty');
            }
          });
        } else {
          console.warn('No documents found for this level');
        }

        setLinks(newLinks);
      } else {
        console.error('User data not found');
      }
    } catch (e) {
      console.error('Error fetching user data:', e);
    }
  };

  useEffect(() => {
    fetchUserData();
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

  // Filter courses based on the courseName prop
  const filteredCourses = courses.filter(course => course.code === courseName);

  // Handle link click and store the selected course in localStorage
  const handleLinkClick = (courseIndex: number, titleIndex: number) => {
    const selectedCourse = courses[courseIndex];
    const selectedLink = links[courseIndex]?.linksArray[titleIndex];

    if (selectedCourse && selectedLink) {
      // Store the selected course and its link in localStorage
      const selectedData = selectedLink;
      alert(selectedLink);
      localStorage.setItem('link',selectedData);
      showToast('Course ready now clicked the icon below to read!')
    }
  };

  // Render the selected course's titles and links
  return (
    <div className="h-auto w-auto flex flex-col gap-5">
      {filteredCourses.length > 0 ? (
        filteredCourses.map((course, courseIndex) => (
          course.courseNames.map((title: string, titleIndex: number) => (
            <div className="p-4" key={titleIndex} onClick={() => handleLinkClick(courseIndex, titleIndex)}>
              <ListTile
                leading={<FontAwesomeIcon icon={faBook} color="blue" style={{ height: '25px' }} />}
                title={title} // Display course title
                subtitle={'Click to view'}
                trailing={<FontAwesomeIcon icon={faAngleRight} />}
                // Handle link click
              />
            </div>
          ))
        ))
      ) : (
        <div className="flex justify-center items-center h-full">
          <Center>
            <CircularProgress/>
          </Center>
        </div>
      )}
      <ToastContainer aria-label={undefined} />
    </div>
  );
};

export default DocumentPage;
