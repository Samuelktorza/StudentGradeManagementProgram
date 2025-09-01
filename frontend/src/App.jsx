import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import { Container } from "@mui/material";
import Sidebar from "./Sidebar"; // Import the Sidebar component

function App(props) {
    return (
        <div className="app-layout">
            <Sidebar /> {/* Sidebar on the left */}
            <Container className="main-content">
                {/* eslint-disable-next-line react/prop-types */}
                {props.children} {/* Main content area */}
            </Container>
        </div>
    );
}

export default App;