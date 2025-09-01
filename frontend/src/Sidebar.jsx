import React from 'react';
import { Link } from "react-router-dom";
import './Sidebar.css';
import ReactLogo from './assets/react.svg'; // Update the path based on your file structure

const Sidebar = () => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <img src={ReactLogo} alt="Logo" className="sidebar-logo" />
                <h1 className="sidebar-title">SGMS</h1>
            </div>
            <div className="sidebar-menu">
                <Link to="/" className="sidebar-item">
                    <span className="material-icons">home</span>
                    <span className="sidebar-text">Home</span>
                </Link>
                <Link to="/students" className="sidebar-item">
                    <span className="material-icons">people</span>
                    <span className="sidebar-text">Students</span>
                </Link>
                <Link to="/modules" className="sidebar-item">
                    <span className="material-icons">event</span>
                    <span className="sidebar-text">Modules</span>
                </Link>
                <Link to="/insights" className="sidebar-item">
                    <span className="material-icons">show_chart</span>
                    <span className="sidebar-text">Insights</span>
                </Link>
            </div>
        </div>
    );
};

export default Sidebar;
