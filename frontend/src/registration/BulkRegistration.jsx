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
import {useNavigate, Link, useLocation, useNavigation} from "react-router-dom";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import App from "../App";
import { API_ENDPOINT } from "../config";

function BulkRegistration() {
    const [students, setStudents] = useState([]);
    const [alreadyRegisteredStudents, setAlreadyRegisteredStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState(new Set());
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "id", direction: "asc" });
    const [filter, setFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = location.state || {};

    useEffect(() => {
        updateStudents();
        updateAlreadyRegisteredStudents();
    }, []);

    useEffect(() => {
        // Pre-select students who are already registered by adding their ids to the selectedStudents set
        const preSelectedStudents = new Set(alreadyRegisteredStudents.map(student => student.id));
        setSelectedStudents(prevSelected => new Set([...prevSelected, ...preSelectedStudents]));
    }, [alreadyRegisteredStudents]);

    useEffect(() => {
        applyFilterAndSort();
    }, [students, filter, sortConfig]);

    const updateAlreadyRegisteredStudents = () => {
        axios.get(`${API_ENDPOINT}/modules/${initialData.module_id}/students`)
            .then((response) => {
                setAlreadyRegisteredStudents(response.data || []);
                setError(null);
            })
            .catch((error) => {
                setError(error.message || "Error fetching students");
            });
        console.log(alreadyRegisteredStudents)
    };

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

    const handleStudentSelect = (id) => {
        const newSelected = new Set(selectedStudents);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedStudents(newSelected);
    };

    const handleRegisterSelectedStudents = () => {
        selectedStudents.forEach(id => {
            const newRegistration = {
                student: { id: id },
                module: { code: initialData.module_id },
            };
            console.log("This is the data:", newRegistration);

            console.log(id)
            axios
                .post(`${API_ENDPOINT}/registrations`, newRegistration)
                .catch((response) => {
                    setError(response.message);
                });
        });
        setDialogOpen(false); // Close the dialog after deleting
        navigate(`/modules/${initialData.module_id}`);
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
                {/* Profession Title and Action Buttons */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1 }}>
                        <Typography variant="h4" color="text.primary">
                            Student Registration
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Select students to register them for the module (ID: {initialData.module_id})
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={openDialog}
                        disabled={selectedStudents.size === 0}
                    >
                        Register Selected
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
            />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!error && filteredStudents.length === 0 && <Alert severity="warning" sx={{ mb: 2 }}>No students found</Alert>}

            {filteredStudents.length > 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell> {/* Checkbox for selection */}
                                <TableCell onClick={() => handleSort("id")} style={{ cursor: "pointer" }}>
                                    Student ID {getSortIcon("id")}
                                </TableCell>
                                <TableCell onClick={() => handleSort("firstName")} style={{ cursor: "pointer" }}>
                                    First Name {getSortIcon("firstName")}
                                </TableCell>
                                <TableCell onClick={() => handleSort("lastName")} style={{ cursor: "pointer" }}>
                                    Last Name {getSortIcon("lastName")}
                                </TableCell>
                                <TableCell onClick={() => handleSort("username")} style={{ cursor: "pointer" }}>
                                    Username {getSortIcon("username")}
                                </TableCell>
                                <TableCell onClick={() => handleSort("email")} style={{ cursor: "pointer" }}>
                                    Email {getSortIcon("email")}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredStudents.map((s) => {
                                const isRegistered = alreadyRegisteredStudents.some((student) => student.id === s.id);
                                return (
                                    <TableRow
                                        key={s.id}
                                        hover
                                        onClick={(event) => {
                                            // Prevent navigation and handle checkbox selection on row click
                                            if (!isRegistered) {
                                                handleStudentSelect(s.id); // Toggle checkbox on row click
                                            }
                                            event.stopPropagation(); // Prevent further action (like navigating)
                                        }}
                                        style={{
                                            cursor: isRegistered ? 'not-allowed' : 'pointer', // Prevent pointer on disabled rows
                                            backgroundColor: isRegistered ? '#f5f5f5' : 'transparent', // Change background color for registered students
                                            opacity: isRegistered ? 0.6 : 1 // Apply opacity to indicate disabled state
                                        }}
                                    >
                                        <TableCell sx={{ position: 'relative', zIndex: 10 }}>
                                            <Checkbox
                                                checked={selectedStudents.has(s.id)} // Pre-select checkboxes for already registered students
                                                onChange={() => handleStudentSelect(s.id)}
                                                onClick={(event) => event.stopPropagation()} // Prevent checkbox click from triggering row click
                                                disabled={isRegistered} // Disable checkbox for already registered students
                                                sx={{ position: 'relative', zIndex: 10 }}
                                            />
                                        </TableCell>
                                        <TableCell>{s.id}</TableCell>
                                        <TableCell>{s.firstName}</TableCell>
                                        <TableCell>{s.lastName}</TableCell>
                                        <TableCell>{s.username}</TableCell>
                                        <TableCell>{s.email}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>

                    </Table>
                </TableContainer>
            )}

            {/* Confirmation Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
            >
                <DialogTitle>Confirm Registration</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to register the selected students?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">Cancel</Button>
                    <Button onClick={handleRegisterSelectedStudents} color="error">Register</Button>
                </DialogActions>
            </Dialog>
        </App>
    );
}

export default BulkRegistration;
