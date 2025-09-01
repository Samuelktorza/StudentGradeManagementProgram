import React from "react";
import axios from "axios";
import {Paper, TextField, Button, Typography, Alert, Breadcrumbs, Box} from "@mui/material";
import { API_ENDPOINT } from "../config";
import App from "../App";
import {Link, useLocation} from "react-router-dom";

function AddStudent(props) {

    const location = useLocation();
    const existingStudent = location.state?.student || null;

    const [student, setStudent] = React.useState({
        id: existingStudent ? existingStudent.id : "",
        username: existingStudent ? existingStudent.username : "",
        email: existingStudent ? existingStudent.email : "",
        firstName: existingStudent ? existingStudent.firstName : "",
        lastName: existingStudent ? existingStudent.lastName : ""
    });
    const [error, setError] = React.useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setStudent((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    function request() {
        if (!student.id || !student.username || !student.email || !student.firstName || !student.lastName) {
            setError("Please fill in all required fields.");
            return;
        }
        console.log("Sending student data:", student);
        axios
            .post(`${API_ENDPOINT}/students`, student)
            .then(() => {
                //update();
                setStudent({ id: "", username: "", email: "", firstName: "", lastName: "" });
                setError(null);
            })
            .catch((error) => {
                console.error("Error adding student", error);
                setError(error.response?.data?.message || "Error adding student");
            });
    }

    return (
        <App>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
                <Breadcrumbs separator="›" aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" to="/" style={{ textDecoration: 'none', fontWeight: 500, color: '#2c3e50' }}>
                        Home
                    </Link>
                    <Link underline="hover" color="inherit" to="/students" style={{ textDecoration: 'none', fontWeight: 500, color: '#2c3e50' }}>
                        Students
                    </Link>
                    <Typography sx={{ color: "text.primary", fontWeight: "bold" }}>Add/Update Student</Typography>
                </Breadcrumbs>
            </Box>
            <Paper sx={{ padding: "30px", borderRadius: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50', mb: 3 }}>Add/Update Student</Typography>
                <TextField
                    required
                    label="Student ID"
                    name="id"
                    value={student.id}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    sx={{ mb: 2 }}
                />
                <TextField
                    required
                    label="Username"
                    name="username"
                    value={student.username}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    sx={{ mb: 2 }}
                />
                <TextField
                    required
                    label="Email"
                    name="email"
                    value={student.email}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    inputProps={{
                        pattern: "[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$",
                        title: "Please enter a valid email address"
                    }}
                    sx={{ mb: 2 }}
                />
                <TextField
                    required
                    label="First Name"
                    name="firstName"
                    value={student.firstName}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    sx={{ mb: 2 }}
                />
                <TextField
                    required
                    label="Last Name"
                    name="lastName"
                    value={student.lastName}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    sx={{ mb: 2 }}
                />
                <Button
                    variant="contained"
                    onClick={request}
                    disabled={!student.id || !student.username || !student.email || !student.firstName || !student.lastName}
                    sx={{ 
                        mt: 3,
                        bgcolor: 'primary.main',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                        },
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 3,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    Add/Update
                </Button>
                {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
            </Paper>
        </App>
    );
}

export default AddStudent;
