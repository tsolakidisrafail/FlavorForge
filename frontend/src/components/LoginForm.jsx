import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext.js';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Logging in:', { email });

    try {
        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }

        console.log('Login successful:', data);

        login(data); 

        navigate('/');

    } catch (error) {
        console.error('Login failed:', error);
        setError(error.message || 'Η σύνδεση απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <h2>Σύνδεση Χρήστη</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label htmlFor="login-email">Email:</label>
          <input type="email" id="login-email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="login-password">Κωδικός:</label>
          <input type="password" id="login-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <button type="submit" disabled={loading}>
            {loading ? 'Γίνεται σύνδεση...' : 'Σύνδεση'}
        </button>
    </form>
  );
}
export default LoginForm;