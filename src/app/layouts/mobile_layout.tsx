import { ReactNode, useState } from "react";
import { BottomNavigation, BottomNavigationAction, Fab, Box, Avatar } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBook, faGear, faHome,  faWallet } from "@fortawesome/free-solid-svg-icons";
import { faReadme } from "@fortawesome/free-brands-svg-icons";

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

    return (
        <>
            <div className="w-full h-screen flex flex-col">
                {/* Header */}
                <div className="fixed top-0 w-full h-16 p-2 flex justify-between bg-white z-20">
                    <h1 className="text-xl font-bold mt-3">
                        <FontAwesomeIcon icon={faBook} color="blue" className="ml-5" />
                          Library
                    </h1>
                    <Avatar className="mr-3 mt-2"/>
                </div>

                {/* Content Area */}
                <div className="flex-grow mt-20 overflow-y-auto mb-10">
                    <div className="w-full h-full">{children}</div>
                </div>

                {/* Bottom Navigation Bar */}
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
            </div>
        </>
    );
};

export default MobileLayout;
