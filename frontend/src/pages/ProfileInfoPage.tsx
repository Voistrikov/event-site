import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { upgradeToOrganizer, uploadAvatar } from '../api/usersApi';
import { fileUrl } from '../utils/imageUrl';
import Button from '../components/common/Button';
import '../styles/ProfileInfoPage.css';

export default function ProfileInfoPage() {
  const { user, fetchMe } = useAuth();
  const [avatarUploading, setAvatarUploading] = useState(false);
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
    if (window.confirm('Είστε σίγουροι ότι θέλετε να γίνετε Διοργανωτής;')) {
      try {
        await upgradeToOrganizer();
        alert('Συγχαρητήρια! Είστε πλέον Διοργανωτής.');
        window.location.reload();
      } catch {
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

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type) || file.size > 5 * 1024 * 1024) {
      alert('Επιλέξτε εικόνα JPEG, PNG, WebP ή GIF έως 5 MB.');
      return;
    }
    try {
      setAvatarUploading(true);
      await uploadAvatar(file);
      await fetchMe();
    } catch {
      alert('Η μεταφόρτωση της φωτογραφίας απέτυχε. Προσπαθήστε ξανά.');
    } finally { setAvatarUploading(false); }
  };

  return (
    <div className="profile-info-container">
      <div className="profile-info-header">
        <h1 className="profile-info-title">Το προφίλ μου</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user?.role === 'ATTENDEE' && (
            <button className="search-cta-btn" onClick={handleUpgrade} style={{ padding: '8px 16px', fontSize: '14px' }}>
              <span>🎟️</span> Γίνε Διοργανωτής
            </button>
          )}
          {!isEditing ? (
            <Button onClick={handleEditClick}>
              <span>✏️</span> Επεξεργασία
            </Button>
          ) : (
          <div className="save-actions">
            <Button variant="cancel" onClick={() => setIsEditing(false)}>Ακύρωση</Button>
            <Button variant="save" onClick={handleSave}>Αποθήκευση</Button>
          </div>
        )}
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Left: Photo Section */}
        <div className="photo-section">
          <div className="section-label">Φωτογραφία</div>
          <div className="profile-image-container">
            {fileUrl(user?.avatarUrl) ? (
              <img src={fileUrl(user?.avatarUrl) ?? ''} alt="Profile" />
            ) : (
              <div className="avatar-placeholder">👤</div>
            )}
          </div>
          <div className="upload-overlay">
            <label className="upload-label">
              <span>{avatarUploading ? 'Μεταφόρτωση...' : '📷 Αλλαγή φωτογραφίας'}</span>
              <input type="file" style={{ display: 'none' }} accept="image/jpeg,image/png,image/webp,image/gif" disabled={avatarUploading} onChange={handleAvatarChange} />
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
