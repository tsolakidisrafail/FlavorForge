import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

function RegisterForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    console.log('Registering:', { name, email });

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || `HTTP error! Status: ${response.status}`);
        }

        console.log('Registration successful:', data);
        // TODO: Handle successful registration (e.g., redirect to login page)
        // navigate('/login');

    } catch (error) {
        console.error('Registration failed:', error);
        setError(error.message || 'Η εγγραφή απέτυχε. Παρακαλώ δοκιμάστε ξανά.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
        <h2>Εγγραφή Νέου Χρήστη</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div>
          <label htmlFor="name">Όνομα:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="password">Κωδικός:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength="6" />
        </div>
        <button type="submit" disabled={loading}>
            {loading ? 'Γίνεται εγγραφή...' : 'Εγγραφή'}
        </button>
    </form>
  );
}
export default RegisterForm;