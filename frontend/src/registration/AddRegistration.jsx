import React from "react";
import axios from "axios";
import {
    Paper,
    Button,
    Typography,
    Select,
    MenuItem,
    Alert, Box, Breadcrumbs,
} from "@mui/material";
import { API_ENDPOINT } from "../config";
import {Link} from "react-router-dom";
import App from "../App.jsx";
import { useLocation, useNavigate } from "react-router-dom";

function AddRegistration() {
    const location = useLocation();
    const initialData = location.state || {};
    const navigate = useNavigate();

    console.log("Location State:", location.state);
    console.log("Initial data:", initialData);

    // Set initial registration state to pre-fill with data passed through location.state
    const [registration, setRegistration] = React.useState({
        student_id: initialData.student_id || "",  // Corrected this line
        module_id: initialData.module_id || "",    // Optionally pre-select module_id if passed
    });

    const [students, setStudents] = React.useState([]);
    const [modules, setModules] = React.useState([]);
    const [error, setError] = React.useState();

    React.useEffect(() => {
        // Fetch students
        axios
            .get(`${API_ENDPOINT}/students`)
            .then((response) => {
                console.log("Students response:", response.data);
                setStudents(response.data || []);
            })
            .catch((response) => setError(response.message));

        // Fetch modules
        axios
            .get(`${API_ENDPOINT}/modules`)
            .then((response) => {
                console.log("Modules response:", response.data);
                setModules(response.data || []);
            })
            .catch((response) => setError(response.message));
    }, []);

    function request() {
        console.log("Sending registration data:", registration);
        console.log("modue code:", registration.module_code);
        const newRegistration = {
            student: { id: registration.student_id },
            module: { code: registration.module_code },
        };
        console.log("This is the data:", newRegistration);

        axios
            .post(`${API_ENDPOINT}/registrations`, newRegistration)
            .then(() => {
                setRegistration({ student_id: "", module_id: "" }); // Clear the form
                setError(null);
                navigate(-1);
            })
            .catch((response) => {
                setError(response.message);
            });
    }

    return (
        <App>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
                <Breadcrumbs>
                    <Link underline="hover" color="inherit" to="/">
                        Home
                    </Link>
                    <Link underline="hover" color="inherit" to="/registration">
                        Registrations
                    </Link>
                    <Typography sx={{ color: "text.primary" }}>Add Registration</Typography>
                </Breadcrumbs>
            </Box>
            <Paper sx={{padding: "30px"}}>
                <Typography variant="h5">Add Registration</Typography>
                <br/>

                {/* Student Dropdown */}
                <Select
                    sx={{minWidth: "300px"}}
                    value={registration.student_id || ""}
                    onChange={(e) => setRegistration({...registration, student_id: e.target.value})}
                    label="Student"
                >
                    <MenuItem value="" disabled>Select a student</MenuItem>
                    {students.map((s) => (
                        <MenuItem key={s.id} value={s.id}>
                            {`${s.firstName} ${s.lastName} (${s.id})`}
                        </MenuItem>
                    ))}
                </Select>
                <br/>
                <br/>

                {/* Module Dropdown */}
                <Select
                    sx={{minWidth: "300px"}}
                    value={registration.module_code || ""}
                    onChange={(e) => setRegistration({...registration, module_code: e.target.value})}
                    label="Module"
                >
                    <MenuItem value="" disabled>Select a module</MenuItem>
                    {modules.map((m) => (
                        <MenuItem key={m.code} value={m.code}>
                            {`${m.code} - ${m.name}`}
                        </MenuItem>
                    ))}
                </Select>

                <br/>
                <br/>

                <Button onClick={request}>Add</Button>
                <br/>

                {error && <Alert color="error">{error}</Alert>}
            </Paper>
        </App>
    );
}

export default AddRegistration;
