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
    TableSortLabel,
    Paper,
    Box,
    TextField,
    TablePagination,
} from "@mui/material";
import App from "../App";
import { API_ENDPOINT } from "../config";
import { useNavigate, Link } from "react-router-dom";

function Registrations() {
    const [registrations, setRegistrations] = useState([]);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [sortOrder, setSortOrder] = useState("asc");
    const [sortColumn, setSortColumn] = useState("id");
    const navigate = useNavigate();

    useEffect(() => {
        updateRegistrations();
    }, []);

    const updateRegistrations = () => {
        axios
            .get(`${API_ENDPOINT}/registrations`)
            .then((response) => {
                setRegistrations(response.data || []);
                setError(null);
            })
            .catch((error) => {
                setError(error.message || "Error fetching registrations");
            });
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleAddRegistration = () => {
        navigate("/registration/AddRegistration");
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleSort = (column) => {
        const isAsc = sortColumn === column && sortOrder === "asc";
        setSortOrder(isAsc ? "desc" : "asc");
        setSortColumn(column);
    };

    const sortedRegistrations = [...registrations]
        .filter((registration) =>
            registration.student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            registration.module.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            const order = sortOrder === "asc" ? 1 : -1;
            if (a[sortColumn] < b[sortColumn]) return -1 * order;
            if (a[sortColumn] > b[sortColumn]) return 1 * order;
            return 0;
        });

    return (
        <App>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
                <Breadcrumbs>
                    <Link underline="hover" color="inherit" to="/">
                        Home
                    </Link>
                    <Typography color="text.primary">Registrations</Typography>
                </Breadcrumbs>
                <Button variant="contained" onClick={handleAddRegistration}>
                    Add Registration
                </Button>
            </Box>

            <TextField
                label="Search by Student or Module"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchQuery}
                onChange={handleSearchChange}
            />

            {error && <Alert severity="error">{error}</Alert>}
            {!error && sortedRegistrations.length === 0 && (
                <Alert severity="warning">No registrations found</Alert>
            )}

            {sortedRegistrations.length > 0 && (
                <>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortColumn === "id"}
                                            direction={sortOrder}
                                            onClick={() => handleSort("id")}
                                        >
                                            Registration ID
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortColumn === "student.id"}
                                            direction={sortOrder}
                                            onClick={() => handleSort("student.id")}
                                        >
                                            Student ID
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>First Name</TableCell>
                                    <TableCell>Last Name</TableCell>
                                    <TableCell>
                                        <TableSortLabel
                                            active={sortColumn === "module.code"}
                                            direction={sortOrder}
                                            onClick={() => handleSort("module.code")}
                                        >
                                            Module Code
                                        </TableSortLabel>
                                    </TableCell>
                                    <TableCell>Module Name</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {sortedRegistrations
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((r) => (
                                        <TableRow
                                            key={r.id}
                                            hover
                                            onClick={() => navigate(`/registration/${r.id}`)}
                                            style={{ cursor: "pointer" }}
                                        >
                                            <TableCell>{r.id}</TableCell>
                                            <TableCell>{r.student.id}</TableCell>
                                            <TableCell>{r.student.firstName}</TableCell>
                                            <TableCell>{r.student.lastName}</TableCell>

                                            <TableCell>{r.module.code}</TableCell>
                                            <TableCell>{r.module.name}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={sortedRegistrations.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                    />
                </>
            )}
        </App>
    );
}

export default Registrations;
