/* eslint-disable @typescript-eslint/no-unused-vars */
import { faEye, faEyeSlash, faKey, faLock } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Button } from "@mui/material";
import { useState } from "react";
import Hover from "../pages/hovering";

const BottomSheet: React.FC = () => {
  const [isVisible, setVisible] = useState(false); // This state controls the visibility of the bottom sheet
  const [isPasswordVisible, setPasswordVisible] = useState(false); // This state controls the visibility of the password input field

  // This function is triggered when the hover component is pressed
  const handleHoverPress = (index: number) => {
    if (index === 0) {
      setVisible(true); // Show the bottom sheet
    }
  };

  // This function handles the closing of the bottom sheet
  const handleClose = () => {
    setVisible(false); // Hide the bottom sheet
  };

  return (
    <div>
      {/* Trigger for bottom sheet */}
      {!isVisible && (
        <div className="flex justify-evenly">
            <p className="animate-pulse dark:text-white text-black absolute right-5 bottom-2">Passkey?</p>
        <Hover items={[faKey]} onPressed={handleHoverPress}></Hover>
        </div>
      )}

      {/* Bottom sheet content */}
      <div
        className="bg-white shadow-xll w-full h-[50vh] z-40 flex justify-center items-center p-2 flex-col gap-8"
        style={{
          position: "fixed",
          bottom: isVisible ? "0" : "-100%", // Use -100% to move it off-screen
          left: 0,
          right: 0,
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          transition: "bottom 0.3s ease-in-out", // Smooth transition for sliding in/out
          maxHeight: "50vh", // Ensure it doesn't overflow vertically
          overflowY: "auto", // Handle potential content overflow inside the sheet
        }}
      >
        {/* Close button */}
        <div
          className="w-10 h-1 bg-black rounded absolute top-3 cursor-pointer"
          onClick={handleClose}
        ></div>

        {/* Bottom sheet content */}
        <h1 className="text-xl font-bold animate-pulse text-blue-600">Sign in with pass key</h1>

        <form className="flex justify-evenly flex-col gap-7">
          <div className="rounded bg-slate-200 p-2 w-80 relative flex">
            <FontAwesomeIcon
              icon={faLock}
              color="blue"
              className="absolute top-3 left-4"
              style={{
                height: "20px",
              }}
            ></FontAwesomeIcon>
            <input
              type={isPasswordVisible ? "text" : "password"}
              className="bg-transparent w-full outline-none p-1 pl-11 pr-10 placeholder:text-black"
              placeholder="Enter key"
              required
            ></input>
            <FontAwesomeIcon
              icon={isPasswordVisible ? faEye : faEyeSlash}
              color="blue"
              className="absolute right-3 top-4"
              style={{
                height: "20px",
              }}
              onClick={() => setPasswordVisible((prev) => !prev)}
            ></FontAwesomeIcon>
          </div>
          <Button variant={"contained"} type="submit">
            Submit
          </Button>
        </form>

        <h3>Input your premium Pass key!</h3>
      </div>
    </div>
  );
};

export default BottomSheet;
