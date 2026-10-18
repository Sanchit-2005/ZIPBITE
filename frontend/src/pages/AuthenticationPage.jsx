import * as React from "react";
import { useState, useContext } from "react";
import {
  Avatar,
  Button,
  Checkbox,
  CssBaseline,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Box,
  Grid,
  TextField,
  Typography,
  Snackbar,
  Divider,
} from "@mui/material";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import GoogleIcon from "@mui/icons-material/Google";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Authcontext } from "../context/Authcontext.jsx";
import illustration from "/login.jpg";

const theme = createTheme({
  palette: {
    primary: { main: "#5036ed" },
  },
  typography: {
    fontFamily: "Arial, sans-serif",
  },
});

export default function Authentication() {
  const [formState, setFormState] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  const { handleLogin, handleRegister } = useContext(Authcontext);

  const handleAuth = async (event) => {
    event.preventDefault();

    try {
      const result =
        formState === 0
          ? await handleLogin(email, password)
          : await handleRegister(name, email, password);

      setMessage(
        typeof result === "string"
          ? result
          : result?.message || "Request completed.",
      );
      setOpen(true);

      if (formState === 1) {
        setFormState(0);
        setPassword("");
      }
    } catch (error) {
      console.log(error);
      setMessage(error?.response?.data?.message || "Something went wrong.");

      setOpen(true);
    }
  };

  const handleGoogleSignup = () => {
    setMessage("Google sign-in needs to be configured in your backend first.");
    setOpen(true);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#d5d6e9",
          p: { xs: 1, md: 3 },
        }}
      >
        <Paper
          elevation={8}
          sx={{
            width: "100%",
            maxWidth: 1100,
            minHeight: { md: 700 },
            display: "flex",
            overflow: "hidden",
            borderRadius: 0,
          }}
        >
          {/* Login form */}
          <Box
            sx={{
              width: { xs: "100%", md: "45%" },
              p: { xs: 3, sm: 5, md: 7 },
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            }}
          >
            <Avatar
              sx={{
                bgcolor: "transparent",
                color: "#5036ed",
                mb: 3,
                width: 44,
                height: 44,
              }}
            >
              <LockPersonIcon fontSize="large" />
            </Avatar>

            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ color: "#11102d", mb: 1 }}
            >
              {formState === 0 ? "Welcome back !" : "Create an account"}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {formState === 0
                ? "Enter to get unlimited access to data & information."
                : "Register to get started with your account."}
            </Typography>

            <Box component="form" onSubmit={handleAuth}>
              {formState === 1 && (
                <TextField
                  label="Full Name"
                  fullWidth
                  required
                  margin="normal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              )}

              <Typography variant="body2" fontWeight={600} sx={{ mt: 1 }}>
                Email{" "}
                <Box component="span" color="error.main">
                  *
                </Box>
              </Typography>

              <TextField
                placeholder="Enter your mail address"
                type="email"
                fullWidth
                required
                margin="dense"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Typography variant="body2" fontWeight={600}>
                Password{" "}
                <Box component="span" color="error.main">
                  *
                </Box>
              </Typography>

              <TextField
                placeholder="Enter password"
                type={showPassword ? "text" : "password"}
                fullWidth
                required
                margin="dense"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          aria-label="Toggle password visibility"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ mb: 1 }}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                }}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      size="small"
                    />
                  }
                  label={<Typography variant="caption">Remember me</Typography>}
                />

               
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.4,
                  textTransform: "none",
                  borderRadius: 2,
                }}
              >
                {formState === 0 ? "Log In" : "Create Account"}
              </Button>
            </Box>

            <Typography variant="body2" textAlign="center" sx={{ mt: 3 }}>
              {formState === 0
                ? "Don’t have an account? "
                : "Already have an account? "}
              <Link
                component="button"
                type="button"
                underline="always"
                onClick={() => {
                  setFormState((prev) => (prev === 0 ? 1 : 0));
                  setMessage("");
                }}
              >
                {formState === 0 ? "Register here" : "Log in"}
              </Link>
            </Typography>
          </Box>

          {/* Right-side illustration */}
          <Box
            sx={{
              display: { xs: "none", md: "block" },
              width: "55%",
              backgroundColor: "#24248f",
            }}
          >
            <Box
              component="img"
              src={illustration}
              alt="Abstract geometric illustration"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={open}
        autoHideDuration={4000}
        onClose={() => setOpen(false)}
        message={message}
      />
    </ThemeProvider>
  );
}
