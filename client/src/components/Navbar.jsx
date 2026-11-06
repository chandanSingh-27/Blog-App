import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          ✍️ BlogSpace
        </Link>

        {/* Hamburger button for mobile */}
        <button
          className="navbar-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          ☰
        </button>

        <ul className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <li>
            <NavLink to="/posts" onClick={() => setMenuOpen(false)}>
              Posts
            </NavLink>
          </li>
          {user ? (
            <>
              <li>
                <NavLink to="/my-posts" onClick={() => setMenuOpen(false)}>
                  My Posts
                </NavLink>
              </li>
              <li>
                <NavLink to="/create" onClick={() => setMenuOpen(false)}>
                  + New Post
                </NavLink>
              </li>
              <li>
                <span className="navbar-user">Hi, {user.name.split(' ')[0]}</span>
              </li>
              <li>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              <li>
                <NavLink to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </NavLink>
              </li>
              <li>
                <NavLink to="/register" onClick={() => setMenuOpen(false)}>
                  <span className="btn btn-primary btn-sm">Register</span>
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
