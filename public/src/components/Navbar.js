import React, {useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {FaBars, FaTimes} from 'react-icons/fa';
import { FaFire } from "react-icons/fa";
import { Button } from './Button';
import './Navbar.css';
import {IconContext} from 'react-icons/lib';
import { AuthPane } from './AuthPane';

export default function Navbar() {
  const [isPaneOpen, setIsPaneOpen] = useState(false);
  const togglePane = () => {
    setIsPaneOpen(!isPaneOpen);
  };


  const [click, setClick] = useState(false);
  const [button, setButton] = useState(true)
  const handleClick = () => setClick(!click);
  const closeMobileMenu = () => setClick(false)
  const showButton = () => {
    if(window.innerWidth <= 960)
    {
        setButton(false)
    }
    else{
        setButton(true)
    }
  }

  useEffect(() => {
    showButton();
  }, []);


  window.addEventListener('resize', showButton);
 

  return (
    <>
    <IconContext.Provider value={{color: '#A9423F'}}>
     <div className="navbar">
       <div className = "navbar-container container">
        <Link to='/' className = "navbar-logo" onClick={closeMobileMenu}>
            <FaFire className = 'nav-bar icon' />
         BLAZE
        </Link>
        <div className = "menu-icon" onClick={handleClick}>
            {click ? <FaTimes/> : <FaBars/>}
        </div> 
        <ul className={click ? 'nav-menu active' : 'nav-menu'} onClick={closeMobileMenu}>
        <li className = "nav-item">
            <Link to='/' className="nav-links">
                Home
            </Link>
          </li>
          <li className = "nav-item">
            <Link to='/' className="nav-links">
                Dashboard
            </Link>
          </li>
          <li className = "nav-item">
            <Link to='/services' className="nav-links" onClick={closeMobileMenu}>
               Admin Panel
            </Link>
          </li>
          <li className = "nav-item">
            <Link to='/products' className="nav-links" onClick={closeMobileMenu}>
             Settings
            </Link>
          </li>
       
          <li className = "nav-btn">
           {button ? (
            <Link to= '/sign-up' className="btn-link" >

               <Button buttonStyle='btn--outline'>SIGN UP</Button>
            </Link>

           ): (
            <Link className = "btn-link">
                <Button buttonStyle = 'btn--outline' buttonSize='btn--mobile'> SIGN UP</Button>
            </Link>
           )}
          </li>

          <li className = "nav-btn">

               <Button buttonStyle='btn--outline' onClick={togglePane}>Test</Button>
               <AuthPane isOpen={isPaneOpen} setIsOpen={setIsPaneOpen} />
          </li>



        </ul>
       </div>
     </div>
     </IconContext.Provider>
    </>
  );
}
