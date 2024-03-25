import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Button, TextField, Typography, Container, Grid } from '@mui/material';

const Login = () => {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);
    const [data, setData] = useState({})

   

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            axios.defaults.withCredentials = true;
            const response = await axios.post('http://localhost:8000/auth/login',
                {
                    email: email,
                    password: password,
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
             console.log(response,"resdata")   

            // ログイン成功後に data state を更新
            console.log('Login successful');

            setCookie("token", response.data.token);

            // ... ログイン成功時の処理

            navigate(`/mypage`);

        } catch (error: any) {
            console.error('Login failed:', error.response.data.message);
            setError(error.response.data.message);
        }
    };
   
     useEffect(() => {
        if (cookies.token) {
            // ログイン済みの場合、マイページにリダイレクト
            navigate(`/mypage`);
        }
    }, [cookies.token, navigate]);





    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    return (
        <>
        <Container maxWidth="xs">
            <Typography variant="h4" align="center" gutterBottom>
                Login
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label="Email"
                            type="email"
                            fullWidth
                            value={email}
                            onChange={handleEmailChange}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label="Password"
                            type="password"
                            fullWidth
                            value={password}
                            onChange={handlePasswordChange}
                        />
                    </Grid>
                </Grid>
                <Button type="submit" variant="contained" color="primary" fullWidth>
                    Login
                </Button>
                {error && <Typography color="error" align="center">{error}</Typography>}
            </form>
        </Container>
    </>
    );
};

export default Login;
