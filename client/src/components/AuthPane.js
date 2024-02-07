import React, { useState } from "react";
import SlidingPane from "react-sliding-pane";
import "react-sliding-pane/dist/react-sliding-pane.css";
import './AuthPane.css';
import { FaCheck, FaTimes } from 'react-icons/fa'; 


export const AuthPane = ({
  isOpen,
  setIsOpen,
  location = "Building A", // Default parameter for location
  time = "12:34 PM", // Default parameter for time
  room = "101" // Default parameter for room
}) => {
  const handleAuthResponse = (response) => {
    console.log(`User response: ${response}`);
    setIsOpen(false); // Close the pane after response
  };

  return (
    <SlidingPane
      className="some-custom-class"
      overlayClassName="some-custom-overlay-class"
      isOpen={isOpen}
      title="Authentication Request"
      onRequestClose={() => setIsOpen(false)}
      from="bottom"
      width="100vw"
      style={{
        position: 'fixed',
        bottom: 0,
        height: '100vh',
        width: '100vw',
        maxWidth: '100%',
        backgroundColor: '#363F44',
      }}
    >
      <div className="auth-content">
        <div className="profile-picture"></div>
        <div className="auth-question">Did a fire occur?</div>
        <div className="auth-details">
          Location: {location}<br/>
          Time: {time}<br/>
          Room: {room}
        </div>
        <div className="response-buttons">
          <button onClick={() => handleAuthResponse('Yes')} className="yes-button">
            <FaCheck /> Yes
          </button>
          <button onClick={() => handleAuthResponse('No')} className="no-button">
            <FaTimes /> No
          </button>
        </div>
      </div>
    </SlidingPane>
  );
};