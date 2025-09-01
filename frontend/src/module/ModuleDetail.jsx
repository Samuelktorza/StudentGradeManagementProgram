// src/module/ModuleDetail.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Typography,
    CircularProgress,
    Alert,
    Button,
    Breadcrumbs,
    Box,
    Grid,
    Paper,
    TableContainer, Table, TableHead, TableRow, TableCell, TableBody,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Menu as DropdownMenu
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { API_ENDPOINT } from "../config";
import axios from "axios";
import App from "../App.jsx";
import { Link } from "react-router-dom";
import { Bar, Doughnut } from "react-chartjs-2";
import ErrorPage from '../ErrorPage'; // Import the ErrorPage component
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";

const getGradeColor = (score) => {
    if (!score) return '#757575'; // gray for N/A
    if (score < 40) return '#dc3545';
    if (score < 50) return '#ffc107';
    if (score < 70) return '#28a745';
    return '#0d6efd';
};

const ModuleDetail = () => {
    const { id } = useParams();
    const [module, setModule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const navigate = useNavigate();
    const [gradesError, setGradesError] = useState(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const exportMenuOpen = Boolean(exportAnchorEl);

    const handleExportMenuClick = (event) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportMenuClose = () => {
        setExportAnchorEl(null);
    };

    useEffect(() => {
        axios.get(`${API_ENDPOINT}/modules`)
            .then((response) => {
                const foundModule = response.data.find(m => m.code === id);
                if (!foundModule) {
                    setError("Module not found");
                } else {
                    setModule(foundModule);
                }
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    
        axios.get(`${API_ENDPOINT}/registrations`)
            .then(response => {
                const moduleStudents = response.data.filter(registration => registration.module.code === id);
                setStudents(moduleStudents.map(registration => registration.student));
            })
            .catch(() => setError("Error fetching module students"));
    
        axios.get(`${API_ENDPOINT}/modules/${id}/grades`)
            .then(response => {
                setGrades(response.data);
                setGradesError(null);
            })
            .catch(() => setGradesError("Error fetching grades"));
    }, [id]);

    if (loading) return <CircularProgress style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />;
    if (error) return <ErrorPage />; // Display ErrorPage if there's an error

    if (error) return <Alert severity="error">Error: {error}</Alert>;

    const editModule = () => {
        navigate("/modules/AddModule", { state: { module } });
    };

    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);

    const confirmDeleteModule = () => {
        axios.delete(`${API_ENDPOINT}/modules/${module.code}`)
            .then(() => {
                navigate("/modules");
            })
            .catch((error) => {
                setError("Error deleting module: " + error.message);
            });
        closeDialog();
    };

    const handleGradeAction = () => {
        navigate("/grades/AddGrade", {
            state: {
                student_id: selectedStudent.id,
                module_id: id,
                score: selectedStudent.grade ? selectedStudent.grade.score : ""
            }
        });
        handleMenuClose();
    };

    const handleAddRegistration = () => {
        navigate("/registration/BulkRegistration", {
            state: {
                module_id: id
            }
        });
    };

    const handleMenuClick = (event, student) => {
        setAnchorEl(event.currentTarget);
        setSelectedStudent(student);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleUnregisterStudent = () => {
        if (module.mnc) {
            setError("Cannot unregister students from a compulsory module!");
            handleMenuClose();
            return;
        }

        axios.delete(`${API_ENDPOINT}/registrations/${selectedStudent.id}/${id}`)
            .then(() => {
                console.log("Student unregistered");
                setStudents(students.filter(student => student.id !== selectedStudent.id));
                setGrades(grades.filter(grade => grade.student.id !== selectedStudent.id));
                handleMenuClose();
            })
            .catch(() => setError("Error unregistering student"));
    };

    const studentLabels = students.map((student) => student.firstName);
    const gradeData = grades.map((grade) => grade.score);
    const averageGrade = grades.length > 0 ? (grades.reduce((acc, grade) => acc + grade.score, 0) / grades.length).toFixed(2) : 0;
    const numberOfStudents = students.length;

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Module Details", 20, 10);
        doc.autoTable({
            head: [["Field", "Value"]],
            body: [
                ["Module Name", module.name],
                ["Module Code", module.code],
                ["Mandatory", module.mnc ? "Yes" : "No"],
                ["Number of Students", `${numberOfStudents} ${numberOfStudents === 1 ? "student" : "students"}`],
                ["Average Grade", `${averageGrade}%`],
                // Add more fields as needed
            ],
        });
        doc.autoTable({
            head: [["Student ID", "First Name", "Last Name", "Grade"]],
            body: students.map((student) => {
                const grade = grades.find(g => g.student.id === student.id);
                return [
                    student.id,
                    student.firstName,
                    student.lastName,
                    grade ? `${grade.score}%` : "N/A"
                ];
            }),
        });
        doc.save(`${module.name}_Details.pdf`);
    };

    const csvData = [
        ["Field", "Value"],
        ["Module Name", module.name],
        ["Module Code", module.code],
        ["Mandatory", module.mnc ? "Yes" : "No"],
        ["Number of Students", `${numberOfStudents} ${numberOfStudents === 1 ? "student" : "students"}`],
        ["Average Grade", `${averageGrade}%`],
        // Add more fields as needed
        ...students.map((student) => {
            const grade = grades.find(g => g.student.id === student.id);
            return [
                student.id,
                student.firstName,
                student.lastName,
                grade ? `${grade.score}%` : "N/A"
            ];
        })
    ];

    const chartData = {
        labels: studentLabels,
        datasets: [
            {
                label: "Grades",
                data: gradeData,
                backgroundColor: (context) => {
                    const value = context.raw;
                    if (value < 40) {
                        return "rgba(255, 99, 132, 0.8)";
                    }
                    const alpha = value < 50 ? 0.8 : value < 75 ? 0.6 : 0.4;
                    return `rgba(76, 175, 80, ${alpha})`;
                },
                borderColor: (context) => {
                    return context.raw < 40 ? "#b71c1c" : "#388e3c";
                },
                borderWidth: 2,
                hoverBackgroundColor: (context) => {
                    return context.raw < 40 ? "#e57373" : "#66bb6a";
                },
                hoverBorderColor: (context) => {
                    return context.raw < 40 ? "#c62828" : "#2c6e2f";
                },
                borderRadius: 12,
                barPercentage: 0.75,
                categoryPercentage: 0.8,
                hoverBorderWidth: 3,
                barThickness: 30,
            },
        ],
    };

    const doughnutChartData = {
        labels: ["Average Grade"],
        datasets: [
            {
                data: [averageGrade, 100 - averageGrade],
                backgroundColor: [
                    averageGrade < 40 ? "rgba(255, 99, 132, 1)" : "rgba(41, 121, 255, 1)",
                    "rgba(224, 224, 224, 1)",
                ],
                borderWidth: 2,
                borderColor: averageGrade < 40 ? "#b71c1c" : "#388e3c",
                hoverOffset: 4,
                hoverBackgroundColor: averageGrade < 40 ? "#e57373" : "#66bbff",
                hoverBorderColor: averageGrade < 40 ? "#c62828" : "#2c6e2f",
                borderRadius: 12,
            },
        ],
    };

    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        rotation: -90,
        circumference: 360,
        cutout: "80%",
        plugins: {
            tooltip: {
                enabled: false,
                callbacks: {
                    label: function (tooltipItem) {
                        return `Average Grade: ${averageGrade}%`;
                    },
                },
            },
            legend: {
                display: false,
            },
        },
        animation: {
            animateScale: true,
            animateRotate: true,
        },
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1000,
            easing: "easeInOutQuart",
        },
        scales: {
            x: {
                grid: {
                    display: true,
                    color: 'rgba(0, 0, 0, 0.1)',
                    lineWidth: 1,
                },
                title: {
                    display: true,
                    text: 'Grades',
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Roboto', sans-serif",
                    },
                    color: '#555',
                },
                ticks: {
                    font: {
                        size: 12,
                        family: "'Roboto', sans-serif",
                    },
                    color: "#444",
                },
            },
            y: {
                min: 0,
                max: 100,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                    lineWidth: 1,
                },
                ticks: {
                    beginAtZero: true,
                    stepSize: 10,
                    font: {
                        size: 12,
                        family: "'Roboto', sans-serif",
                    },
                    color: "#444",
                },
                title: {
                    display: true,
                    text: 'Scores',
                    font: {
                        size: 14,
                        weight: 'bold',
                        family: "'Roboto', sans-serif",
                    },
                    color: '#555',
                },
            },
        },
        plugins: {
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: '#388e3c',
                borderWidth: 1,
                padding: 10,
                callbacks: {
                    label: (tooltipItem) => {
                        return `${tooltipItem.label}: ${tooltipItem.raw} ${tooltipItem.dataset.label}`;
                    },
                },
            },
            legend: {
                position: "top",
                labels: {
                    boxWidth: 20,
                    padding: 20,
                    font: {
                        size: 14,
                        family: "'Roboto', sans-serif",
                        weight: "bold",
                    },
                    color: "#444",
                },
            },
        },
    };

    return (
        <App>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
                <Breadcrumbs separator="›" aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" to="/" style={{ textDecoration: 'none', fontWeight: 500, color: '#2c3e50' }}>
                        Home
                    </Link>
                    <Link underline="hover" color="inherit" to="/modules" style={{ textDecoration: 'none', fontWeight: 500, color: '#2c3e50' }}>
                        Modules
                    </Link>
                    <Typography sx={{ color: "text.primary", fontWeight: "bold" }}>{module.name}</Typography>
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
                <DropdownMenu
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
                    <MenuItem onClick={() => { exportToPDF(); handleExportMenuClose(); }}>
                        Export to PDF
                    </MenuItem>
                    <CSVLink data={csvData} filename={`${module.name}_Details.csv`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <MenuItem onClick={handleExportMenuClose}>
                            Export to CSV
                        </MenuItem>
                    </CSVLink>
                </DropdownMenu>
            </Box>

            {/* Top Section - Module Details and Overall Stats */}
            <Paper sx={{ 
                padding: 4, 
                borderRadius: 2, 
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)', 
                backgroundColor: '#fff', 
                mb: 4,
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: (theme) => theme.palette.primary.main,
                    borderRadius: '2px 2px 0 0'
                }
            }}>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="h5" align="center" color="primary" gutterBottom>
                            Module Details
                        </Typography>
                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {[{ label: 'Module Name', value: module.name },
                              { label: 'Module Code', value: module.code },
                              { label: 'Mandatory', value: module.mnc ? "Yes" : "No" },
                              { label: 'Number of Students', value: `${numberOfStudents} ${numberOfStudents === 1 ? "student" : "students"}` }
                            ].map((item, index) => (
                                <Grid item xs={12} sm={6} key={index}>
                                    <Box sx={{ 
                                        p: 2, 
                                        bgcolor: 'background.paper',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <Typography 
                                            variant="caption" 
                                            sx={{
                                                color: 'text.secondary',
                                                fontWeight: 600,
                                                letterSpacing: '0.5px'
                                            }}
                                        >
                                            {item.label}
                                        </Typography>
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                fontWeight: 500,
                                                color: '#2c3e50',
                                                mt: 0.5
                                            }}
                                        >
                                            {item.value}
                                        </Typography>
                                    </Box>
                                </Grid>
                            ))}
                            <Grid item xs={12}>
                                <Button 
                                    variant="contained" 
                                    onClick={editModule}
                                    sx={{ 
                                        mt: 2,
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
                                    Edit Module
                                </Button>
                                <Button 
                                    variant="contained" 
                                    onClick={openDialog}
                                    sx={{ 
                                        mt: 2,
                                        bgcolor: 'error.main',
                                        '&:hover': {
                                            bgcolor: 'error.dark',
                                            opacity: 0.9
                                        },
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        ml: 2
                                    }}
                                >
                                    Delete Module
                                </Button>
                                <Dialog open={dialogOpen} onClose={closeDialog}>
                                    <DialogTitle>Confirm Deletion</DialogTitle>
                                    <DialogContent>
                                        <DialogContentText>
                                            Are you sure you want to delete this module? This action cannot be undone.
                                        </DialogContentText>
                                    </DialogContent>
                                    <DialogActions>
                                        <Button onClick={closeDialog} color="primary">Cancel</Button>
                                        <Button onClick={confirmDeleteModule} color="error">Delete</Button>
                                    </DialogActions>
                                </Dialog>
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box 
                            sx={{ 
                                height: 400, 
                                position: 'relative', 
                                width: '90%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center',
                                p: 3,
                                bgcolor: '#f8f9fa',
                                borderRadius: 5,
                                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                            }}
                        >
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 3,
                                    color: '#2c3e50',
                                    fontWeight: 600,
                                    letterSpacing: '0.5px'
                                }}
                            >
                                Overall Performance
                            </Typography>
                            <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
                                <Doughnut data={doughnutChartData} options={{
                                    ...doughnutChartOptions,
                                    plugins: {
                                        ...doughnutChartOptions.plugins,
                                        tooltip: {
                                            ...doughnutChartOptions.plugins.tooltip,
                                            enabled: false,
                                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                            padding: 12,
                                            titleFont: { size: 14 },
                                            bodyFont: { size: 14 }
                                        }
                                    }
                                }} />
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: averageGrade < 40 ? 'error.main' : 'primary.main' }}>
                                        {averageGrade}%
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Average Grade
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* Bottom Section - Students and Grades */}
            <Paper sx={{ 
                padding: 4, 
                borderRadius: 2, 
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                bgcolor: '#fff',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    backgroundColor: (theme) => theme.palette.secondary.main,
                    borderRadius: '2px 2px 0 0'
                }
            }}>
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 4,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    pb: 2
                }}>
                    <Typography 
                        variant="h5" 
                        sx={{ 
                            color: '#2c3e50',
                            fontWeight: 600,
                            letterSpacing: '0.5px'
                        }}
                    >
                        Students & Grades
                    </Typography>
                    <Button 
                        variant="contained" 
                        onClick={handleAddRegistration}
                        sx={{
                            bgcolor: (theme) => theme.palette.secondary.main,
                            '&:hover': {
                                bgcolor: (theme) => theme.palette.secondary.dark,
                            },
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3
                        }}
                    >
                        Register
                    </Button>
                </Box>
                {students.length > 0 ? (
                    <>
                        <TableContainer 
                            component={Paper} 
                            sx={{ 
                                mb: 4,
                                borderRadius: 2,
                                boxShadow: 'none',
                                border: '1px solid',
                                borderColor: 'divider',
                            }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Student ID</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>First Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Last Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Grade</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {students.map((student) => {
                                        const grade = grades.find(g => g.student.id === student.id);
                                        return (
                                            <TableRow 
                                                key={student.id}
                                                sx={{ 
                                                    '&:hover': { 
                                                        bgcolor: 'rgba(0,0,0,0.02)'
                                                    },
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <TableCell sx={{ color: '#2c3e50', fontWeight: 500 }}>
                                                    {student.id}
                                                </TableCell>
                                                <TableCell>{student.firstName}</TableCell>
                                                <TableCell>{student.lastName}</TableCell>
                                                <TableCell>
                                                    <Box
                                                        sx={{
                                                            display: 'inline-block',
                                                            px: 2,
                                                            py: 0.5,
                                                            borderRadius: 1,
                                                            bgcolor: `${getGradeColor(grade?.score)}15`,
                                                            color: getGradeColor(grade?.score),
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {grade ? `${grade.score}%` : "N/A"}
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <IconButton
                                                        aria-label="more"
                                                        aria-controls="long-menu"
                                                        aria-haspopup="true"
                                                        onClick={(event) => handleMenuClick(event, { ...student, grade })}
                                                        size="small"
                                                        sx={{ 
                                                            color: 'text.secondary',
                                                            '&:hover': { 
                                                                color: 'primary.main',
                                                                bgcolor: 'rgba(0, 0, 0, 0.04)'
                                                            }
                                                        }}
                                                    >
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                    <Menu
                                                        anchorEl={anchorEl}
                                                        keepMounted
                                                        open={Boolean(anchorEl)}
                                                        onClose={handleMenuClose}
                                                        PaperProps={{ 
                                                            elevation: 3, 
                                                            sx: { 
                                                                minWidth: 200, 
                                                                borderRadius: 2, 
                                                                mt: 1 
                                                            } 
                                                        }}
                                                    >
                                                        <MenuItem 
                                                            onClick={handleGradeAction}
                                                            sx={{
                                                                py: 1.5,
                                                                '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                                                            }}
                                                        >
                                                            {selectedStudent && selectedStudent.grade ? "Edit Grade" : "Add Grade"}
                                                        </MenuItem>
                                                        <MenuItem 
                                                            onClick={handleUnregisterStudent}
                                                            disabled={module.mnc}
                                                            sx={{
                                                                py: 1.5,
                                                                color: module.mnc ? 'text.disabled' : 'error.main',
                                                                '&:hover': { 
                                                                    bgcolor: module.mnc ? 'transparent' : 'error.lighter'
                                                                },
                                                                '&.Mui-disabled': {
                                                                    color: 'text.disabled',
                                                                    fontStyle: 'italic'
                                                                }
                                                            }}
                                                        >
                                                            {module.mnc ? "Cannot unregister - Compulsory Module" : "Unregister Student"}
                                                        </MenuItem>
                                                    </Menu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{ 
                            height: 400, 
                            mt: 4,
                            p: 3,
                            bgcolor: '#f8f9fa',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    mb: 3,
                                    color: '#2c3e50',
                                    fontWeight: 600,
                                    textAlign: 'center'
                                }}
                            >
                                Student Performance Overview
                            </Typography>
                            <Box sx={{ height: 'calc(100% - 50px)' }}>
                                <Bar 
                                    data={chartData} 
                                    options={chartOptions}
                                />
                            </Box>
                        </Box>
                    </>
                ) : (
                    <Box sx={{ 
                        textAlign: 'center', 
                        py: 8,
                        bgcolor: '#f8f9fa',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider'
                    }}>
                        <Typography 
                            color="text.secondary"
                            sx={{ mb: 2 }}
                        >
                            No students registered for this module.
                        </Typography>
                        <Button 
                            variant="outlined" 
                            onClick={handleAddRegistration}
                            sx={{ textTransform: 'none' }}
                        >
                            Register First Student
                        </Button>
                    </Box>
                )}
            </Paper>
        </App>
    );
};

export default ModuleDetail;