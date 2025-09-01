import React from "react";
import axios from "axios";
import {
    Paper,
    Button,
    Typography,
    Select,
    MenuItem,
    TextField,
    Alert, Breadcrumbs, Box,
} from "@mui/material";
import { API_ENDPOINT } from "../config";
import App from "../App";
import { Link, useLocation, useNavigate } from "react-router-dom";

function AddGrade(props) {
    const location = useLocation();
    const initialData = location.state || {};
    const navigate = useNavigate();

    const [grade, setGrade] = React.useState({
        student_id: initialData.student_id || "",
        module_code: initialData.module_id || "",
        score: initialData.score || "",
        id: initialData.id || "", // Assuming `id` is provided when editing an existing grade
    });
    console.log("Initial data:", initialData);
    const [registrations, setRegistrations] = React.useState([]);
    const [grades, setGrades] = React.useState([]); // Store existing Grades
    const [error, setError] = React.useState();

    // Dynamically filter modules based on selected student_id
    const selectedStudentModules = registrations
        .find((r) => r.student.id === grade.student_id)?.modules || [];

    React.useEffect(() => {
        // Fetch registrations
        axios
            .get(`${API_ENDPOINT}/registrations`)
            .then((response) => {
                console.log("Registrations response:", response.data);
                setRegistrations(response.data || []); // Default to empty array
            })
            .catch((response) => setError(response.message));

        // Fetch grades
        axios
            .get(`${API_ENDPOINT}/grades`)
            .then((response) => {
                console.log("Grades response:", response.data);
                setGrades(response.data || []); // Default to empty array
            })
            .catch((response) => setError(response.message));
    }, []);

    // Function to handle grade creation or update
    function request() {
        console.log("Sending grade data:", grade);
        const newGrade = {
            score: grade.score,
            student: { id: grade.student_id },
            module: { code: grade.module_code },
        };

        // Check if the student has already been graded for the module
        const existingGrade = grades.find(
            (g) => g.student.id === grade.student_id && g.module.code === grade.module_code
        );
        console.log(grade.student_id, grade.module_code);
        console.log("Existing grade:", existingGrade);

        if (existingGrade) {
            console.log("Existing grade found:", existingGrade.id)
            console.log("Updating grade:", newGrade)
            // Update the existing grade
            axios
                .post(`${API_ENDPOINT}/grades`, newGrade)
                .then(() => {
                    console.log("Grade updated", existingGrade.id);
                    setGrade({ student_id: "", module_code: "", score: "", id: "" }); // Clear the form
                    setError(null);
                    navigate(-1); // Go back to the previous page
                })
                .catch((response) => {
                    setError(response.message);
                });
        } else {
            // Create a new grade
            console.log("No existing grade found")
            axios
                .post(`${API_ENDPOINT}/grades`, newGrade)
                .then(() => {
                    console.log("Sending grade data:", grade);
                    setGrade({ student_id: "", module_code: "", score: "" }); // Clear the form
                    setError(null);
                    navigate(-1); // Go back to the previous page
                })
                .catch((response) => {
                    setError(response.message);
                });
        }
    }

    return (
        <App>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
                <Breadcrumbs>
                    <Link underline="hover" color="inherit" to="/">
                        Home
                    </Link>
                    <Link underline="hover" color="inherit" to="/grades">
                        Grades
                    </Link>
                    <Typography sx={{ color: "text.primary" }}>{grade.id ? "Edit Grade" : "Add Grade"}</Typography>
                </Breadcrumbs>
            </Box>
            <Paper sx={{ padding: "30px" }}>
                <Typography variant="h5">{grade.id ? "Edit Grade" : "Add Grade"}</Typography>
                <br />

                {/* Student Dropdown */}
                <Select
                    sx={{ minWidth: "300px" }}
                    value={grade.student_id || ""}
                    onChange={(e) => {
                        const selectedStudentId = e.target.value;
                        setGrade({
                            ...grade,
                            student_id: selectedStudentId,
                            module_code: "", // Reset module_code when student changes
                        });
                    }}
                    label="Student"
                >
                    <MenuItem value="" disabled>Select a student</MenuItem>
                    {[...new Map(registrations.map((r) => [r.student.id, r])).values()]
                        .map((r) => (
                            <MenuItem key={r.student.id} value={r.student.id}>
                                {`${r.student.firstName} ${r.student.lastName} (${r.student.id})`}
                            </MenuItem>
                        ))}
                </Select>

                {/* Module Dropdown */}
                <Select
                    sx={{ minWidth: "300px" }}
                    value={grade.module_code || ""}
                    onChange={(e) => setGrade({ ...grade, module_code: e.target.value })}
                    label="Module"
                    disabled={!grade.student_id && !grade.module_code} // Enable if module_code is preset
                >
                    <MenuItem value="" disabled>Select a module</MenuItem>
                    {registrations
                        .filter((r) => r.student.id === grade.student_id) // Only include registrations for selected student
                        .map((r) => (
                            <MenuItem key={r.module.code} value={r.module.code}>
                                {`${r.module.code} - ${r.module.name}`}
                            </MenuItem>
                        ))}
                </Select>
                <TextField
                    label="Score"
                    value={grade.score || ""}
                    onChange={(e) => {
                        let value = e.target.value;
                        // Ensure the value is numeric
                        if (/^\d*$/.test(value)) {
                            if (value < 0) value = 0;
                            if (value > 100) value = 100;
                            setGrade({ ...grade, score: value });
                        }
                        else {
                            setError("Score must be a number");
                        }
                    }}
                />
                <br />

                <Button onClick={request}>{grade.id ? "Update" : "Add"}</Button>
                <br />

                {error && <Alert color="error">{error}</Alert>}
            </Paper>
        </App>
    );
}

export default AddGrade;
