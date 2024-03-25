import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { Button, TextField, Typography, Container, Grid } from '@mui/material';

const SignUp = () => {
    const [name, setName] = useState("")
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies(["token"]);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            axios.defaults.withCredentials = true;
            const response = await axios.post('http://localhost:8000/auth/register', {
                name: name,
                email: email,
                password: password
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            console.log('Registration successful');
            setCookie("token", response.data.token);

            // ログインページにリダイレクトするなどの処理を追加
            navigate(`/mypage`);
        } catch (error: any) { // エラーを any 型でキャッチ
            console.error('Login failed:', error.response.data.message);
            setError(error.response.data.message);
        }
    };
    const handleNameChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        setName(e.target.value)
    }
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(e.target.value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPassword(e.target.value);
    };

    return (
        <Container maxWidth="xs">
            <Typography variant="h4" align="center" gutterBottom>
                Sign Up
            </Typography>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                <Grid item xs={12}>
                        <TextField
                            variant="outlined"
                            label="name"
                            type="text"
                            fullWidth
                            value={name}
                            onChange={handleNameChange}
                        />
                    </Grid>
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
                    Sign Up
                </Button>
                {error && <Typography color="error" align="center">{error}</Typography>}
            </form>
        </Container>
    );
};

export default SignUp;
