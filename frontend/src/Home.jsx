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
                { id: 1,  username: "oliver.reed",     email: "oliver.reed@example.com",     firstName: "Oliver", lastName: "Reed" },
                { id: 2,  username: "maya.patel",      email: "maya.patel@example.com",      firstName: "Maya",   lastName: "Patel" },
                { id: 3,  username: "luca.rossi",      email: "luca.rossi@example.com",      firstName: "Luca",   lastName: "Rossi" },
                { id: 4,  username: "noor.ahmed",      email: "noor.ahmed@example.com",      firstName: "Noor",   lastName: "Ahmed" },
                { id: 5,  username: "eva.muller",      email: "eva.muller@example.com",      firstName: "Eva",    lastName: "Muller" },
                { id: 6,  username: "kai.tanaka",      email: "kai.tanaka@example.com",      firstName: "Kai",    lastName: "Tanaka" },
                { id: 7,  username: "priya.shah",      email: "priya.shah@example.com",      firstName: "Priya",  lastName: "Shah" },
                { id: 8,  username: "tomasz.k",        email: "tomasz.k@example.com",        firstName: "Tomasz", lastName: "Kowalski" },
                { id: 9,  username: "amina.diallo",    email: "amina.diallo@example.com",    firstName: "Amina",  lastName: "Diallo" },
                { id: 10, username: "hugo.fernandes",  email: "hugo.fernandes@example.com",  firstName: "Hugo",   lastName: "Fernandes" }
            ];
              
            const modules = [
                // Mandatory
                { code: "COMP0010", name: "Algorithms and Data Structures", mnc: true  },
                { code: "MATH0021", name: "Linear Algebra",                 mnc: true  },
              
                // Optional (non-mandatory)
                { code: "COMP0034", name: "Web Engineering",                mnc: false },
                { code: "STAT0035", name: "Probability & Statistics",       mnc: false },
                { code: "ECON0014", name: "Introduction to Microeconomics", mnc: false },
                { code: "PHYS0011", name: "Classical Mechanics",            mnc: false }
            ];
              
            const registrations = [
                // NOTE: Only non-mandatory modules are listed here.
                // Student 1: +3 optional (total load: 5 with mandatory)
                { student: { id: 1 },  module: { code: "COMP0034" } },
                { student: { id: 1 },  module: { code: "STAT0035" } },
                { student: { id: 1 },  module: { code: "ECON0014" } },
              
                // Student 2 (struggling): +2 optional (total load: 4 with mandatory)
                { student: { id: 2 },  module: { code: "COMP0034" } },
                { student: { id: 2 },  module: { code: "PHYS0011" } },
              
                // Student 3 (top performer): +4 optional (total load: 6)
                { student: { id: 3 },  module: { code: "COMP0034" } },
                { student: { id: 3 },  module: { code: "STAT0035" } },
                { student: { id: 3 },  module: { code: "ECON0014" } },
                { student: { id: 3 },  module: { code: "PHYS0011" } },
              
                // Student 4: +3 optional (total load: 5)
                { student: { id: 4 },  module: { code: "STAT0035" } },
                { student: { id: 4 },  module: { code: "ECON0014" } },
                { student: { id: 4 },  module: { code: "PHYS0011" } },
              
                // Student 5: +2 optional (total load: 4)
                { student: { id: 5 },  module: { code: "STAT0035" } },
                { student: { id: 5 },  module: { code: "ECON0014" } },
              
                // Student 6: +4 optional (total load: 6)
                { student: { id: 6 },  module: { code: "COMP0034" } },
                { student: { id: 6 },  module: { code: "STAT0035" } },
                { student: { id: 6 },  module: { code: "ECON0014" } },
                { student: { id: 6 },  module: { code: "PHYS0011" } },
              
                // Student 7: +3 optional (total load: 5)
                { student: { id: 7 },  module: { code: "ECON0014" } },
                { student: { id: 7 },  module: { code: "STAT0035" } },
                { student: { id: 7 },  module: { code: "COMP0034" } },
              
                // Student 8: +2 optional (total load: 4)
                { student: { id: 8 },  module: { code: "COMP0034" } },
                { student: { id: 8 },  module: { code: "STAT0035" } },
              
                // Student 9: +3 optional (total load: 5)
                { student: { id: 9 },  module: { code: "PHYS0011" } },
                { student: { id: 9 },  module: { code: "ECON0014" } },
                { student: { id: 9 },  module: { code: "STAT0035" } },
              
                // Student 10: +2 optional (total load: 4)
                { student: { id: 10 }, module: { code: "COMP0034" } },
                { student: { id: 10 }, module: { code: "ECON0014" } }
            ];
              
            const grades = [
                // Mandatory modules (all students take these)
                // COMP0010 and MATH0021
                { score: 78, student: { id: 1 },  module: { code: "COMP0010" } },
                { score: 72, student: { id: 1 },  module: { code: "MATH0021" } },
              
                { score: 33, student: { id: 2 },  module: { code: "COMP0010" } },
                { score: 37, student: { id: 2 },  module: { code: "MATH0021" } },
              
                { score: 95, student: { id: 3 },  module: { code: "COMP0010" } },
                { score: 92, student: { id: 3 },  module: { code: "MATH0021" } },
              
                { score: 67, student: { id: 4 },  module: { code: "COMP0010" } },
                { score: 61, student: { id: 4 },  module: { code: "MATH0021" } },
              
                { score: 55, student: { id: 5 },  module: { code: "COMP0010" } },
                { score: 49, student: { id: 5 },  module: { code: "MATH0021" } },
              
                { score: 80, student: { id: 6 },  module: { code: "COMP0010" } },
                { score: 75, student: { id: 6 },  module: { code: "MATH0021" } },
              
                { score: 62, student: { id: 7 },  module: { code: "COMP0010" } },
                { score: 57, student: { id: 7 },  module: { code: "MATH0021" } },
              
                { score: 44, student: { id: 8 },  module: { code: "COMP0010" } },
                { score: 42, student: { id: 8 },  module: { code: "MATH0021" } },
              
                { score: 52, student: { id: 9 },  module: { code: "COMP0010" } },
                { score: 46, student: { id: 9 },  module: { code: "MATH0021" } },
              
                { score: 41, student: { id: 10 }, module: { code: "COMP0010" } },
                { score: 43, student: { id: 10 }, module: { code: "MATH0021" } },
              
                // Optional modules — only for students who registered (see registrations)
                // Student 1 optionals
                { score: 74, student: { id: 1 },  module: { code: "COMP0034" } },
                { score: 68, student: { id: 1 },  module: { code: "STAT0035" } },
                { score: 63, student: { id: 1 },  module: { code: "ECON0014" } },
              
                // Student 2 optionals (struggling)
                { score: 35, student: { id: 2 },  module: { code: "COMP0034" } },
                { score: 29, student: { id: 2 },  module: { code: "PHYS0011" } },
              
                // Student 3 optionals (top performer)
                { score: 94, student: { id: 3 },  module: { code: "COMP0034" } },
                { score: 90, student: { id: 3 },  module: { code: "STAT0035" } },
                { score: 88, student: { id: 3 },  module: { code: "ECON0014" } },
                { score: 91, student: { id: 3 },  module: { code: "PHYS0011" } },
              
                // Student 4 optionals
                { score: 64, student: { id: 4 },  module: { code: "STAT0035" } },
                { score: 70, student: { id: 4 },  module: { code: "ECON0014" } },
                { score: 58, student: { id: 4 },  module: { code: "PHYS0011" } },
              
                // Student 5 optionals
                { score: 52, student: { id: 5 },  module: { code: "STAT0035" } },
                { score: 47, student: { id: 5 },  module: { code: "ECON0014" } },
              
                // Student 6 optionals
                { score: 78, student: { id: 6 },  module: { code: "COMP0034" } },
                { score: 82, student: { id: 6 },  module: { code: "STAT0035" } },
                { score: 69, student: { id: 6 },  module: { code: "ECON0014" } },
                { score: 73, student: { id: 6 },  module: { code: "PHYS0011" } },
              
                // Student 7 optionals
                { score: 74, student: { id: 7 },  module: { code: "ECON0014" } },
                { score: 66, student: { id: 7 },  module: { code: "STAT0035" } },
                { score: 60, student: { id: 7 },  module: { code: "COMP0034" } },
              
                // Student 8 optionals
                { score: 59, student: { id: 8 },  module: { code: "COMP0034" } },
                { score: 61, student: { id: 8 },  module: { code: "STAT0035" } },
              
                // Student 9 optionals
                { score: 55, student: { id: 9 },  module: { code: "PHYS0011" } },
                { score: 50, student: { id: 9 },  module: { code: "ECON0014" } },
                { score: 48, student: { id: 9 },  module: { code: "STAT0035" } },
              
                // Student 10 optionals (borderline)
                { score: 45, student: { id: 10 }, module: { code: "COMP0034" } },
                { score: 39, student: { id: 10 }, module: { code: "ECON0014" } }
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
                    Student Grade Management Program
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

            </Box>
        </App>
    );
}

export default Home;
