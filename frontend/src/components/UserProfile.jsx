import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      if (!user || !user.token) {
        setError('User not logged in or token missing.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/users/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user.token}` 
            }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }

        setProfileData(data);

    } catch (err) {
        console.error("Failed to fetch profile:", err);
        setError(err.message || 'Failed to load profile data.');
    } finally {
        setLoading(false);
    }
  };

  fetchProfile();
}, [user]);

if (loading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <CircularProgress />
        </Box>
    );
}

if (error) {
    return <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>;
}

if (!profileData) {
    return <Alert severity="warning" sx={{ mt: 2 }}>Δεν βρέθηκαν δεδομένα προφίλ.</Alert>;
}

return (
    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
            Το Προφίλ μου
        </Typography>
        <List>
            <ListItem>
                <ListItemText primary="Όνομα" secondary={profileData.name} />
            </ListItem>
            <Divider component="li" />
            <ListItem>
                <ListItemText primary="Email" secondary={profileData.email} />
            </ListItem>
            <Divider component="li" />
            <ListItem>
                <ListItemText primary="Πόντοι" secondary={profileData.points ?? 0} />
            </ListItem>
            <Divider component="li" />
            <ListItem sx={{ display: 'block' }}>
                <ListItemText primary="Badges" />
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {profileData.badges && profileData.badges.length > 0 ? (
                        profileData.badges.map((badge, index) => (
                            <Chip label={badge} key={index} color="secondary" variant="outlined" />
                        ))
                    ) : (
                        <Typography variant="body2" color="text.secondary">Κανένα badge ακόμα!</Typography>
                    )}
                </Box>
            </ListItem>
            <Divider component="li" />
            <ListItem>
                <ListItemText primary="Μέλος από" secondary={new Date(profileData.createdAt).toLocaleDateString()} />
            </ListItem>
        </List>
    </Paper>
);
}

export default UserProfile;