// Sidebar.js
import React from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser } from '@fortawesome/free-solid-svg-icons';
import '../App.css'
const Sidebar = ({children}) => {
    return (
        <div className="container-fluid">
            <div className="row flex-nowrap">
                <div className="col-auto col-md-3 col-xl-2 px-sm-2 px-0 bg-dark">
                    <div className="d-flex flex-column align-items-center align-items-sm-start px-3 pt-2 text-white min-vh-100 justify-content-center">
                        <a href="/" className="d-flex align-items-center pb-3 mb-md-0 me-md-auto text-white text-decoration-none">
                            <span className="fs-5 d-none d-sm-inline">&lt;&lt; Back</span>
                        </a>
                        <hr className="my-4 text-white"/>
                        <ul className="nav flex-column mb-sm-auto mb-0 align-items-center align-items-sm-start w-100 d-flex justify-content-center" id="menu">
                            <li className='w-100 d-flex justify-content-center '>
                                <a href="/profile" className="nav-link px-0 align-middle menu-items">
                                <FontAwesomeIcon icon={faUser} size='2x'/> <span className="ms-1 d-none d-sm-inline" style={{fontSize:'20px'}}>&nbsp;Profile</span> </a>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="col py-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
