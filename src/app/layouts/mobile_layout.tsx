/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode, useCallback, useEffect, useState } from "react";
import { BottomNavigation, BottomNavigationAction, Fab, Box, Avatar } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faGear, faHome, faSignOut, faWallet } from "@fortawesome/free-solid-svg-icons";
import { faReadme } from "@fortawesome/free-brands-svg-icons";
import { blue } from "@mui/material/colors";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { getAuth, onAuthStateChanged } from "firebase/auth";

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

    // Fetch user name from Firestore based on user ID
    const FetchName = async () => {
        if (userID?.uid) {
            const queryData = query(collection(db, 'users'), where('userId', '==', userID.uid));
            const dataRef = await getDocs(queryData);
            const fetchedData: any = dataRef.docs[0]?.data(); // Handle if docs is empty
            if (fetchedData) {
                setName(fetchedData.name);
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

    return (
        <>
            <div
                className="w-full h-screen flex flex-col"
                style={{
                    backgroundImage: 'url("/avatar/bg5.jpg")',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    backgroundRepeat: 'no-repeat',
                }}
            >
                {/* Header */}
                <div className="fixed top-0 w-full h-12 p-1 flex justify-between z-20">
                    <h1 className="text-xl font-bold mt-3">
                        <FontAwesomeIcon icon={faBook} color="blue" className="ml-5" />
                        Library
                    </h1>
                    <Avatar
                        className="mr-3 mt-2"
                        onClick={() => {
                            showPop((prev) => !prev);
                        }}
                        sx={{ bgcolor: blue[500] }}
                    >
                        {name[0]}
                    </Avatar>
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
                            }}
                        >
                            <BottomNavigationAction
                                label="Home"
                                icon={<FontAwesomeIcon icon={faHome} onClick={home} />}
                            />
                            <BottomNavigationAction
                                label="Library"
                                icon={<FontAwesomeIcon icon={faBook} onClick={library} />}
                            />
                            <BottomNavigationAction
                                label="Payment"
                                icon={<FontAwesomeIcon icon={faWallet} onClick={subscription} />}
                            />
                            <BottomNavigationAction
                                label="Settings"
                                icon={<FontAwesomeIcon icon={faGear} onClick={settings} />}
                            />
                        </BottomNavigation>

                        {/* Floating Action Button */}
                        <Fab
                            color="primary"
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
                {popper && <Pop />}
            </div>
        </>
    );
};
