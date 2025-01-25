/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'; // If using Next.js, otherwise you can remove this

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ListTile from "../components/list_tile";
import { faAngleRight, faBook } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/ReactToastify.css'; // Import the Toastify CSS
import { useFetchData } from "../hooks/firebase";

interface Props {
  courseName?: string;
}

interface CoursesLinks {
  [key: string]: string[];
}

const DocumentPage: React.FC<Props> = ({ courseName = 'CSC201' }) => {
  const [level, setLevel] = useState<number | null>(null);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [links, setLinks] = useState<CoursesLinks>({});
  const { data: dataItem, Loading: loading1, errors: error1, fetchUserData: fetchLevel } = useFetchData();
  const { data: dataItem2, Loading: loading2, errors: error2, fetchUserData: fetchCourses } = useFetchData();

  // Fetch user level data
  useEffect(() => {
    fetchLevel({ collectionName: 'users' });

    // Ensure we correctly extract the level from the data
    if (dataItem && dataItem.length > 0) {
      // Assuming each item in dataItem is a user, find the current user's level
      // You might need to adjust this if you have a specific field to identify the user
      const user = dataItem.find((user: any) => user.isCurrentUser); // Use your logic to identify the current user
      if (user) {
        setLevel(user.level); // Assuming the user object contains the 'level' property
      }
    }
  }, [fetchLevel, dataItem]);

  // Fetch courses based on user level
  useEffect(() => {
    if (level === null) return; // Avoid fetching before level is set

    const collectionName = `level: ${level}`;
    fetchCourses({ collectionName });
  }, [fetchCourses, level]);

  // Populate courses and links once course data is fetched
  useEffect(() => {
    if (dataItem2 && dataItem2.length > 0) {
      const courses: { [key: string]: string[] } = {};
      const links: { [key: string]: string[] } = {};

      // Assuming dataItem2 contains course names and links
      dataItem2.forEach((item: any) => {
        if (item.courseName && item.links) {
          courses[item.courseName] = item.courseFiles || [];
          links[item.courseName] = item.links || [];
        }
      });

      setSelectedCourses(courses[courseName] || []);
      setLinks(links);
    }
  }, [dataItem2, courseName]);

  const showSuccessToast = (message?: string) => {
    toast.success(message ?? "Success! Now Click the button at the center below to read.", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
    });
  };

  const handleLinkClick = (index: number) => {
    const selectedLink = links[courseName]?.[index];
    if (selectedLink) {
      showSuccessToast();
      localStorage.setItem('link', selectedLink);
    }
  };

  return (
    <div className="h-auto w-auto flex flex-col gap-5">
      {selectedCourses.length > 0 ? (
        selectedCourses.map((element, index) => (
          <div className="p-4" key={index} onClick={() => handleLinkClick(index)}>
            <ListTile
              leading={<FontAwesomeIcon icon={faBook} color="blue" style={{ height: '25px' }} />}
              title={element}
              subtitle={'Click to view'}
              trailing={<FontAwesomeIcon icon={faAngleRight} onClick={() => handleLinkClick(index)} />}
            />
          </div>
        ))
      ) : (
        <div className="text-center">No courses available for the selected level.</div>
      )}
      <ToastContainer aria-label={undefined} />
    </div>
  );
};

export default DocumentPage;

