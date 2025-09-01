import React from "react";
import axios from "axios";
import {
    Paper,
    TextField,
    Switch,
    FormControlLabel,
    Button,
    Typography,
    Alert,
    Box,
    Breadcrumbs,
} from "@mui/material";
import { API_ENDPOINT } from "../config";
import App from "../App.jsx";
import { useLocation, useNavigate, Link } from "react-router-dom"; // Use Link from react-router-dom

function AddModule(props) {
    const location = useLocation();
    const existingModule = location.state?.module || null;
    const navigate = useNavigate();

    const [module, setModule] = React.useState({
        code: existingModule ? existingModule.code : "",  // Ensure code is an empty string
        name: existingModule ? existingModule.name : "",
        mnc: existingModule ? existingModule.mnc : false
    });
    const [error, setError] = React.useState();

    function request() {
        console.log("Sending Module data:", module);
        axios
            .post(`${API_ENDPOINT}/modules`, module)
            .then(() => {
                navigate(`/modules/${module.code}`);
                setModule({ code: "", name: "", mnc: false }); // Clear the form
                setError(null);
            })
            .catch((response) => {
                setError(response.message);
            });
    }

    return (
        <App> {/* Use App component for layout */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "30px" }}>
                <Breadcrumbs separator="›" aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" to="/" style={{ textDecoration: 'none', fontWeight: 500, color: '#2c3e50' }}>
                        Home
                    </Link>
                    <Link underline="hover" color="inherit" to="/modules" style={{ textDecoration: 'none', fontWeight: 500, color: '#2c3e50' }}>
                        Modules
                    </Link>
                    <Typography sx={{ color: "text.primary", fontWeight: "bold" }}>Add Module</Typography>
                </Breadcrumbs>
            </Box>

            <Paper sx={{ padding: "30px", borderRadius: 2, boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                <Typography variant="h5" sx={{ fontWeight: 600, color: '#2c3e50', mb: 3 }}>Add/Update Module</Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Module Code"
                        value={module.code}
                        onChange={(e) => {
                            setModule({...module, code: e.target.value.toUpperCase()});
                        }}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Module Name"
                        value={module.name}
                        onChange={(e) => {
                            setModule({...module, name: e.target.value});
                        }}
                        fullWidth
                        margin="normal"
                    />
                    <FormControlLabel
                        control={
                            <Switch
                                checked={module.mnc ?? false}
                                id="is_mnc"
                                onChange={(e) => {
                                    setModule({...module, mnc: e.target.checked});
                                }}
                            />
                        }
                        label="Mandatory?"
                        sx={{ alignSelf: 'center' }} // Center the toggle
                    />
                    <Button 
                        variant="contained" 
                        onClick={request}
                        sx={{ 
                            mt: 0,
                            bgcolor: 'primary.main',
                            '&:hover': {
                                bgcolor: 'primary.dark',
                            },
                            textTransform: 'none',
                            borderRadius: 2,
                            px: 3,
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            alignSelf: 'center' // Center the button
                        }}
                    >
                        Add/Update
                    </Button>
                    {error && <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>}
                </Box>
            </Paper>
        </App>
    );
}

export default AddModule;