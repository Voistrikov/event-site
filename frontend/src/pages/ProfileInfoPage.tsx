import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { upgradeToOrganizer } from '../api/usersApi';
import '../styles/ProfileInfoPage.css';

export default function ProfileInfoPage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    taxId: user?.taxId || '',
    address: user?.address || '',
    city: user?.city || '',
    country: user?.country || '',
    zipCode: '17456', // Placeholder if not in user model yet
    phone: user?.phone || '',
    email: user?.email || '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpgrade = async () => {
    if (window.confirm('Είστε σίγουροι ότι θέλετε να γίνετε Οικοδεσπότης;')) {
      try {
        await upgradeToOrganizer();
        alert('Συγχαρητήρια! Είστε πλέον Οικοδεσπότης.');
        window.location.reload();
      } catch (err) {
        alert('Αποτυχία αναβάθμισης. Προσπαθήστε ξανά.');
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
  };

  const handleSave = () => {
    // In a real app, we'd call an API here
    console.log('Saving profile data:', formData);
    setIsEditing(false);
    alert('Το προφίλ ενημερώθηκε επιτυχώς (προσομοίωση)');
  };

  return (
    <div className="profile-info-container">
      <div className="profile-info-header">
        <h1 className="profile-info-title">το Προφίλ μου</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user?.role === 'ATTENDEE' && (
            <button className="search-cta-btn" onClick={handleUpgrade} style={{ padding: '8px 16px', fontSize: '14px' }}>
              <span>🏠</span> Γίνε Οικοδεσπότης
            </button>
          )}
          {!isEditing ? (
            <button className="edit-btn" onClick={handleEditClick}>
              <span>✏️</span> Επεξεργασία
            </button>
        ) : (
          <div className="save-actions">
            <button className="btn-cancel" onClick={() => setIsEditing(false)}>Ακύρωση</button>
            <button className="btn-save" onClick={handleSave}>Αποθήκευση</button>
          </div>
        )}
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Left: Photo Section */}
        <div className="photo-section">
          <div className="section-label">Φωτογραφία</div>
          <div className="profile-image-container">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">👤</div>
            )}
          </div>
          <div className="upload-overlay">
            <label className="upload-label">
              <span>📷 Αλλαγή φωτογραφίας</span>
              <input type="file" style={{ display: 'none' }} accept="image/*" />
            </label>
          </div>
        </div>

        {/* Right: Info Sections */}
        <div className="details-section">
          
          {/* Προσωπικά Στοιχεία */}
          <div className="details-card">
            <div className="card-header">Προσωπικά Στοιχεία</div>
            <div className="card-body">
              <div className="info-row">
                <div className="info-label">Όνομα</div>
                <div className="info-value">
                  {isEditing ? (
                    <input name="firstName" value={formData.firstName} onChange={handleInputChange} className="info-input" />
                  ) : (
                    formData.firstName
                  )}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Επώνυμο</div>
                <div className="info-value">
                  {isEditing ? (
                    <input name="lastName" value={formData.lastName} onChange={handleInputChange} className="info-input" />
                  ) : (
                    formData.lastName
                  )}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">ΑΦΜ</div>
                <div className="info-value">
                  {isEditing ? (
                    <input name="taxId" value={formData.taxId} onChange={handleInputChange} className="info-input" />
                  ) : (
                    formData.taxId
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Διεύθυνση Κατοικίας */}
          <div className="details-card">
            <div className="card-header">Διεύθυνση Κατοικίας</div>
            <div className="card-body">
              <div className="info-row">
                <div className="info-label">Οδός & Αριθμός</div>
                <div className="info-value">
                  {isEditing ? (
                    <input name="address" value={formData.address} onChange={handleInputChange} className="info-input" />
                  ) : (
                    formData.address
                  )}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Πόλη / Περιοχή</div>
                <div className="info-value">
                  {isEditing ? (
                    <input name="city" value={formData.city} onChange={handleInputChange} className="info-input" />
                  ) : (
                    formData.city
                  )}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Τ.Κ.</div>
                <div className="info-value">
                  {isEditing ? (
                    <input name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="info-input" />
                  ) : (
                    formData.zipCode
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Στοιχεία Επικοινωνίας */}
          <div className="details-card">
            <div className="card-header">Στοιχεία Επικοινωνίας</div>
            <div className="card-body">
              <div className="info-row">
                <div className="info-label">Τηλέφωνο</div>
                <div className="info-value">
                  {isEditing ? (
                    <input name="phone" value={formData.phone} onChange={handleInputChange} className="info-input" />
                  ) : (
                    formData.phone
                  )}
                </div>
              </div>
              <div className="info-row">
                <div className="info-label">Email</div>
                <div className="info-value">
                  {isEditing ? (
                    <input name="email" value={formData.email} onChange={handleInputChange} className="info-input" />
                  ) : (
                    formData.email
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
