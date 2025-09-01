import React from "react";
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
    Box
} from "@mui/material";
import App from "../App";
import { API_ENDPOINT } from "../config";
import { useNavigate, Link } from "react-router-dom";

function Grades() {
    const [grades, setGrades] = React.useState([]);
    const [error, setError] = React.useState(null);
    const navigate = useNavigate();

    React.useEffect(() => {
        console.log("Component loaded, fetching grades.");
        updateGrades();
    }, []);

    function updateGrades() {
        console.log("Attempting to GET grades data.");
        axios
            .get(`${API_ENDPOINT}/grades`)
            .then((response) => {
                console.log("Received grades: ", response.data);
                setGrades(response.data || []);
                setError(null);
            })
            .catch((error) => {
                setError(error.message || "Error fetching grades");
            });
    }

    const handleAddGrade = () => {
        navigate("/grades/AddGrade");
    };

    return (
        <App>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
                <Breadcrumbs>
                    <Link underline="hover" color="inherit" to="/">
                        Home
                    </Link>
                    <Typography sx={{ color: "text.primary" }}>Grades</Typography>
                </Breadcrumbs>
                <Button variant="contained" onClick={handleAddGrade}>
                    Add
                </Button>
            </Box>

            {error && <Alert color="error">{error}</Alert>}
            {!error && grades.length < 1 && (
                <Alert color="warning">No grades</Alert>
            )}

            {grades.length > 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Grade ID</TableCell>
                                <TableCell>Score</TableCell>
                                <TableCell>Student ID</TableCell>
                                <TableCell>Module Code</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {grades.map((g) => (
                                <TableRow
                                    key={g.id}
                                    hover
                                    onClick={() => navigate(`/grades/${g.id}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <TableCell>{g.id}</TableCell>
                                    <TableCell>{g.score}</TableCell>
                                    <TableCell>{g.student.id}</TableCell>
                                    <TableCell>{g.module.code}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </App>
    );
}

export default Grades;
