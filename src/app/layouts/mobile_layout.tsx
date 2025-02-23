/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useCallback, useEffect, useState } from "react";
import { BottomNavigation, BottomNavigationAction, Fab, Box, Avatar } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faChevronCircleRight, faClose, faComputer, faGear, faHome, faLock, faMoon, faSignOut, faSun, faWallet } from "@fortawesome/free-solid-svg-icons";
import { faReadme } from "@fortawesome/free-brands-svg-icons";
import { blue, red } from "@mui/material/colors";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Divider, Drawer, List, ListItem, ListItemIcon, ListItemText, Typography } from "@mui/material"
import ListTile from "../components/list_tile";
import { toast, ToastContainer } from "react-toastify";


interface Props {
    children?: ReactNode;
    home?: () => void;
    subscription?: () => void;
    library?: () => void;
    settings?: () => void;
    read?: () => void;
}

export const MobileLayout: React.FC<Props> = ({
    children,
    home,
    subscription,
    settings,
    library,
    read,
}) => {
    const [value, setValue] = useState(0);
    const [popper, showPop] = useState(false);
    const [name, setName] = useState('');
    const [userID, setUserID] = useState<any>(null);
    const [expiryDate, setExpiryDate] = useState<Date | null>(null);
    const [isExpired, setIsExpired] = useState(false);
    const [email, setUserEmail] = useState('');

    // Fetch user name from Firestore based on user ID
    const FetchName = async () => {
        if (userID?.uid) {
            const queryData = query(collection(db, 'users'), where('userId', '==', userID.uid));
            const dataRef = await getDocs(queryData);
            const fetchedData: any = dataRef.docs[0]?.data(); // Handle if docs is empty
            if (fetchedData) {
                setName(fetchedData.name);
                setUserEmail(fetchedData.email);
            }
        }
    };

    // Fetch expiry date for subscription
    const fetchExpiryDate = useCallback(async () => {
        if (userID?.uid) {
            const userRef = doc(db, 'users', `${userID.uid}`);
            const docSnap = await getDoc(userRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return data.expiry.toDate();
            }
        }
        return null;
    }, [userID?.uid]);

    // On auth state change (login/logout)
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserID(user);
            } else {
                setUserID(null);
                setName('');
            }
        });

        return () => unsubscribe();
    }, []);

    // Fetch name and expiry date once userID is set
    useEffect(() => {
        if (userID?.uid) {
            FetchName();
            const fetchData = async () => {
                const expiry = await fetchExpiryDate();
                if (expiry) {
                    setExpiryDate(expiry);
                    setIsExpired(new Date() > expiry);
                }
            };
            fetchData();
        }
    }, [userID, fetchExpiryDate]);
   

    const Pop = () => {
        return (
            <div
                className="rounded p-3 w-auto h-auto flex justify-center items-center gap-3 shadow-xll fixed top-5 right-20 z-40 bg-white"
                onClick={() => {
                    window.location.href = '/#';
                }}
            >
                <p className="text-black">Log out</p>
                <FontAwesomeIcon icon={faSignOut}></FontAwesomeIcon>
            </div>
        );
    };
    const showToast = (message?: string) => {
        toast.success(message ?? "Nothing passed.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      };
      const showToastW = (message?: string) => {
        toast.warning(message ?? "Nothing passed.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      };

      //Darkmode
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
    
    const handleClick = (index: number) => {
        if(index === 0){
            showToastW('This item is locked');
        }else if(index === 1){
            showToastW('This item is locked');
        }else if(index === 2){
            window.location.href = '/#';
        }
    }
    const sidebar = () => {
        return (
            <div
            className={`w-72 h-screen shadow-xl fixed top-0 z-20 bg-white transition-all duration-300 ease-in-out flex justify-start dark:bg-transparent`}
            style={{
                left: popper ? '0' : '-100%',
                backdropFilter: darkmode ? 'blur(15px)' : ''
            }}
            >
            <div className="flex flex-col gap-2 h-40 w-full absolute shadow-xll" style={{
                borderBottom:'1px solid rgba(0,0,0,0.1)'
            }}>
                <div className="flex flex-col justify-start p-5 gap-1">
                <div className="rounded-full w-20 h-20 flex justify-center items-center" style={{
                    border:'1px solid blue'
                }}>
                    <h1 className="font-bold text-blue-700 animate-pulse text-3xl dark:text-white">{name[0]}</h1>
                </div>
                <h6 className="dark:text-white">{name}</h6>
                <small className="dark:text-white">{email}</small>
                </div>
            </div>

            <div className="flex flex-col justify-evenly h-40 absolute top-44 gap-4 w-full p-2">
                {Array.from({length:3}).map((_,index) => 
                <div key={index} onClick={() => handleClick(index)}>
                    <ListTile title={index === 0 ? 'Quzzies' : index 
                        === 1 ? 'Assignments' : index === 2 ? 'Log out' : ''
                        
                    } leading={index === 0 ? <FontAwesomeIcon icon={faComputer} color="blue"/>: index 
                    === 1 ? <FontAwesomeIcon icon={faBook} color="blue"/> : index === 2 ? <FontAwesomeIcon icon={faSignOut} color="blue"/>
                    : null
                    
                } trailing={index === 0 ? <FontAwesomeIcon icon={faLock}/> : index === 1 ? <FontAwesomeIcon icon={faLock}/> :  null}
                className="h-auto w-full p-4 flex justify-between items-center shadow-xll rounded-xl"
                 subtitle={index === 0 ? '' : index === 1 ? 'Coming soon' : index === 2 ? '' : ''}
                 /></div>
                )}
            </div>
            
        </div>
        );
    }

    const toggleDarkMode = () => {
        const newTheme = darkmode ? 'light' : 'dark';
        document.documentElement.classList.remove(darkmode ? 'dark' : 'light');
        document.documentElement.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        setDarkmode(newTheme === 'dark');
        window.location.reload();
    };

    return (
        <>
            <div
                className="w-full h-screen flex flex-col dark:bg-black"
                style={{
                    backgroundImage: darkmode ?'url("/avatar/forest.jpg")':'url("/avatar/bg5.jpg")',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Header */}
                <div className="fixed top-0 w-full h-12 p-1 flex justify-between z-20">
                    <h1 className="text-xl font-bold mt-3 dark:text-white">
                        <FontAwesomeIcon icon={faBook} color={darkmode ? 'white': "blue"} className="ml-5" /> 
                         Library
                    </h1>
                    <div className="flex justify-center items-center gap-4">
                    <FontAwesomeIcon icon={!darkmode ? faSun : faMoon} style={{
                        height:'20px'
                    }} className="relative top-1 dark:text-white" onClick={() => toggleDarkMode()}></FontAwesomeIcon>
                    <Avatar
                        className="mr-3 mt-2"
                        onClick={() => {
                            showPop(prev => !prev);
                        }}
                        sx={{ bgcolor: popper ? red[200] : blue[500] }}
                    style={{
                        height:'25px',
                        width:'25px'
                    }}>
                        {popper ? <FontAwesomeIcon icon={faClose} /> : name[0]}
                    </Avatar>
                    </div>
                    
                </div>

                {/* Content Area */}
                <div className="flex-grow mt-16 overflow-y-auto mb-10">
                    <div className="w-full h-full">{children}</div>
                </div>

                {/* Bottom Navigation Bar */}
                {!isExpired && (
                    <Box sx={{ position: 'relative' }}>
                        <BottomNavigation
                            value={value}
                            onChange={(event, newValue) => setValue(newValue)}
                            showLabels
                            sx={{
                                position: 'fixed',
                                bottom: 0,
                                left: 0,
                                width: '100%',
                                boxShadow: 3,
                                zIndex: 1,
                                borderTopLeftRadius: '30px',
                                borderTopRightRadius: '30px',
                                backgroundColor: darkmode ? 'transparent' : 'white',
                                color: darkmode ? 'white' : 'black',  // Change text color based on darkmode
                                backdropFilter: darkmode ? 'blur(10px)' : ''
                            }}
                        >
                            <BottomNavigationAction
                                label="Home"
                                icon={<FontAwesomeIcon icon={faHome} onClick={home} />}
                                sx={{
                                    color: darkmode ? 'white' : 'black', // Icon color based on darkmode
                                  }}
                            />
                            <BottomNavigationAction
                                label="Library"
                                icon={<FontAwesomeIcon icon={faBook} onClick={library} />}
                                sx={{
                                    color: darkmode ? 'white' : 'black', // Icon color based on darkmode
                                  }}
                            />
                            <BottomNavigationAction
                                label="Payment"
                                icon={<FontAwesomeIcon icon={faWallet} onClick={subscription} />}
                                sx={{
                                    color: darkmode ? 'white' : 'black', // Icon color based on darkmode
                                  }}
                            />
                            <BottomNavigationAction
                                label="Settings"
                                icon={<FontAwesomeIcon icon={faGear} onClick={settings} />}
                                sx={{
                                    color: darkmode ? 'white' : 'black', // Icon color based on darkmode
                                  }}
                            />
                        </BottomNavigation>

                        {/* Floating Action Button */}
                        <Fab
                            color={darkmode ? "inherit" : "primary"}
                            aria-label="add"
                            sx={{
                                position: 'fixed',
                                bottom: 20,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                zIndex: 2,
                            }}
                        >
                            <FontAwesomeIcon icon={faReadme} onClick={read} />
                        </Fab>
                    </Box>
                )}
                {sidebar()}
                <ToastContainer aria-label={undefined} />
            </div>
        </>
    );
};
