// ErrorPage.jsx
import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ErrorPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <Container maxWidth="sm" sx={{ textAlign: 'center', mt: 8 }}>
            <ErrorOutlineIcon 
                sx={{ 
                    fontSize: 80, 
                    color: 'error.main', 
                    mb: 2,
                    animation: 'bounce 2s infinite',
                    '@keyframes bounce': {
                        '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
                        '40%': { transform: 'translateY(-10px)' },  
                        '60%': { transform: 'translateY(-5px)' },
                    },
                }} 
            />
            <Typography variant="h3" component="h1" gutterBottom>
                Page Not Found
            </Typography>
            <Typography variant="body1" gutterBottom>
                Sorry, the page you are looking for does not exist.
            </Typography>
            <Box mt={4}>
                <Button variant="contained" color="primary" onClick={handleGoHome}>
                    Go to Home
                </Button>
            </Box>
        </Container>
    );
};

export default ErrorPage;