import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Typography,
    Grid,
    CircularProgress,
    Alert,
    Button,
    Paper,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Box, Breadcrumbs,
    Menu,
    MenuItem,
    IconButton,
    Avatar
} from "@mui/material";
import { API_ENDPOINT } from "../config";
import { useParams, useNavigate, Link } from "react-router-dom";
import App from "../App";
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ErrorPage from '../ErrorPage'; // Import the ErrorPage component
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { CSVLink } from "react-csv";
import { Menu as DropdownMenu } from "@mui/material";

// Register all required components, including ArcElement for Doughnut
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const StudentDetail = () => {
    const { id } = useParams();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [modules, setModules] = useState([]);
    const [grades, setGrades] = useState([]);
    const [gradesError, setGradesError] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedModule, setSelectedModule] = useState(null);
    const menuOpen = Boolean(anchorEl);
    const [exportAnchorEl, setExportAnchorEl] = useState(null);
    const exportMenuOpen = Boolean(exportAnchorEl);

    const handleExportMenuClick = (event) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportMenuClose = () => {
        setExportAnchorEl(null);
    };

    useEffect(() => {
        axios.get(`${API_ENDPOINT}/students/${id}`)
            .then(response => {
                if (!response.data) {
                    setError("Student not found");
                } else {
                    setStudent(response.data);
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Error fetching student details");
                setLoading(false);
            });
    
        axios.get(`${API_ENDPOINT}/registrations`)
            .then(response => {
                const studentModules = response.data.filter(registration => registration.student.id === parseInt(id));
                setModules(studentModules.map(registration => registration.module));
            })
            .catch(() => setError("Error fetching student modules"));
    
        axios.get(`${API_ENDPOINT}/students/${id}/grades`)
            .then(response => {
                setGrades(response.data);
                setGradesError(null);
            })
            .catch(() => setGradesError("Error fetching grades"));
    }, [id]);

    if (loading) return <CircularProgress style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }} />;
    if (error) return <ErrorPage />; // Display ErrorPage if there's an error

    const editStudent = () => {
        navigate("/students/AddStudent", { state: { student } });
    };

    const handleGradeAction = () => {
        navigate("/grades/AddGrade", {
            state: {
                student_id: student.id,
                module_id: selectedModule.code,
                score: selectedModule.grade ? selectedModule.grade.score : ""
            }
        });
    };

    const handleAddRegistration = () => {
        navigate("/registration/BulkModuleRegistration", {
            state: {
                student_id: id
            }
        });
    };

    const handleMenuClick = (event, module) => {
        setAnchorEl(event.currentTarget);
        setSelectedModule(module);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleUnregisterModule = () => {
        if (selectedModule) {
            if (selectedModule.mnc) {
                setError("Cannot unregister from a compulsory module!");
                handleMenuClose();
                return;
            }
            
            axios.delete(`${API_ENDPOINT}/registrations/${id}/${selectedModule.code}`)
                .then(() => {
                    console.log("Module unregistered successfully");
                    setModules(modules.filter(module => module.code !== selectedModule.code));
                    setGrades(grades.filter(grade => grade.module.code !== selectedModule.code));
                    handleMenuClose();
                })
                .catch(() => setError("Error unregistering module"));
        }
    };

    // Create a dictionary to map module codes to grades (changed from module IDs)
    const gradeMap = {};
    grades.forEach(grade => {
        if (grade.student.id === parseInt(id)) {
            gradeMap[grade.module.code] = grade.score;
        }
    });

    const gradeLabels = modules.map((module) => module.name);
    const gradeData = modules.map((module) => gradeMap[module.code] || 0);  // Changed from module.id
    const averageGrade = grades.length > 0 ? (grades.reduce((acc, grade) => acc + grade.score, 0) / grades.length).toFixed(2) : 0;
    const numberOfModules = modules.length;

    // Update chartData styling
    const chartData = {
        datasets: [
            {
                label: "Grades",
                data: gradeData,
                backgroundColor: (context) => {
                    const value = context.raw;
                    if (value < 40) {
                        return "rgba(255, 99, 132, 0.8)"; // Red color for grades below 40
                    }
                    const alpha = value < 50 ? 0.8 : value < 75 ? 0.6 : 0.4;
                    return `rgba(76, 175, 80, ${alpha})`; // Shades of green for other grades
                },
                borderColor: (context) => {
                    return context.raw < 40 ? "#b71c1c" : "#388e3c"; // Darker red border for grades below 40, green for others
                },
                borderWidth: 2,
                hoverBackgroundColor: (context) => {
                    return context.raw < 40 ? "#e57373" : "#66bb6a"; // Light red hover for grades below 40, light green for others
                },
                hoverBorderColor: (context) => {
                    return context.raw < 40 ? "#c62828" : "#2c6e2f"; // Darker red hover border for grades below 40, green for others
                },
                borderRadius: 12,
                barPercentage: 0.75,
                categoryPercentage: 0.8,
                hoverBorderWidth: 3,
                barThickness: 30,
            },
        ],
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
                    text: 'Modules',
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
                min:0,
                max:100,
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

    const getStatusColor = (grade) => {
        if (grade < 40) return '#dc3545';  // red
        if (grade < 50) return '#ffc107';  // amber
        if (grade < 70) return '#28a745';  // green
        return '#0d6efd';  // blue
    };

    // Update doughnutChartData colors
    const doughnutChartData = {
        labels: ["Average Grade"],
        datasets: [
            {
                data: [averageGrade, 100 - averageGrade], // Only show the grade and the remainder
                backgroundColor: [
                    getStatusColor(averageGrade),
                    "rgba(224, 224, 224, 1)", // Gray for remainder
                ],
                borderWidth: 2, // Slight border for a more professional look
                borderColor: getStatusColor(averageGrade), // Darker red border if below 40, green otherwise
                hoverOffset: 4, // Hover effect
                hoverBackgroundColor: averageGrade < 40 ? "#e57373" : "#66bbff", // Light red hover if below 40, light blue otherwise
                hoverBorderColor: averageGrade < 40 ? "#c62828" : "#2c6e2f", // Darker red border on hover if below 40, green otherwise
                borderRadius: 12, // Rounded edges for a smooth look
            },
        ],
    };


    const doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        rotation: -90, // Start the doughnut from the top
        circumference: 360, // Full circle
        cutout: "80%", // Hollow center to keep it clean and professional
        plugins: {
            tooltip: {
                enabled: false, // Completely disable the tooltip
            },
            legend: {
                display: false, // Hide legend for a cleaner UI
            },
        },
        animation: {
            animateScale: true, // Smooth scaling effect
            animateRotate: true, // Smooth rotation effect
        },
    };

    const getGradeColor = (score) => {
        if (!score) return '#757575'; // gray for N/A
        if (score < 40) return '#dc3545';
        if (score < 50) return '#ffc107';
        if (score < 70) return '#28a745';
        return '#0d6efd';
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text("Student Details", 20, 10);
        doc.autoTable({
            head: [["Field", "Value"]],
            body: [
                ["Student ID", student.id],
                ["Username", student.username],
                ["Email", student.email],
                ["Enrolled Courses", `${numberOfModules} ${numberOfModules === 1 ? "course" : "courses"}`],
                ["Average Grade", `${averageGrade}%`],
                // Add more fields as needed
            ],
        });
        doc.autoTable({
            head: [["Module Code", "Module Name", "Grade"]],
            body: modules.map((module) => [
                module.code,
                module.name,
                gradeMap[module.code] !== undefined ? `${gradeMap[module.code]}%` : "N/A"
            ]),
        });
        doc.save(`${student.firstName}_${student.lastName}_Details.pdf`);
    };

    const csvData = [
        ["Field", "Value"],
        ["Student ID", student.id],
        ["Username", student.username],
        ["Email", student.email],
        ["Enrolled Courses", `${numberOfModules} ${numberOfModules === 1 ? "course" : "courses"}`],
        ["Average Grade", `${averageGrade}%`],
        // Add more fields as needed
        ...modules.map((module) => [
            module.code,
            module.name,
            gradeMap[module.code] !== undefined ? `${gradeMap[module.code]}%` : "N/A"
        ])
    ];

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
                    <Typography sx={{ color: "text.primary", fontWeight: "bold" }}>{student.firstName} {student.lastName}</Typography>
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
                    <CSVLink data={csvData} filename={`${student.firstName}_${student.lastName}_Details.csv`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        <MenuItem onClick={handleExportMenuClose}>
                            Export to CSV
                        </MenuItem>
                    </CSVLink>
                </DropdownMenu>
            </Box>

            {/* Top Section - Student Details and Overall Stats */}
            <Paper sx={{ 
                padding: 4, 
                borderRadius: 2, 
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)', // Enhanced shadow
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
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                            <Avatar 
                                sx={{ 
                                    width: 90, 
                                    height: 90, 
                                    bgcolor: getStatusColor(averageGrade),
                                    fontSize: '2.2rem',
                                    fontWeight: 'bold',
                                    mr: 3,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                }}
                            >
                                {`${student.firstName[0]}${student.lastName[0]}`}
                            </Avatar>
                            <Box>
                                <Typography 
                                    variant="h4" 
                                    sx={{ 
                                        fontWeight: 600,
                                        color: '#2c3e50',
                                        mb: 0.5
                                    }}
                                >
                                    {`${student.firstName} ${student.lastName}`}
                                </Typography>
                            </Box>
                        </Box>

                        <Grid container spacing={3} sx={{ mt: 1 }}>
                            {[
                                { label: 'STUDENT ID', value: student.id },
                                { label: 'USERNAME', value: student.username },
                                { label: 'EMAIL', value: student.email },
                                { label: 'ENROLLED COURSES', value: `${numberOfModules} ${numberOfModules === 1 ? "course" : "courses"}` }
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
                                    onClick={editStudent}
                                    sx={{ 
                                        mt: 2,
                                        bgcolor: getStatusColor(averageGrade),
                                        '&:hover': {
                                            bgcolor: getStatusColor(averageGrade),
                                            opacity: 0.9
                                        },
                                        textTransform: 'none',
                                        fontSize: '1rem',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    Edit Profile
                                </Button>
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

            {/* Bottom Section - Modules and Grades */}
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
                        Modules & Grades
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
                        Register New Module
                    </Button>
                </Box>
                {modules.length > 0 ? (
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
                                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Module Code</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Module Name</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Grade</TableCell>
                                        <TableCell sx={{ fontWeight: 600, color: '#2c3e50' }}>Action</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {modules.map((module) => {
                                        const grade = grades.find(g => 
                                            g.module.code === module.code && 
                                            g.student.id === parseInt(id)
                                        );
                                        return (
                                            <TableRow 
                                                key={module.code}
                                                sx={{ 
                                                    '&:hover': { 
                                                        bgcolor: 'rgba(0,0,0,0.02)'
                                                    },
                                                    transition: 'background-color 0.2s'
                                                }}
                                            >
                                                <TableCell sx={{ color: '#2c3e50', fontWeight: 500 }}>
                                                    {module.code}
                                                </TableCell>
                                                <TableCell>{module.name}</TableCell>
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
                                                        aria-controls={`module-menu-${module.code}`}
                                                        aria-haspopup="true"
                                                        onClick={(event) => handleMenuClick(event, { ...module, grade })}
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
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        {/* Add Bar Chart */}
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
                                Module Performance Overview
                            </Typography>
                            <Box sx={{ height: 'calc(100% - 50px)' }}>
                                <Bar 
                                    data={{
                                        labels: gradeLabels,
                                        datasets: chartData.datasets,
                                    }} 
                                    options={chartOptions}
                                />
                            </Box>
                        </Box>
                        {/* Add Menu component outside of the TableContainer */}
                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
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
                                {selectedModule && selectedModule.grade ? "Edit Grade" : "Add Grade"}
                            </MenuItem>
                            <MenuItem 
                                onClick={handleUnregisterModule}
                                disabled={selectedModule?.mnc}
                                sx={{
                                    py: 1.5,
                                    color: selectedModule?.mnc ? 'text.disabled' : 'error.main',
                                    '&:hover': { 
                                        bgcolor: selectedModule?.mnc ? 'transparent' : 'error.lighter'
                                    },
                                    '&.Mui-disabled': {
                                        color: 'text.disabled',
                                        fontStyle: 'italic'
                                    }
                                }}
                            >
                                {selectedModule?.mnc ? "Cannot unregister - Compulsory Module" : "Unregister from Module"}
                            </MenuItem>
                        </Menu>
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
                            No modules registered for this student.
                        </Typography>
                        <Button 
                            variant="outlined" 
                            onClick={handleAddRegistration}
                            sx={{ textTransform: 'none' }}
                        >
                            Register First Module
                        </Button>
                    </Box>
                )}
            </Paper>
        </App>
    );
};

export default StudentDetail;