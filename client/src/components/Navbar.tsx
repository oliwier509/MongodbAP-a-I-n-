import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import LanguageIcon from '@mui/icons-material/Language';
import { Link } from 'react-router-dom';
import KIlogo from '../assets/KI.jpg';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import config from '../config';
import { useSpeechSynthesis } from 'react-speech-kit';
import pogodynka from '../assets/Pogodynka.png';

const pages = ['Devices state'];

interface NavbarProps {
    onViewPastHour: () => void;
}

function Navbar({ onViewPastHour }: NavbarProps) {
    const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
    const [anchorElAdmin, setAnchorElAdmin] = React.useState<null | HTMLElement>(null);

    const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElNav(event.currentTarget);
    };

    const handleCloseNavMenu = () => {
        setAnchorElNav(null);
    };

    const handleOpenAdminMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElAdmin(event.currentTarget);
    };

    const handleCloseAdminMenu = () => {
        setAnchorElAdmin(null);
    };

    const { speak, voices } = useSpeechSynthesis();

    function showOverlay(message: string) {
        let existing = document.getElementById('ai-overlay');
        if (existing) existing.remove();
    
        const overlay = document.createElement('div');
        overlay.id = 'ai-overlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '20px';
        overlay.style.left = '50%';
        overlay.style.transform = 'translateX(-50%)';
        overlay.style.background = 'rgba(0, 0, 0, 0.9)';
        overlay.style.color = 'white';
        overlay.style.padding = '16px';
        overlay.style.borderRadius = '12px';
        overlay.style.zIndex = '9999';
        overlay.style.maxWidth = '90%';
        overlay.style.fontSize = '1rem';
        overlay.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
        overlay.style.textAlign = 'center';
    
        const messagePara = document.createElement('p');
        messagePara.innerText = message;
        messagePara.style.marginBottom = '12px';
        overlay.appendChild(messagePara);
    
        const img = document.createElement('img');
        img.src = pogodynka;
        img.alt = 'Overlay Image';
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.display = 'block';
        img.style.margin = '12px auto 0';
        overlay.appendChild(img);
        
    
        const okButton = document.createElement('button');
        okButton.innerText = 'OK';
        okButton.style.padding = '8px 16px';
        okButton.style.backgroundColor = '#4CAF50';
        okButton.style.color = 'white';
        okButton.style.border = 'none';
        okButton.style.borderRadius = '8px';
        okButton.style.cursor = 'pointer';
        okButton.style.fontSize = '1rem';
        okButton.style.marginTop = '16px';
    
        okButton.onclick = () => {
            overlay.remove();
        };
    
        overlay.appendChild(okButton);
        document.body.appendChild(overlay);
    }

    const handleAdminAction = async (action: string) => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        };

        try {
            switch (action) {
                case 'View past hour':
                    onViewPastHour();
                    break;

                case 'Delete Data':
                    await fetch(`${config.apiBaseUrl}/api/data/all`, {
                        method: 'DELETE',
                        headers,
                    });
                    console.log('Delete Data');
                    window.location.href = '/';
                    break;

                case 'Delete Account':
                    if (!userId) return alert('No user ID found');
                    await fetch(`${config.apiBaseUrl}/api/user/delete/${userId}`, {
                        method: 'DELETE',
                        headers,
                    });
                    console.log('Delete Account');
                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('login');
                    window.location.href = '/login';
                    break;

                case 'Reset Password':
                    const login = localStorage.getItem('login');
                    if (!login) return alert('No login found');

                    console.log(login);

                    const response = await fetch(`${config.apiBaseUrl}/api/user/reset-password`, {
                        method: 'POST',
                        headers,
                        body: JSON.stringify({ login }),
                    });

                    console.log(response);

                    if (response.ok) {
                        const data = await response.json();
                        console.log('Reset Password:', data.newPassword);
                        alert(`New password: ${data.newPassword}`);
                    } else {
                        console.error('Reset Password failed');
                        alert('Password reset failed');
                    }
                    break;

                case 'Logout':
                    if (!userId) return alert('No user ID found');
                    await fetch(`${config.apiBaseUrl}/api/user/logout/${userId}`, {
                        method: 'DELETE',
                        headers,
                    });

                    localStorage.removeItem('token');
                    localStorage.removeItem('userId');
                    localStorage.removeItem('login');
                    window.location.href = '/login';
                    break;

                    case 'Predict✨':
                        try {
                            const response = await fetch(`${config.apiBaseUrl}/api/data/latest`, {
                                method: 'GET',
                                headers,
                            });
                    
                            if (!response.ok) {
                                showOverlay('Failed to fetch device data for prediction.');
                                return;
                            }
                    
                            const data = await response.json();
                    
                            const formattedData = data.map((device: any, index: number) => {
                                const measurements = Object.entries(device)
                                    .filter(([key]) => key.toLowerCase() !== 'deviceid' && key.toLowerCase() !== 'name')
                                    .map(([key, value]) => `${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`)
                                    .join(', ');
                                const deviceLabel = device.deviceId ? `Device ${device.deviceId}` : `Device ${index + 1}`;
                                return `${deviceLabel}: ${measurements}`;
                            }).join('\n');
                    
                            console.log('Formatted Predict data:\n' + formattedData);
                    
                            const promptIntro = `${config.prompt}`;
                            const fullPrompt = promptIntro + formattedData;
                    
                            const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.APIkey}`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    contents: [
                                        {
                                            parts: [
                                                {
                                                    text: fullPrompt,
                                                },
                                            ],
                                        },
                                    ],
                                }),
                            });
                    
                            if (!geminiResponse.ok) {
                                console.error('AI API call failed');
                                showOverlay('Failed to get a response from Gemini AI.');
                                return;
                            }
                    
                            const geminiData = await geminiResponse.json();
                            const geminiReply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
                    
                            console.log('AI reply:', geminiReply);
                    
                            showOverlay(geminiReply);
                            const plVoice = voices.find(v => v.lang === 'pl-PL' && v.name.includes('Adam')) || voices.find(v => v.lang === 'pl-PL');
                            speak({ text: geminiReply,  voice: plVoice });
                    
                        } catch (error) {
                            console.error('Error during Predict action:', error);
                            showOverlay('An error occurred during prediction.');
                        }
                        break;

                default:
                    console.log(`Unknown action: ${action}`);
            }
        } catch (error) {
            console.error(`Admin action "${action}" failed:`, error);
        }

        handleCloseAdminMenu();
    };

    const isLoggedIn = Boolean(localStorage.getItem('token'));

    return (
        <AppBar position="static">
            <Container maxWidth={false} sx={{ backgroundColor: 'black' }}>
                <Toolbar disableGutters>
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            alignItems: 'center',
                            fontFamily: 'monospace',
                            fontWeight: 700,
                            letterSpacing: '.3rem',
                            color: 'inherit',
                            textDecoration: 'none',
                        }}
                    >
                        <LanguageIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
                        IoT Dashboard
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        <IconButton
                            size="large"
                            aria-label="menu"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleOpenNavMenu}
                            color="inherit"
                        >
                            <MenuIcon />
                        </IconButton>
                        <Menu
                            id="menu-appbar"
                            anchorEl={anchorElNav}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                            keepMounted
                            transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            open={Boolean(anchorElNav)}
                            onClose={handleCloseNavMenu}
                            sx={{ display: { xs: 'block', md: 'none' } }}
                        >
                            {pages.map((page) => (
                                <MenuItem key={page} onClick={handleCloseNavMenu} component={Link} to="/">
                                    <Typography textAlign="center">{page}</Typography>
                                </MenuItem>
                            ))}
                            {isLoggedIn && (
                                <MenuItem onClick={handleOpenAdminMenu}>
                                    <Typography textAlign="center">Admin</Typography>
                                </MenuItem>
                            )}
                        </Menu>
                    </Box>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        {pages.map((page) => (
                            <Button
                                key={page}
                                onClick={handleCloseNavMenu}
                                component={Link}
                                to="/"
                                sx={{ my: 2, color: 'white', display: 'block' }}
                            >
                                {page}
                            </Button>
                        ))}
                        {isLoggedIn && (
                            <Box>
                                <Button
                                    onClick={handleOpenAdminMenu}
                                    endIcon={<ArrowDropDownIcon />}
                                    sx={{ my: 2, color: 'white', display: 'block' }}
                                >
                                    Admin
                                </Button>
                                <Menu
                                    anchorEl={anchorElAdmin}
                                    open={Boolean(anchorElAdmin)}
                                    onClose={handleCloseAdminMenu}
                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                    transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                >
                                    {[
                                        'View past hour',
                                        'Predict✨',
                                        'Delete Data',
                                        'Delete Account',
                                        'Reset Password',
                                        'Logout',
                                    ].map((action) => (
                                        <MenuItem key={action} onClick={() => handleAdminAction(action)}>
                                            {action}
                                        </MenuItem>
                                    ))}
                                </Menu>
                            </Box>
                        )}
                    </Box>

                    <Box sx={{ flexGrow: 0 }}>
                        <Button color="inherit" component={Link} to="/login" sx={{ ml: 2 }}>
                            Login
                        </Button>
                    </Box>

                    <Box
                        component="img"
                        src={KIlogo}
                        alt="KI Logo"
                        sx={{
                            height: 40,
                            width: 40,
                            mr: 2,
                            display: { xs: 'none', md: 'flex' },
                            borderRadius: '4px',
                        }}
                    />
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Navbar;
