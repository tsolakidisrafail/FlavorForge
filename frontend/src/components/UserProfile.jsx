import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/AuthContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LinearProgress from '@mui/material/LinearProgress';
import Divider from '@mui/material/Divider';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import RateReviewIcon from '@mui/icons-material/RateReview';
import StarIcon from '@mui/icons-material/Star';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import Chip from '@mui/material/Chip';


function UserProfile() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProfile = async () => {
        if (!user || !user.token) {
            setError('Απαιτείται σύνδεση για την προβολή του προφίλ.');
            setLoading(false);
            return;
          }
          setLoading(true);
          setError(null);
          try {
            const response = await fetch('/api/users/profile', {
                headers: {
                    'Authorization': `Bearer ${user.token}` 
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setProfileData(data);
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setError(err.message || 'Αποτυχία φόρτωσης προφίλ.');
        } finally {
            setLoading(false);
        }
    };
    fetchProfile();
}, [user]);

const getBadgeIcon = (badgeName) => {
    if (badgeName.includes('First Recipe')) return <MenuBookIcon color="primary" />;
    if (badgeName.includes('First Review')) return <RateReviewIcon color="secondary" />;
    if (badgeName.includes('Popular Plate')) return <StarIcon sx={{ color: 'gold'}} />;
    if (badgeName.includes('Master Chef')) return <MilitaryTechIcon color="error" />;
    if (badgeName.includes('Level')) return <MilitaryTechIcon color="success" />;
    return <EmojiEventsIcon />;
};

const calculateProgress = () => {
    if (!profileData || !profileData.progress || profileData.progress.pointsForNextLevel === Infinity) {
        return 100;
    }
    const pointsInLevel = profileData.points - profileData.progress.currentLevelBasePoints;
    const totalPointsForLevel = profileData.progress.pointsForNextLevel - profileData.progress.currentLevelBasePoints;
    if (totalPointsForLevel <= 0) return 100;
    const percentage = (pointsInLevel / totalPointsForLevel) * 100;
    return Math.min(Math.max(percentage, 0), 100);
};

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

const progressValue = calculateProgress();
const pointsInCurrentLevel = profileData.points - profileData.progress.currentLevelBasePoints;
const pointsNeededForLevel = profileData.progress.pointsForNextLevel - profileData.progress.currentLevelBasePoints;

return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mt: 4}}>
        <Typography variant="h4" component="h1" gutterBottom>
            Προφίλ: {profileData.name}
        </Typography>
        <Typography variant="body1" gutterBottom>Email: {profileData.email}</Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" component="h2" gutterBottom>
            Στατιστικά
        </Typography>

        <Box sx={{ mb: 3 }}>
            <Typography variant="h6" component="h3">
                Επίπεδο: {profileData.level} - {profileData.levelName || 'Unknown'}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Box sx={{ width: '100%', mr: 1 }}>
                    <LinearProgress variant="determinate" value={progressValue} sx={{ height: 10, borderRadius: 5 }} />
                </Box>
                <Box sx={{ minWidth: 35 }}>
                    <Typography variant="body2" color="text.secondary">{`${Math.round(progressValue)}%`}</Typography>
                </Box>
            </Box>
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                {profileData.progress.pointsForNextLevel !== Infinity 
                ? `Πόντοι στο επίπεδο: ${pointsInCurrentLevel} / ${pointsNeededForLevel} (Σύνολο: ${profileData.points})`
                : `Μέγιστο επίπεδο! (Σύνολο πόντων: ${profileData.points})`}
            </Typography>
        </Box>

        <Box>
            <Typography variant="h6" component="h3" gutterBottom>
                Badges ({profileData.badges.length})
            </Typography>
            {profileData.badges.length > 0 ? (
                <List dense>
                    {profileData.badges.map((badge, index) => (
                        <ListItem key={index}>
                            <ListItemIcon sx={{ minWidth: '40px' }}>
                                {getBadgeIcon(badge)}
                            </ListItemIcon>
                            <ListItemText primary={badge} />
                        </ListItem>
                    ))}
                </List>
            ) : (
                <Typography variant="body2" color="text.secondary">Δεν έχεις κερδίσει badges ακόμα.</Typography>
            )}
        </Box>

        </Paper>
    );
}


export default UserProfile;