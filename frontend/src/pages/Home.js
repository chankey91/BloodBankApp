import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaHandHoldingHeart, FaHospital, FaChartLine, FaMapMarkedAlt, FaBell } from 'react-icons/fa';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1 className="hero-title">Save Lives Together</h1>
          <p className="hero-subtitle">
            Connect with donors, find blood banks, and make a difference in real-time
          </p>
          <div className="hero-buttons">
            <Link to="/register">
              <button className="btn btn-primary" style={{ fontSize: '1.125rem', padding: '1rem 2rem' }}>
                Become a Donor
              </button>
            </Link>
            <Link to="/search">
              <button className="btn btn-outline" style={{ fontSize: '1.125rem', padding: '1rem 2rem', background: 'white' }}>
                Search Blood
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">10,000+</div>
              <div className="stat-label">Registered Donors</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">500+</div>
              <div className="stat-label">Blood Banks</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50,000+</div>
              <div className="stat-label">Lives Saved</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '3rem' }}>
            Comprehensive Blood Bank Network
          </h2>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaSearch />
              </div>
              <h3 className="feature-title">Search Blood Availability</h3>
              <p className="feature-description">
                Find available blood by type, location, and component in real-time
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaHandHoldingHeart />
              </div>
              <h3 className="feature-title">Donor Management</h3>
              <p className="feature-description">
                Track eligibility, donations, and earn rewards for saving lives
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaBell />
              </div>
              <h3 className="feature-title">Emergency Alerts</h3>
              <p className="feature-description">
                Get notified instantly for urgent blood requests near you
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaMapMarkedAlt />
              </div>
              <h3 className="feature-title">Location-Based</h3>
              <p className="feature-description">
                Find nearest blood banks and donation camps with maps
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaHospital />
              </div>
              <h3 className="feature-title">Blood Bank Network</h3>
              <p className="feature-description">
                Seamless coordination between multiple blood banks
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3 className="feature-title">Analytics Dashboard</h3>
              <p className="feature-description">
                Track trends, predict demand, and optimize inventory
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ padding: '4rem 0', background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: 'white', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Ready to Make a Difference?</h2>
          <p style={{ fontSize: '1.125rem', marginBottom: '2rem' }}>
            Join thousands of donors and help save lives in your community
          </p>
          <Link to="/register">
            <button className="btn" style={{ background: 'white', color: '#dc2626', fontSize: '1.125rem', padding: '1rem 2rem' }}>
              Register Now
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

