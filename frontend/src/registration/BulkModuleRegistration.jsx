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

function BulkModuleRegistration() {
    const [Modules, setModules] = useState([]);
    const [alreadyRegisteredModules, setAlreadyRegisteredModules] = useState([]);
    const [filteredModules, setFilteredModules] = useState([]);
    const [selectedModules, setSelectedModules] = useState(new Set());
    const [error, setError] = useState(null);
    const [sortConfig, setSortConfig] = useState({ key: "code", direction: "asc" });
    const [filter, setFilter] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const initialData = location.state || {};

    useEffect(() => {
        updateModules();
        updateAlreadyRegisteredModules();
    }, []);

    useEffect(() => {
        const preSelectedModules = alreadyRegisteredModules.reduce((acc, module) => {
            acc.add(module.code);
            return acc;
        }, new Set());
        console.log(preSelectedModules)
        setSelectedModules(preSelectedModules);
    }, [alreadyRegisteredModules]);


    useEffect(() => {
        applyFilterAndSort();
    }, [Modules, filter, sortConfig]);
    const updateAlreadyRegisteredModules = () => {
        axios.get(`${API_ENDPOINT}/students/${initialData.student_id}/modules`)
            .then((response) => {
                setAlreadyRegisteredModules(response.data || []);
                setError(null);
            })
            .catch((error) => {
                setError(error.message || "Error fetching Modules");
            });
        console.log(alreadyRegisteredModules)
    };

    const updateModules = () => {
        axios.get(`${API_ENDPOINT}/modules`)
            .then((response) => {
                setModules(response.data || []);
                setError(null);
            })
            .catch((error) => {
                setError(error.message || "Error fetching Modules");
            });
    };

    const applyFilterAndSort = () => {
        let filtered = Modules.filter((module) =>
            String(module.code).toLowerCase().includes(filter.toLowerCase()) ||
            module.name.toLowerCase().includes(filter.toLowerCase())
        );

        if (sortConfig.key) {
            filtered.sort((a, b) => {
                const isAscending = sortConfig.direction === "asc";
                if (a[sortConfig.key] < b[sortConfig.key]) return isAscending ? -1 : 1;
                if (a[sortConfig.key] > b[sortConfig.key]) return isAscending ? 1 : -1;
                return 0;
            });
        }
        setFilteredModules(filtered);
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

    const handleModuleSelect = (code) => {
        const newSelected = new Set(selectedModules);
        if (newSelected.has(code)) {
            newSelected.delete(code);
        } else {
            newSelected.add(code);
        }
        setSelectedModules(newSelected);
    };

    const handleRegisterSelectedModules = () => {
        selectedModules.forEach(code => {
            const newRegistration = {
                student: { id: initialData.student_id },
                module: { code: code },
            };

            axios.post(`${API_ENDPOINT}/registrations`, newRegistration)
                .then(response => {
                    console.log('Registration successful:', response);
                })
                .catch((error) => {
                    console.error("Error during registration:", error);
                    setError(error.response?.data?.message || error.message || "Registration failed");
                });
        });

        setDialogOpen(false); // Close the dialog after attempting registration
        navigate(`/students/${initialData.student_id}`);
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
                            Module Registration
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Select modules to register the student (ID: {initialData.student_id})
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        onClick={openDialog}
                        disabled={selectedModules.size === 0}
                    >
                        Register Selected
                    </Button>
                </Box>
            </Box>

            <TextField
                label="Search module"
                variant="outlined"
                fullWidth
                margin="normal"
                value={filter}
                onChange={handleFilterChange}
            />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {!error && filteredModules.length === 0 && <Alert severity="warning" sx={{ mb: 2 }}>No Modules found</Alert>}

            {filteredModules.length > 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell> {/* Checkbox for selection */}
                                <TableCell onClick={() => handleSort("code")} style={{ cursor: "pointer" }}>
                                    Module Code {getSortIcon("code")}
                                </TableCell>
                                <TableCell onClick={() => handleSort("name")} style={{ cursor: "pointer" }}>
                                     Module Title {getSortIcon("name")}
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredModules.map((m) => {
                                const isRegistered = alreadyRegisteredModules.some((module) => module.code === m.code);
                                return (
                                    <TableRow
                                        key={m.code}
                                        hover
                                        onClick={(event) => {
                                            if (!isRegistered) {
                                                handleModuleSelect(m.code); // Toggle checkbox on row click
                                            }
                                            event.stopPropagation(); // Prevent further action (like navigating)
                                        }}

                                        style={{
                                            cursor: isRegistered ? 'not-allowed' : 'pointer', // Prevent pointer on disabled rows
                                            backgroundColor: isRegistered ? '#f5f5f5' : 'transparent', // Change background color for registered modules
                                            opacity: isRegistered ? 0.6 : 1 // Apply opacity to indicate disabled state
                                        }}
                                    >
                                        <TableCell sx={{ position: 'relative', zIndex: 10 }}>
                                            <Checkbox
                                                checked={selectedModules.has(m.code)} // Pre-select checkboxes for already registered modules
                                                onChange={() => handleModuleSelect(m.code)}
                                                onClick={(event) => event.stopPropagation()} // Prevent checkbox click from triggering row click
                                                disabled={isRegistered} // Disable checkbox for already registered modules
                                                sx={{ position: 'relative', zIndex: 10 }}
                                            />
                                        </TableCell>
                                        <TableCell>{m.code}</TableCell>
                                        <TableCell>{m.name}</TableCell>
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
                        Are you sure you want to register the selected Modules?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog} color="primary">Cancel</Button>
                    <Button onClick={handleRegisterSelectedModules} color="error">Register</Button>
                </DialogActions>
            </Dialog>
        </App>
    );
}

export default BulkModuleRegistration;
