import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Breadcrumbs,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Divider,
    Autocomplete,
    TextField,
    ListItem,
    ListItemText, Button,
} from "@mui/material";
import App from "./App";
import { API_ENDPOINT } from "./config";
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import AssessmentIcon from '@mui/icons-material/Assessment';

function Home() {
    const [studentCount, setStudentCount] = useState(0);
    const [moduleCount, setModuleCount] = useState(0);
    const [gradeCount, setGradeCount] = useState(0);
    const [registrationCount, setRegistrationCount] = useState(0);
    const [unregisteredCount, setUnregisteredCount] = useState(0);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [students, setStudents] = useState([]);
    const [modules, setModules] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const studentsResponse = await axios.get(`${API_ENDPOINT}/students`);
            const studentList = studentsResponse.data || [];
            setStudents(studentList);
            setStudentCount(studentList.length);

            const modulesResponse = await axios.get(`${API_ENDPOINT}/modules`);
            const moduleList = modulesResponse.data || [];
            setModules(moduleList);
            setModuleCount(moduleList.length);

            const gradesResponse = await axios.get(`${API_ENDPOINT}/grades`);
            setGradeCount(gradesResponse.data.length || 0);

            const registrationResponse = await axios.get(`${API_ENDPOINT}/registrations`);
            const registrationList = registrationResponse.data || [];
            setRegistrationCount(registrationList.length);

            // Calculate unregistered students
            const registeredStudentIds = new Set(
                registrationList.map((registration) => registration.studentId)
            );
            const unregisteredStudents = studentList.filter(
                (student) => !registeredStudentIds.has(student.id)
            );
            setUnregisteredCount(unregisteredStudents.length);

            setError(null); // Clear error if successful
        } catch (error) {
            setError("Error fetching data");
        }
    };

    const handleSearchChange = (event, value) => {
        setSearchQuery(value);

        if (value.length > 0) {
            const filteredStudents = students.filter((student) =>
                student.firstName.toLowerCase().startsWith(value.toLowerCase()) ||
                student.lastName.toLowerCase().startsWith(value.toLowerCase())
            );

            const filteredModules = modules.filter((module) =>
                module.name.toLowerCase().startsWith(value.toLowerCase())
            );

            setSearchResults([...filteredStudents, ...filteredModules]);
        } else {
            setSearchResults([]);
        }
    };

    const handleResultClick = (event, result) => {
        if (result.firstName) {
            window.location.href = `/students/${result.id}`;
        } else {
            window.location.href = `/modules/${result.code}`;
        }
    };

    const addFakeData = async () => {
        try {
            const students = [
                { id: 1, username: "john.doe", email: "john.doe@example.com", firstName: "John", lastName: "Doe" },
                { id: 2, username: "jane.smith", email: "jane.smith@example.com", firstName: "Jane", lastName: "Smith" },
                { id: 3, username: "alice.jones", email: "alice.jones@example.com", firstName: "Alice", lastName: "Jones" },
                { id: 4, username: "bob.brown", email: "bob.brown@example.com", firstName: "Bob", lastName: "Brown" },
                { id: 5, username: "carol.white", email: "carol.white@example.com", firstName: "Carol", lastName: "White" },
                { id: 6, username: "dave.black", email: "dave.black@example.com", firstName: "Dave", lastName: "Black" },
            ];

            const modules = [
                { code: "COMP0001", name: "Computer Science for Beginners", mnc: false },
                { code: "MA0005", name: "Advanced Mathematics", mnc: true },
                { code: "PHYS0011", name: "Physics", mnc: false },
                { code: "CHEM0012", name: "Chemistry", mnc: false },
                { code: "BIO0013", name: "Biology", mnc: false },
            ];

            const registrations = [
                // Non-mandatory module registrations
                { student: { id: 1 }, module: { code: "COMP0001" } },
                { student: { id: 1 }, module: { code: "PHYS0011" } },
                { student: { id: 2 }, module: { code: "COMP0001" } },
                { student: { id: 2 }, module: { code: "CHEM0012" } },
                { student: { id: 3 }, module: { code: "PHYS0011" } },
                { student: { id: 3 }, module: { code: "BIO0013" } },
                { student: { id: 4 }, module: { code: "COMP0001" } },
                { student: { id: 4 }, module: { code: "PHYS0011" } },
                { student: { id: 5 }, module: { code: "CHEM0012" } },
                { student: { id: 5 }, module: { code: "BIO0013" } },
                { student: { id: 6 }, module: { code: "COMP0001" } },
                { student: { id: 6 }, module: { code: "PHYS0011" } },
            ];

            const grades = [
                // Student 1: Overall high grades
                { score: 86, student: { id: 1 }, module: { code: "COMP0001" } },
                { score: 91, student: { id: 1 }, module: { code: "PHYS0011" } },
                { score: 87, student: { id: 1 }, module: { code: "MA0005" } },
                // Student 2: Overall low grades
                { score: 34, student: { id: 2 }, module: { code: "COMP0001" } },
                { score: 38, student: { id: 2 }, module: { code: "CHEM0012" } },
                { score: 40, student: { id: 2 }, module: { code: "MA0005" } },
                // Student 3: Mixed grades
                { score: 46, student: { id: 3 }, module: { code: "PHYS0011" } },
                { score: 50, student: { id: 3 }, module: { code: "BIO0013" } },
                { score: 54, student: { id: 3 }, module: { code: "MA0005" } },
                // Student 4: Overall high grades
                { score: 97, student: { id: 4 }, module: { code: "COMP0001" } },
                { score: 90, student: { id: 4 }, module: { code: "PHYS0011" } },
                { score: 89, student: { id: 4 }, module: { code: "MA0005" } },
                // Student 5: Overall low grades
                { score: 31, student: { id: 5 }, module: { code: "CHEM0012" } },
                { score: 33, student: { id: 5 }, module: { code: "BIO0013" } },
                { score: 40, student: { id: 5 }, module: { code: "MA0005" } },
                // Student 6: Mixed grades
                { score: 71, student: { id: 6 }, module: { code: "COMP0001" } },
                { score: 74, student: { id: 6 }, module: { code: "PHYS0011" } },
                { score: 67, student: { id: 6 }, module: { code: "MA0005" } },
            ];

            // Add students
            for (const student of students) {
                await axios.post(`${API_ENDPOINT}/students`, student);
            }

            // Add modules
            for (const module of modules) {
                await axios.post(`${API_ENDPOINT}/modules`, module);
            }

            // Add registrations
            for (const registration of registrations) {
                await axios.post(`${API_ENDPOINT}/registrations`, registration);
            }

            // Add grades
            for (const grade of grades) {
                await axios.post(`${API_ENDPOINT}/grades`, grade);
            }

            fetchData(); // Refresh data
        } catch (error) {
            setError("Error adding fake data");
        }
    };

    return (
        <App>
            <Box sx={{ padding: 3, backgroundColor: "#ffffff", minHeight: "100vh" }}>
                <Button
                    variant="contained"
                    color="primary"
                    sx={{ position: "absolute", top: 16, right: 16 }}
                    onClick={addFakeData}
                >
                    Add Sample Data
                </Button>
                <Breadcrumbs aria-label="breadcrumb">
                    <Typography sx={{ color: "text.primary", fontWeight: "bold" }}>
                        Home
                    </Typography>
                </Breadcrumbs>

                <Typography variant="h4" sx={{ mt: 2, mb: 3, fontWeight: "bold" }}>
                    Welcome to the Student Grade Management System
                </Typography>

                {error && (
                    <Typography color="error" variant="body1" sx={{ mb: 2 }}>
                        {error}
                    </Typography>
                )}

                <Autocomplete
                    freeSolo
                    options={searchResults}
                    getOptionLabel={(option) => option.firstName ? `${option.firstName} ${option.lastName}` : option.name}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search for students or modules"
                            variant="outlined"
                            fullWidth
                            value={searchQuery}
                            onChange={(e) => handleSearchChange(e, e.target.value)}
                            sx={{ mb: 3 }}
                        />
                    )}
                    renderOption={(props, option) => (
                        <ListItem {...props} button onClick={(e) => handleResultClick(e, option)}>
                            <ListItemText
                                primary={option.firstName ? `${option.firstName} ${option.lastName}` : option.name}
                                secondary={option.firstName ? "Student" : "Module"}
                            />
                        </ListItem>
                    )}
                />

                <Grid container spacing={3}>
                    {/* Students Card */}
                    <Grid item xs={12} sm={4}>
                        <Card
                            sx={{
                                minHeight: 150,
                                textAlign: "center",
                                borderRadius: "16px",
                                boxShadow: 3,
                                backgroundColor: "#ffffff",
                                transition: "transform 0.2s",
                                "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                                cursor: "pointer"
                            }}
                            onClick={() => (window.location.href = "/students")}
                        >
                            <CardContent>
                                <Typography variant="h4" sx={{ color: "#1976d2", mb: 1 }}>
                                    <PersonIcon fontSize="large" />
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Students
                                </Typography>
                                <Typography variant="h4">{studentCount}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Modules Card */}
                    <Grid item xs={12} sm={4}>
                        <Card
                            sx={{
                                minHeight: 150,
                                textAlign: "center",
                                borderRadius: "16px",
                                boxShadow: 3,
                                backgroundColor: "#ffffff",
                                transition: "transform 0.2s",
                                "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                                cursor: "pointer"
                            }}
                            onClick={() => (window.location.href = "/modules")}
                        >
                            <CardContent>
                                <Typography variant="h4" sx={{ color: "#4caf50", mb: 1 }}>
                                    <BookIcon fontSize="large" />
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Modules
                                </Typography>
                                <Typography variant="h4">{moduleCount}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Insights Card */}
                    <Grid item xs={12} sm={4}>
                        <Card
                            sx={{
                                minHeight: 168,
                                textAlign: "center",
                                borderRadius: "16px",
                                boxShadow: 3,
                                backgroundColor: "#ffffff",
                                transition: "transform 0.2s",
                                "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                                cursor: "pointer"
                            }}
                            onClick={() => (window.location.href = "/insights")}
                        >
                            <CardContent>
                                <Typography variant="h4" sx={{ color: "#ff9800", mb: 1 }}>
                                    <AssessmentIcon fontSize="large" />
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Insights
                                </Typography>
                                <Typography variant="h4"></Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Divider sx={{ mt: 4 }} />
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ textAlign: "center", mt: 2 }}
                >
                    © 2024 Student Grade Management System. All rights reserved.
                </Typography>
            </Box>
        </App>
    );
}

export default Home;