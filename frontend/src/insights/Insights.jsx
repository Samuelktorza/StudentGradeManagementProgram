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
    Paper,
    CircularProgress,
    Alert,
    Link,
    Button,
    Menu,
    MenuItem
} from "@mui/material";
import App from "../App";
import { API_ENDPOINT } from "../config";
import { Bar, Doughnut } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from "chart.js";
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";
import { Link as RouterLink } from "react-router-dom";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

function Insights() {
    const [studentCount, setStudentCount] = useState(0);
    const [moduleCount, setModuleCount] = useState(0);
    const [registrationCount, setRegistrationCount] = useState(0);
    const [unregisteredCount, setUnregisteredCount] = useState(0);
    const [averageGrade, setAverageGrade] = useState(0);
    const [moduleGrades, setModuleGrades] = useState([]);
    const [failedStudents, setFailedStudents] = useState([]);
    const [topStudent, setTopStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [studentList, setStudentList] = useState([]);
    const [moduleList, setModuleList] = useState([]);
    const [grades, setGrades] = useState([]); // Define grades state
    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const exportMenuOpen = Boolean(exportAnchorEl);
    const [exportType, setExportType] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const studentsResponse = await axios.get(`${API_ENDPOINT}/students`);
            const studentList = studentsResponse.data || [];
            setStudentList(studentList);
            setStudentCount(studentList.length);

            const modulesResponse = await axios.get(`${API_ENDPOINT}/modules`);
            const moduleList = modulesResponse.data || [];
            setModuleList(moduleList);
            setModuleCount(moduleList.length);

            const gradesResponse = await axios.get(`${API_ENDPOINT}/grades`);
            const gradeList = gradesResponse.data || [];
            setGrades(gradeList); // Set grades state

            const registrationResponse = await axios.get(`${API_ENDPOINT}/registrations`);
            const registrationList = registrationResponse.data || [];
            setRegistrationCount(registrationList.length);

            const registeredStudentIds = new Set(
                registrationList.map((registration) => registration.studentId)
            );
            const unregisteredStudents = studentList.filter(
                (student) => !registeredStudentIds.has(student.id)
            );
            setUnregisteredCount(unregisteredStudents.length);

            const totalGrades = gradeList.reduce((acc, grade) => acc + grade.score, 0);
            setAverageGrade((totalGrades / gradeList.length).toFixed(2));

            const moduleGradesData = moduleList.map((module) => {
                const moduleGrades = gradeList.filter((grade) => grade.module.code === module.code);
                const averageModuleGrade = moduleGrades.length > 0
                    ? (moduleGrades.reduce((acc, grade) => acc + grade.score, 0) / moduleGrades.length).toFixed(2)
                    : 0;
                return { module: module.name, averageGrade: averageModuleGrade };
            });
            setModuleGrades(moduleGradesData);

            const failedStudentsData = studentList.filter(student => 
                gradeList.some(grade => grade.student.id === student.id && grade.score < 40)
            );
            setFailedStudents(failedStudentsData);

            const topStudentData = studentList.reduce((top, student) => {
                const studentGrades = gradeList.filter(grade => grade.student.id === student.id);
                const studentAverage = studentGrades.length > 0
                    ? studentGrades.reduce((acc, grade) => acc + grade.score, 0) / studentGrades.length
                    : 0;
                return studentAverage > (top.average || 0) ? { ...student, average: studentAverage } : top;
            }, {});
            setTopStudent(topStudentData);

            setError(null);
            setLoading(false);
        } catch (error) {
            setError("Error fetching data");
            setLoading(false);
        }
    };

    const handleExportMenuClick = (event) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportMenuClose = () => {
        setExportAnchorEl(null);
        setExportType(null);
    };

    const handleExportTypeClick = (type) => {
        setExportType(type);
    };

    const exportStudentsToPDF = () => {
        const doc = new jsPDF();
        doc.text("All Students", 20, 10);
        doc.autoTable({
            head: [["Student ID", "First Name", "Last Name", "Average Grade"]],
            body: studentList.map((student) => {
                const studentGrades = grades.filter(grade => grade.student.id === student.id);
                const studentAverage = studentGrades.length > 0
                    ? (studentGrades.reduce((acc, grade) => acc + grade.score, 0) / studentGrades.length).toFixed(2)
                    : "N/A";
                return [
                    student.id,
                    student.firstName,
                    student.lastName,
                    studentAverage
                ];
            }),
        });
        doc.save("All_Students.pdf");
    };

    const exportModulesToPDF = () => {
        const doc = new jsPDF();
        doc.text("All Modules", 20, 10);
        doc.autoTable({
            head: [["Module Code", "Module Name", "Average Grade"]],
            body: moduleList.map((module) => {
                const moduleGrades = grades.filter(grade => grade.module.code === module.code);
                const averageModuleGrade = moduleGrades.length > 0
                    ? (moduleGrades.reduce((acc, grade) => acc + grade.score, 0) / moduleGrades.length).toFixed(2)
                    : "N/A";
                return [
                    module.code,
                    module.name,
                    averageModuleGrade
                ];
            }),
        });
        doc.save("All_Modules.pdf");
    };

    const studentCsvData = [
        ["Student ID", "First Name", "Last Name", "Average Grade"],
        ...studentList.map((student) => {
            const studentGrades = grades.filter(grade => grade.student.id === student.id);
            const studentAverage = studentGrades.length > 0
                ? (studentGrades.reduce((acc, grade) => acc + grade.score, 0) / studentGrades.length).toFixed(2)
                : "N/A";
            return [
                student.id,
                student.firstName,
                student.lastName,
                studentAverage
            ];
        })
    ];

    const moduleCsvData = [
        ["Module Code", "Module Name", "Average Grade"],
        ...moduleList.map((module) => {
            const moduleGrades = grades.filter(grade => grade.module.code === module.code);
            const averageModuleGrade = moduleGrades.length > 0
                ? (moduleGrades.reduce((acc, grade) => acc + grade.score, 0) / moduleGrades.length).toFixed(2)
                : "N/A";
            return [
                module.code,
                module.name,
                averageModuleGrade
            ];
        })
    ];

    const barChartData = {
        labels: moduleGrades.map((mg) => mg.module),
        datasets: [
            {
                label: "Average Grade",
                data: moduleGrades.map((mg) => mg.averageGrade),
                backgroundColor: "rgba(75, 192, 192, 0.6)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1
            },
        ],
    };

    const barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                max: 100,
            },
        },
    };

    const doughnutChartData = {
        labels: ["Average Grade"],
        datasets: [
            {
                data: [averageGrade, 100 - averageGrade],
                backgroundColor: ["#36A2EB", "#FFCE56"], // Use a light color for the remaining part
                hoverBackgroundColor: ["#36A2EB", "#FFCE56"],
            },
        ],
    };
    
    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "70%",
        plugins: {
            tooltip: {
                callbacks: {
                    label: (tooltipItem) => {
                        if (tooltipItem.label === "Average Grade") {
                            return `Average Grade: ${tooltipItem.raw}%`;
                        }
                        return null; // Hide tooltip for the remaining part
                    },
                },
            },
            legend: {
                display: false,
            },
        },
    };

    if (loading) return <CircularProgress style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <App>
            <Box sx={{ padding: 3, backgroundColor: "#ffffff", minHeight: "100vh" }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
                    <Breadcrumbs separator="›" aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" component={RouterLink} to="/" style={{ textDecoration: 'none', fontWeight: 500, color: '#2c3e50' }}>
                            Home
                        </Link>
                        <Typography sx={{ color: "text.primary", fontWeight: "bold" }}>Insights</Typography>
                    </Breadcrumbs>
                    <Button
                        variant="contained"
                        onClick={handleExportMenuClick}
                        sx={{
                            bgcolor: 'secondary.main',
                            '&:hover': {
                                bgcolor: 'secondary.dark',
                                opacity: 0.9
                            },
                            textTransform: 'none',
                            fontSize: '1rem',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        Export
                    </Button>
                    <Menu
                        anchorEl={exportAnchorEl}
                        open={exportMenuOpen}
                        onClose={handleExportMenuClose}
                        PaperProps={{
                            elevation: 3,
                            sx: {
                                minWidth: 200,
                                borderRadius: 2,
                                mt: 1
                            }
                        }}
                    >
                        <MenuItem onClick={() => handleExportTypeClick("students")}>
                            Export All Students
                        </MenuItem>
                        <MenuItem onClick={() => handleExportTypeClick("modules")}>
                            Export All Modules
                        </MenuItem>
                    </Menu>
                    {exportType && (
                        <Menu
                            anchorEl={exportAnchorEl}
                            open={Boolean(exportType)}
                            onClose={handleExportMenuClose}
                            PaperProps={{
                                elevation: 3,
                                sx: {
                                    minWidth: 200,
                                    borderRadius: 2,
                                    mt: 1
                                }
                            }}
                        >
                            <MenuItem onClick={() => { exportType === "students" ? exportStudentsToPDF() : exportModulesToPDF(); handleExportMenuClose(); }}>
                                Export to PDF
                            </MenuItem>
                            <CSVLink data={exportType === "students" ? studentCsvData : moduleCsvData} filename={exportType === "students" ? "All_Students.csv" : "All_Modules.csv"} style={{ textDecoration: 'none', color: 'inherit' }}>
                                <MenuItem onClick={handleExportMenuClose}>
                                    Export to CSV
                                </MenuItem>
                            </CSVLink>
                        </Menu>
                    )}
                </Box>

                <Typography variant="h4" sx={{ mt: 2, mb: 3, fontWeight: "bold" }}>
                    Insights and Statistics
                </Typography>

                <Grid container spacing={3}>
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
                        >
                            <CardContent>
                                <Typography variant="h4" sx={{ color: "#ff9800", mb: 1 }}>
                                    <AssessmentIcon fontSize="large" />
                                </Typography>
                                <Typography variant="h6" color="text.secondary">
                                    Average Grade
                                </Typography>
                                <Typography variant="h4">{averageGrade}%</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mt: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                                Average Grade Distribution
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <Doughnut data={doughnutChartData} options={doughnutChartOptions} />
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                                Module Performance
                            </Typography>
                            <Box sx={{ height: 300 }}>
                                <Bar data={barChartData} options={barChartOptions} />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Grid container spacing={3} sx={{ mt: 3 }}>
                    <Grid item xs={12} md={6}>
                        <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                                Students Who Failed a Module
                            </Typography>
                            <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                                {failedStudents.length > 0 ? (
                                    failedStudents.map(student => {
                                        const failedModules = grades
                                            .filter(grade => grade.student.id === student.id && grade.score < 40)
                                            .map(grade => grade.module.name);
                                        return (
                                            <Typography key={student.id} variant="body1" sx={{ mb: 1 }}>
                                                {student.firstName} {student.lastName} ({student.id}) - Failed Modules: {failedModules.join(", ")}
                                            </Typography>
                                        );
                                    })
                                ) : (
                                    <Typography variant="body1">No students have failed a module.</Typography>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Paper sx={{ padding: 3, borderRadius: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                                Highest Performing Student
                            </Typography>
                            {topStudent ? (
                                <Typography variant="body1">
                                    {topStudent.firstName} {topStudent.lastName} ({topStudent.id}) - Average Grade: {topStudent.average ? topStudent.average.toFixed(2) : "N/A"}%
                                </Typography>
                            ) : (
                                <Typography variant="body1">No data available.</Typography>
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </App>
    );
}

export default Insights;
