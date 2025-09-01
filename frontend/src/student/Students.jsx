import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    Breadcrumbs,
    Typography,
    Alert,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Box,
    TextField,
    IconButton,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import App from "../App";
import { API_ENDPOINT } from "../config";

function Students() {
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
    const [filter, setFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        updateStudents();
    }, []);

    useEffect(() => {
        applyFilterAndSort();
    }, [students, filter, sortConfig]);

    const updateStudents = () => {
        axios.get(`${API_ENDPOINT}/students`)
            .then((response) => {
                setStudents(response.data || []);
                setError(null);
            })
            .catch((error) => {
                setError(error.message || "Error fetching students");
            });
    };

    const applyFilterAndSort = () => {
        let filtered = students.filter((student) =>
            String(student.id).toLowerCase().includes(filter.toLowerCase()) ||
            student.firstName.toLowerCase().includes(filter.toLowerCase()) ||
            student.lastName.toLowerCase().includes(filter.toLowerCase()) ||
            student.username.toLowerCase().includes(filter.toLowerCase()) ||
            student.email.toLowerCase().includes(filter.toLowerCase())
        );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const isAscending = sortConfig.direction === "asc";
                if (a[sortConfig.key] < b[sortConfig.key]) return isAscending ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return isAscending ? 1 : -1;
                return 0;
            });
        }
        setFilteredStudents(filtered);
    };

    const handleSort = (key) => {
        setSortConfig((prev) => ({
            key,
            direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
        }));
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const handleAddStudent = () => {
        navigate("/students/AddStudent");
    };

    const handleStudentSelect = (id) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStudents(newSelected);
    };

    const handleDeleteSelectedStudents = () => {
        selectedStudents.forEach(id => {
            axios.delete(`${API_ENDPOINT}/students/${id}`)
                .then(() => {
                    updateStudents();  // Refresh the list after deletion
                    setSelectedStudents(new Set());  // Clear selection
                })
                .catch((error) => {
                    setError(error.message || "Error deleting students");
                });
        });
        setDialogOpen(false); // Close the dialog after deleting
    };

    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);

    const getSortIcon = (column) => (
        sortConfig.key === column
            ? (sortConfig.direction === "asc" ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />)
            : <ArrowUpward fontSize="small" style={{ opacity: 0.3 }} />
    );

    return (
        <App>
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    marginBottom: "30px"
                }}
            >
                {/* Breadcrumbs */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Breadcrumbs separator="›" aria-label="breadcrumb">
                        <Link underline="hover" color="inherit" to="/" style={{ textDecoration: 'none', fontWeight: 500, color: '#2c3e50' }}>
                            Home
                        </Link>
                        <Typography sx={{ color: "text.primary", fontWeight: "bold" }}>Students</Typography>
                    </Breadcrumbs>
                </Box>

                {/* Action Buttons */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 2,
                        justifyContent: "flex-end",
                        alignItems: "center"
                    }}
                >
                    <Button 
                        variant="contained" 
                        onClick={handleAddStudent}
                        sx={{
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
                        Add Student
                    </Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={openDialog}
                        disabled={selectedStudents.size === 0}
                        sx={{
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        Delete Selected
                    </Button>
                </Box>
            </Box>

            <TextField
                label="Search Student"
                variant="outlined"
                fullWidth
                margin="normal"
                value={filter}
                onChange={handleFilterChange}
                sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }
                }}
            />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!error && filteredStudents.length === 0 && <Alert severity="warning" sx={{ mb: 2 }}>No students found</Alert>}

            {filteredStudents.length > 0 && (
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                                <TableCell></TableCell> {/* Checkbox for selection */}
                                <TableCell onClick={() => handleSort("id")} style={{ cursor: "pointer", fontWeight: 600, color: '#2c3e50' }}>
                                    Student ID {getSortIcon("id")}
                                </TableCell>
                                <TableCell onClick={() => handleSort("firstName")} style={{ cursor: "pointer", fontWeight: 600, color: '#2c3e50' }}>
                                    First Name {getSortIcon("firstName")}
                                </TableCell>
                                <TableCell onClick={() => handleSort("lastName")} style={{ cursor: "pointer", fontWeight: 600, color: '#2c3e50' }}>
                                    Last Name {getSortIcon("lastName")}
                                </TableCell>
                                <TableCell onClick={() => handleSort("username")} style={{ cursor: "pointer", fontWeight: 600, color: '#2c3e50' }}>
                                    Username {getSortIcon("username")}
                                </TableCell>
                                <TableCell onClick={() => handleSort("email")} style={{ cursor: "pointer", fontWeight: 600, color: '#2c3e50' }}>
                                    Email {getSortIcon("email")}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStudents.map((s) => (
                                <TableRow
                                    key={s.id}
                                    hover
                                    onClick={() => navigate(`/students/${s.id}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <TableCell sx={{ position: 'relative', zIndex: 10 }}>
                                        <Checkbox
                                            checked={selectedStudents.has(s.id)}
                                            onChange={() => handleStudentSelect(s.id)}
                                            onClick={(event) => event.stopPropagation()}
                                            sx={{ position: 'relative', zIndex: 10 }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ color: '#2c3e50', fontWeight: 500 }}>{s.id}</TableCell>
                                    <TableCell sx={{ color: '#2c3e50', fontWeight: 500 }}>{s.firstName}</TableCell>
                                    <TableCell sx={{ color: '#2c3e50', fontWeight: 500 }}>{s.lastName}</TableCell>
                                    <TableCell sx={{ color: '#2c3e50', fontWeight: 500 }}>{s.username}</TableCell>
                                    <TableCell sx={{ color: '#2c3e50', fontWeight: 500 }}>{s.email}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
            >
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the selected students? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">Cancel</Button>
                    <Button onClick={handleDeleteSelectedStudents} color="error">Delete</Button>
                </DialogActions>
            </Dialog>
        </App>
    );
}

export default Students;
