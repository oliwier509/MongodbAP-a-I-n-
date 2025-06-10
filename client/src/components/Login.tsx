import React, { Component, ChangeEvent, FormEvent } from "react";
import { TextField, Button, Container, Typography, Alert } from '@mui/material';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import config from '../config';

interface Account {
   username: string;
   password: string;
}

interface Errors {
   username?: string;
   password?: string;
   server?: string;
}

interface State {
   account: Account;
   errors: Errors;
}

class LoginForm extends Component<{}, State> {
   state: State = {
       account: {
           username: "",
           password: ""
       },
       errors: {}
   };

   validate = (): Errors | null => {
       const errors: Errors = {};
       const { account } = this.state;

       if (account.username.trim() === '') {
           errors.username = 'Username is required!';
       }
       if (account.password.trim() === '') {
           errors.password = 'Password is required!';
       }

       return Object.keys(errors).length === 0 ? null : errors;
   };

   handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;

    try {
        const response = await axios.post(`${config.apiBaseUrl}/api/user/auth`, {
            login: this.state.account.username,
            password: this.state.account.password
        });

        console.log('Login successful:', response.data);

        const token = response.data.token;
        localStorage.setItem('token', token);

        interface JwtPayload {
            userId: string;
            [key: string]: any;
        }
        const decoded = jwtDecode<JwtPayload>(token);
        localStorage.setItem('userId', decoded.userId);
        localStorage.setItem('login', decoded.name);
        window.location.href = '/';

    } catch (error: any) {
        console.error('Login error:', error);

        let message = 'Login failed. Please try again.';
        if (axios.isAxiosError(error) && error.response?.data?.error) {
            message = error.response.data.error;
        }

        this.setState({ errors: { server: message } });
    }
};

   handleChange = (event: ChangeEvent<HTMLInputElement>) => {
       const account = { ...this.state.account };
       account[event.currentTarget.name] = event.currentTarget.value;
       this.setState({ account });
   };

   render() {
       return (
           <Container maxWidth="sm">
               <Typography variant="h4" component="h1" gutterBottom>
                   Login
               </Typography>
               <form onSubmit={this.handleSubmit}>
                   <div className="form-group">
                       <TextField
                           label="Username"
                           value={this.state.account.username}
                           name="username"
                           onChange={this.handleChange}
                           fullWidth
                           margin="normal"
                           variant="outlined"
                           sx={{
                             input: { backgroundColor: '#555', color: 'white' },
                             '& .MuiOutlinedInput-root': {
                               '& fieldset': { borderColor: '#888' },
                               '&:hover fieldset': { borderColor: '#bbb' },
                               '&.Mui-focused fieldset': { borderColor: '#00bcd4' },
                             },
                           }}
                       />
                       {this.state.errors.username && (
                           <Alert severity="error">{this.state.errors.username}</Alert>
                       )}
                   </div>
                   <div className="form-group">
                       <TextField
                           label="Password"
                           value={this.state.account.password}
                           name="password"
                           onChange={this.handleChange}
                           type="password"
                           fullWidth
                           margin="normal"
                           variant="outlined"
                           sx={{
                             input: { backgroundColor: '#555', color: 'white' },
                             '& .MuiOutlinedInput-root': {
                               '& fieldset': { borderColor: '#888' },
                               '&:hover fieldset': { borderColor: '#bbb' },
                               '&.Mui-focused fieldset': { borderColor: '#00bcd4' },
                             },
                           }}
                       />
                       {this.state.errors.password && (
                           <Alert severity="error">{this.state.errors.password}</Alert>
                       )}
                   </div>
                   {this.state.errors.server && (
                       <Alert severity="error">{this.state.errors.server}</Alert>
                   )}
                   <Button type="submit" variant="contained" color="primary" fullWidth>
                       Login
                   </Button>

                   <Button
                       component={Link}
                       to="/signup"
                       variant="outlined"
                       color="secondary"
                       fullWidth
                       sx={{ mt: 2 }}
                   >
                       Go to Signup
                   </Button>
               </form>
           </Container>
       );
   }
}

export default LoginForm;
