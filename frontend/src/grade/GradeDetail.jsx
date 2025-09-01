import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {Typography, Container, CircularProgress, Alert, Button, Breadcrumbs, Box} from '@mui/material';
import { API_ENDPOINT } from "../config";
import axios from "axios";
import App from "../App.jsx"; // Assuming you have an App component for the layout
import { Link } from "react-router-dom";

const GradeDetail = () => {
    const { id } = useParams();
    const { score } = useState(null)
    const [grade, setGrade] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_ENDPOINT}/grades`)
            .then((response) => {
                console.log("Received grade: ", response.data);
                const foundGrade = response.data.find(m => m.id === parseInt(id)); // Locate the module with matching id
                setGrade(foundGrade);
                console.log("Set grade: ", foundGrade);
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) return <CircularProgress />;
    if (error) return <Alert severity="error">Error: {error}</Alert>;

    return (
        <App>
            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ marginBottom: "30px" }}>
                <Breadcrumbs>
                    <Link underline="hover" color="inherit" href="/" to={"/"}>
                        Home
                    </Link>
                    <Link underline="hover" color="inherit" href="/grades" to={"/grades"}>
                        Grades
                    </Link>
                    <Typography sx={{ color: "text.primary" }}>{grade.id}</Typography>
                </Breadcrumbs>
            </Box>
            {grade ? (
                <>
                    <Typography variant="h4" gutterBottom>
                        {grade.score}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Student ID: {grade.student.firstName}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        Module ID: {grade.module.name}
                    </Typography>
                    {/* Add other grade details here as needed */}
                </>
            ) : (
                <Typography variant="h6">Grade not found</Typography>
            )}
        </App>
    );
}

export default GradeDetail;
