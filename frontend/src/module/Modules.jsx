import React from "react";
import axios from "axios";
import {
    Breadcrumbs,
    Typography,
    Alert,
    Grid,
    Box,
    Button,
    Card,
    CardMedia,
    CardContent,
} from "@mui/material";
import App from "../App.jsx";
import { API_ENDPOINT } from "../config";
//import AddModule from "./AddModule";
import { useNavigate, Link } from "react-router-dom";

function Modules() {
    const [modules, setModules] = React.useState([]);
    const [error, setError] = React.useState();
    const navigate = useNavigate();

    React.useEffect(() => {
        updateModules();
    }, []);

    function updateModules() {
        axios
            .get(`${API_ENDPOINT}/modules`)
            .then((response) => {
                console.log("Received modules: ", response.data);
                setModules(response.data);
            })
            .catch((error) => {
                setError(error.message);
            });
    }

    const handleAddModule = () => {
        navigate("/modules/addModule");
    };

    const defaultImages = [
        "https://online.liverpool.ac.uk/tachyon/sites/8/2021/06/lms-glasses-1440-500.jpg",
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        "https://images.unsplash.com/photo-1518770660439-4636190af475?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
        "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", 
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", 
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",   
    ];

    return (
        <App>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ marginBottom: "30px" }}>
                <Breadcrumbs separator="›" aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" to="/" style={{ textDecoration: 'none', fontWeight: 500, color: '#2c3e50' }}>
                        Home
                    </Link>
                    <Typography sx={{ color: "text.primary", fontWeight: "bold" }}>Modules</Typography>
                </Breadcrumbs>
                <Button 
                    variant="contained" 
                    onClick={handleAddModule}
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
                    Add Module
                </Button>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {!error && modules.length < 1 && (
                <Alert severity="warning">No modules available</Alert>
            )}
            <Grid container spacing={3}>
                {modules.map((m, index) => (
                    <Grid item xs={12} sm={6} md={4} key={m.code}>
                        <Link to={`/modules/${m.code}`} style={{ textDecoration: 'none' }}>
                            <Card
                                sx={{
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "space-between",
                                    height: "100%",
                                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
                                    borderRadius: "10px",
                                    transition: "transform 0.3s ease-in-out",
                                    '&:hover': {
                                        transform: "scale(1.02)",
                                        boxShadow: "0 12px 24px rgba(0, 0, 0, 0.15)"
                                    }
                                }}
                            >
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={m.imageUrl || defaultImages[index % defaultImages.length]} // Use unique or default image
                                    alt={m.code}
                                    sx={{
                                        transition: "transform 0.3s ease-in-out",
                                        "&:hover": { transform: "scale(1.1)" },
                                    }}
                                />
                                <CardContent>
                                    <Typography 
                                        variant="h6" 
                                        component="div"
                                        sx={{
                                            fontWeight: 600,
                                            color: '#2c3e50',
                                            mb: 1
                                        }}
                                    >
                                        {m.name}
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        color="text.secondary"
                                        sx={{
                                            fontWeight: 500,
                                            color: '#555'
                                        }}
                                    >
                                        Module Code: {m.code}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Link>
                    </Grid>
                ))}
            </Grid>

            <br />
        </App>
    );
}

export default Modules;
