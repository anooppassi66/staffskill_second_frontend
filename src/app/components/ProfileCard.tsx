'use client'
import React, { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useSelector } from 'react-redux'
import { RootState } from '@/redux/store'
import { ENDPOINTS } from '@/Api'

interface UserProfile {
  firstName: string
  lastName: string
  registrationDate: string
  userName: string
  phoneNumber: string
  email: string
  gender: string
  dob: string
  age: number
  bio: string
}

const emptyProfile: UserProfile = {
  firstName: '',
  lastName: '',
  registrationDate: '',
  userName: '',
  phoneNumber: '',
  email: '',
  gender: '',
  dob: '',
  age: 0,
  bio: '',
}

const ProfileCard: React.FC = () => {
  const user = useSelector((s: RootState) => s.user)
  const [profile, setProfile] = useState<UserProfile>(emptyProfile)
  const [loading] = useState<boolean>(false)
  const [error] = useState<string>('')

  useEffect(() => {
    const u: any = user || {}
    const p: UserProfile = {
      firstName: u.first_name || u.name || '',
      lastName: u.last_name || '',
      registrationDate: u.created_at ? new Date(u.created_at).toLocaleString() : '',
      userName: u.user_name || u.username || '',
      phoneNumber: u.phone_number || u.phone || '',
      email: u.email || '',
      gender: u.gender || '',
      dob: u.dob || '',
      age: typeof u.age === 'number' ? u.age : 0,
      bio: u.bio || '',
    }
    setProfile(p)
  }, [user])

  const InfoPair = ({ label, value }: { label: string; value: string | number }) => (
    <div className="col-12 col-md-4 mb-3">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  );

  return (
    <div>
      {/* Outer Card Wrapper */}
        {/* Title and Edit Icon */}
        <div className="profile-title-container">
          <h1 className="profile-title">My Profile</h1>
        </div>
      <div className="profile-card main-border shadow-sm">
        {error && <div className="alert alert-danger" role="alert">{error}</div>}
        {loading && <div className="text-muted mb-2">Loading...</div>}

        {/* Basic Information Section */}
        <h2 className="h4 mb-4 mt-3">Basic Information</h2>
        
        <div className="row basic-info-grid">
          {/* Row 1 */}
          <InfoPair label="First Name" value={profile.firstName || '-'} />
          <InfoPair label="Last Name" value={profile.lastName || '-'} />
          <InfoPair label="Registration Date" value={profile.registrationDate || '-'} />

          {/* Row 2 */}
          <InfoPair label="User Name" value={profile.userName || '-'} />
          <InfoPair label="Phone Number" value={profile.phoneNumber || '-'} />
          <InfoPair label="Email" value={profile.email || '-'} />

          {/* Row 3 */}
          <InfoPair label="Gender" value={profile.gender || '-'} />
          <InfoPair label="DOB" value={profile.dob || '-'} />
          <InfoPair label="Age" value={profile.age || '-'} />
        </div>

        {/* Bio Section */}
        <div className="bio-section">
          <span className="info-label">Bio</span>
          <p className="info-value mt-1">{profile.bio || '-'}</p>
        </div>

      </div>
    </div>
  );
};

export default ProfileCard;
