import React from "react";
import axios from "axios";
import {
    Breadcrumbs,
    Typography,
    Card,
    CardContent,
    Grid,
    Box,
    Divider,
} from "@mui/material";
import App from "../App";
import { API_ENDPOINT } from "../config";
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import AssessmentIcon from '@mui/icons-material/Assessment';

function Home() {
    const [studentCount, setStudentCount] = React.useState(0);
    const [moduleCount, setModuleCount] = React.useState(0);
    const [gradeCount, setGradeCount] = React.useState(0);
    const [registrationCount, setRegistrationCount] = React.useState(0);
    const [unregisteredCount, setUnregisteredCount] = React.useState(0);
    const [error, setError] = React.useState(null);

    React.useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const studentsResponse = await axios.get(`${API_ENDPOINT}/students`);
            const studentList = studentsResponse.data || [];
            setStudentCount(studentList.length);

            const modulesResponse = await axios.get(`${API_ENDPOINT}/modules`);
            setModuleCount(modulesResponse.data.length || 0);

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

    return (
        <App>
            <Box sx={{ padding: 3, backgroundColor: "#ffffff", minHeight: "100vh" }}>
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

                    {/* Grades Card */}
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
                            }}
                            onClick={() => (window.location.href = "/grades")}
                        >
                            <CardContent>
                                <Typography variant="h4" sx={{ color: "#ff9800", mb: 1 }}>
                                    <AssessmentIcon fontSize="large" />
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Grades
                                </Typography>
                                <Typography variant="h4">{gradeCount}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Registrations Card */}
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
                            }}
                            onClick={() => (window.location.href = "/registration")}
                        >
                            <CardContent>
                                <Typography variant="h4" sx={{ color: "#ff9800", mb: 1 }}>
                                    <AssessmentIcon fontSize="large" />
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Registrations
                                </Typography>
                                <Typography variant="h4">{registrationCount}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {unregisteredCount} students unregistered
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>
        </App>
    );
}

export default Home;
