/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAddData.ts
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebaseConfig";
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc, setDoc, getDoc, query, where } from "firebase/firestore";
import { createUserWithEmailAndPassword,  getAuth,  onAuthStateChanged,  signInWithEmailAndPassword,  UserCredential } from "firebase/auth";


interface AddDataParams {
  collectionName: string;
  data: Record<string, any>;
}

export const useAddData = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addData = async ({ collectionName, data }: AddDataParams) => {
    setLoading(true);
    setError(null);
    const user = getAuth().currentUser;
    if (!user) {
      setError("User is not authenticated.");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, collectionName), data);
      return { success: true, id: docRef.id };
    } catch (err) {
      setError("Failed to add data.");
      console.error(err);
      return { success: false, error: "Failed to add data." };
    } finally {
      setLoading(false);
    }
  };

  return { addData, loading, error };
};



interface FetchDataParams {
  collectionName: string;
}

export const useFetchData = () => {
  const [data, setData] = useState<any[]>([]);
  const [Loading, setLoading] = useState(true);
  const [errors, setError] = useState<string | null>(null);

  const fetchUserData = async ({ collectionName }: FetchDataParams) => {
    const user = getAuth().currentUser;
    if (!user) {
      setError("User is not authenticated.");
      return;
    }

    setLoading(true); // Start loading state

    try {
      // Create a query to filter data based on user UID
      const q = query(collection(db, collectionName), where("userId", "==", user.uid));

      const querySnapshot = await getDocs(q);
      const documents: any[] = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });

      setData(documents);
    } catch (err) {
      setError("Failed to fetch data.");
      console.error(err);
    } finally {
      setLoading(false); // End loading state
    }
  };

  return { data, Loading, errors, fetchUserData };
};



interface Props {
  collectionName: string;
  document: string;
}

export const useFetchUserData = () => {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async ({ collectionName }: Props) => {
    const user = getAuth().currentUser;
    if (!user) {
      setError("User is not authenticated.");
      return;
    }

    try {
      // Create a query to find the user's document in the collection
      const colRef = collection(db, collectionName);
      const q = query(colRef, where('userId', '==', user.uid));

      // Get the documents that match the query
      const querySnapshot = await getDocs(q);

      // If a document is found, set the data
      if (!querySnapshot.empty) {
        // Assuming you expect only one document for the user
        const doc = querySnapshot.docs[0];
        setData(doc.data());
      } else {
        // If no document is found, reset data
        setData(null);
      }
    } catch (e: any) {
      // Handle errors during the fetch
      setError(e.message || "An error occurred while fetching data.");
    }
  };

  return { data, error, fetchData };
};

interface UpdateDataParams {
    collectionName: string;
    docId: string;
    data: Record<string, any>;
  }

export const useUpdateData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const updateData = async ({ collectionName, docId, data }: UpdateDataParams) => {
      setLoading(true);
      setError(null);
  
      try {
        const docRef = doc(db, collectionName, docId);
        await updateDoc(docRef, data);
        return { success: true };
      } catch (err) {
        setError("Failed to update data.");
        console.error(err);
        return { success: false, error: "Failed to update data." };
      } finally {
        setLoading(false);
      }
    };
  
    return { updateData, loading, error };
  };

  interface DeleteDataParams {
    collectionName: string;
    docId: string;
  }
  
  export const useDeleteData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    const deleteData = async ({ collectionName, docId }: DeleteDataParams) => {
      setLoading(true);
      setError(null);
  
      try {
        const docRef = doc(db, collectionName, docId);
        await deleteDoc(docRef);
        return { success: true };
      } catch (err) {
        setError("Failed to delete data.");
        console.error(err);
        return { success: false, error: "Failed to delete data." };
      } finally {
        setLoading(false);
      }
    };
  
    return { deleteData, loading, error };
  };

  

  // Type for user data
interface UserData {
    name: string;
    email: string;
    password: string;
    level:number;
  }
  
  export const useCreateUser = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean | null>(null);
    const [currentTime, setCurrentTime] = useState(0);
  
    const addUser = async ({ name, email, password, level }: UserData) => {
      setLoading(true);
      setError(null);
      setSuccess(null);
  
      try {
        // Create the user with email and password
        const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // Once the user is created, you can add additional information to Firestore
        const user = userCredential.user;
  
        // Adding user data to Firestore (you can customize the collection name and fields)
        await setDoc(doc(db, "users", user.uid), {
          userId:user.uid,
          name,
          email,
          level,
          currentTime,
          createdAt: new Date(),
        });
  
        // Successfully created the user
        setSuccess(true);
        return { success: true };
      } catch (err) {
        setError("Failed to create user.");
        console.error(err);
        return { success: false, error: "Failed to create user." };
      } finally {
        setLoading(false);
      }
    };
  
    return { addUser, loading, error, success };
  };

  interface SignInData {
    email: string;
    password: string;
  }
  
  export const useSignIn = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<any | null>(null);  // Store the signed-in user
  
    const signIn = async ({ email, password }: SignInData) => {
      setLoading(true);
      setError(null);
  
      try {
        const userCredential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Set the signed-in user
        setUser(userCredential.user);
        
        // Successfully signed in
        return { success: true, user: userCredential.user };
      } catch (err) {
        setError("Failed to sign in.");
        console.error(err);
        return { success: false, error: "Failed to sign in." };
      } finally {
        setLoading(false);
      }
    };
  
    return { signIn, loading, error, user };
  };

export const useSaveUser = () => {
  const [amount, setAmount] = useState<number>(0);

  const saveUserAmount = async () => {
    const docRef = doc(db, 'paid', 'userAmount'); // Reference to the document in Firestore
    
    try {
      const getData = await getDoc(docRef); // Get the document from Firestore

      if (getData.exists()) {
        const data = getData.data();
        if (data && data.amount !== undefined) {
          setAmount(data.amount); // Set the amount from the document if it exists
        }
      } else {
        console.log('Document does not exist, setting to 0');
        setAmount(0);
        
        // Set the document with initial amount of 0 if it doesn't exist
        await setDoc(docRef, { amount: 0 }); // Ensure it's saved as an object
      }

      // Increment the amount by 1
      await updateDoc(docRef, {
        amount: amount + 1, // Increment the current amount by 1
      });

      // Update local state (to reflect the new increment immediately)
      setAmount((prevAmount) => prevAmount + 1);
    } catch (e) {
      console.log('Error while saving user amount:', e);
    }
  };

  return { amount, saveUserAmount };
};
