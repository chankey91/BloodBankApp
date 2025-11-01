import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const SearchBlood = () => {
  const [searchParams, setSearchParams] = useState({
    bloodType: '',
    component: '',
    latitude: '',
    longitude: '',
    radius: 50
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const components = ['whole blood', 'plasma', 'platelets', 'red blood cells'];

  const handleChange = (e) => {
    setSearchParams({
      ...searchParams,
      [e.target.name]: e.target.value
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setSearchParams({
            ...searchParams,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          toast.success('Location detected!');
        },
        (error) => {
          toast.error('Unable to get location');
        }
      );
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (searchParams.bloodType) params.append('bloodType', searchParams.bloodType);
      if (searchParams.component) params.append('component', searchParams.component);
      if (searchParams.latitude) params.append('latitude', searchParams.latitude);
      if (searchParams.longitude) params.append('longitude', searchParams.longitude);
      if (searchParams.radius) params.append('radius', searchParams.radius);

      const res = await axios.get(`/api/inventory/search?${params.toString()}`);
      setResults(res.data.data);
      
      if (res.data.data.length === 0) {
        toast.info('No results found. Try adjusting your search criteria.');
      }
    } catch (error) {
      toast.error('Error searching blood availability');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1 className="page-title">Search Blood Availability</h1>
          <p className="page-subtitle">Find blood banks with available inventory</p>
        </div>
      </div>

      <div className="container" style={{ padding: '2rem 0' }}>
        <div className="card">
          <form onSubmit={handleSearch}>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Blood Type</label>
                <select
                  name="bloodType"
                  className="form-select"
                  value={searchParams.bloodType}
                  onChange={handleChange}
                >
                  <option value="">All Types</option>
                  {bloodTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Component</label>
                <select
                  name="component"
                  className="form-select"
                  value={searchParams.component}
                  onChange={handleChange}
                >
                  <option value="">All Components</option>
                  {components.map(comp => (
                    <option key={comp} value={comp}>{comp}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Latitude</label>
                <input
                  type="number"
                  step="any"
                  name="latitude"
                  className="form-input"
                  value={searchParams.latitude}
                  onChange={handleChange}
                  placeholder="Enter latitude"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Longitude</label>
                <input
                  type="number"
                  step="any"
                  name="longitude"
                  className="form-input"
                  value={searchParams.longitude}
                  onChange={handleChange}
                  placeholder="Enter longitude"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Radius (km)</label>
                <input
                  type="number"
                  name="radius"
                  className="form-input"
                  value={searchParams.radius}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="button" onClick={getCurrentLocation} className="btn btn-outline">
                📍 Use My Location
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </form>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="card">
            <h2 className="card-header">Search Results ({results.length})</h2>
            <div className="grid grid-2">
              {results.map((inventory) => (
                <div key={inventory._id} className="card" style={{ background: 'var(--background)' }}>
                  <h3 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>
                    {inventory.bloodBank?.name}
                  </h3>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span className="badge badge-info">{inventory.bloodType}</span>
                    <span className="badge badge-success" style={{ marginLeft: '0.5rem' }}>
                      {inventory.component}
                    </span>
                  </div>
                  <p><strong>Available Units:</strong> {inventory.units}</p>
                  <p><strong>Location:</strong> {inventory.bloodBank?.location?.city}</p>
                  <p><strong>Contact:</strong> {inventory.bloodBank?.contact?.phone}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBlood;

