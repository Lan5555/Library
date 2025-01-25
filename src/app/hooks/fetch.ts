/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig"; // Ensure this path is correct
import { getAuth } from "firebase/auth";

// Define types for course and link data
interface Course {
  code: string;
  courseTitles: string[];
}

interface Links {
  [key: string]: string[]; // Links for each course code
}

export const useFetchUserCoursesWithLinks = () => {
  const [level, setLevel] = useState<number | null>(null); // User's level
  const [courses, setCourses] = useState<{ [key: string]: string[] }>({}); // Store courses by code
  const [links, setLinks] = useState<Links>({}); // Store links for each course
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // Fetch the current user and their level
  useEffect(() => {
    const fetchUserLevel = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = getAuth().currentUser;
        if (!user) {
          setError("User is not authenticated.");
          return;
        }

        const userQuery = query(collection(db, "users"), where("userId", "==", user.uid));
        const userSnapshot = await getDocs(userQuery);

        if (!userSnapshot.empty) {
          const userData = userSnapshot.docs[0].data();
          const userLevel = userData.level;
          setLevel(userLevel); // Set the user's level
        } else {
          setError("User not found in the database.");
        }
      } catch (err: any) {
        setError(err.message || "Error fetching user level.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserLevel();
  }, []); // Runs only once when the component mounts

  // Fetch courses and links based on user's level
  useEffect(() => {
    if (level === null) return; // If level is not yet set, skip fetching courses and links

    const fetchCoursesAndLinks = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch courses for the current level (level: 100 or level: 200, etc.)
        const coursesQuery = query(collection(db, `level: ${level}`)); // Fetch courses from the relevant level collection
        const coursesSnapshot = await getDocs(coursesQuery);

        if (!coursesSnapshot.empty) {
          const fetchedCourses: { [key: string]: string[] } = {};

          coursesSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const courseCode = data.code; // The course code (e.g., "MTH")
            const courseTitles = data.courseTitles || []; // Array of course titles (e.g., ["MTH 209", "MTH 203"])

            if (courseCode) {
              fetchedCourses[courseCode] = courseTitles;
            }
          });

          setCourses(fetchedCourses);
          console.log("Fetched Courses:", fetchedCourses); // Log the fetched courses
        } else {
          setError("No courses found for this level.");
        }

        // Fetch links for the current level
        const linksQuery = query(collection(db, `links: ${level}`)); // Fetch links from the links collection
        const linksSnapshot = await getDocs(linksQuery);

        if (!linksSnapshot.empty) {
          const fetchedLinks: Links = {};

          linksSnapshot.docs.forEach((doc) => {
            const data = doc.data();
            const courseCode = data.code; // Assuming each document has a 'code' field
            const courseLinks = data.respectiveLinks || []; // Array of links

            if (courseCode) {
              fetchedLinks[courseCode] = courseLinks;
            }
          });

          setLinks(fetchedLinks);
          console.log("Fetched Links:", fetchedLinks); // Log the fetched links
        } else {
          setError("No links found for this level.");
        }
      } catch (err: any) {
        setError(err.message || "Error fetching courses or links.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesAndLinks();
  }, [level]); // Runs every time the user's level is updated

  return { loading, error, courses, links };
};
