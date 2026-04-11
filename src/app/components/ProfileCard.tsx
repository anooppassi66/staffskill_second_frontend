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
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchProfile = async () => {
      const uRedux: any = user || {}
      if (!uRedux.token) {
        // Fallback or early return if no token
        const p: UserProfile = {
          firstName: uRedux.first_name || uRedux.name || '',
          lastName: uRedux.last_name || '',
          registrationDate: uRedux.created_at ? new Date(uRedux.created_at).toLocaleString() : '',
          userName: uRedux.user_name || uRedux.username || '',
          phoneNumber: uRedux.phone_number || uRedux.phone || '',
          email: uRedux.email || '',
          gender: uRedux.gender || '',
          dob: uRedux.dob || '',
          age: typeof uRedux.age === 'number' ? uRedux.age : 0,
          bio: uRedux.bio || '',
        }
        setProfile(p)
        return;
      }

      setLoading(true)
      setError('')
      try {
        const res = await fetch(ENDPOINTS.AUTH.PROFILE, {
          headers: {
            Authorization: `Bearer ${uRedux.token}`,
          },
        })
        if (!res.ok) {
          throw new Error('Failed to fetch profile')
        }
        const data = await res.json()
        const u = data.user || data

        const p: UserProfile = {
          firstName: u.first_name || u.name || uRedux.first_name || '',
          lastName: u.last_name || uRedux.last_name || '',
          registrationDate: u.created_at || u.createdAt 
            ? new Date(u.created_at || u.createdAt).toLocaleString() 
            : uRedux.created_at 
              ? new Date(uRedux.created_at).toLocaleString() : '',
          userName: u.user_name || u.username || uRedux.user_name || '',
          phoneNumber: u.phone_number || u.phone || uRedux.phone_number || '',
          email: u.email || uRedux.email || '',
          gender: u.gender || uRedux.gender || '',
          dob: u.dob || uRedux.dob || '',
          age: typeof u.age === 'number' ? u.age : typeof uRedux.age === 'number' ? uRedux.age : 0,
          bio: u.bio || uRedux.bio || '',
        }
        setProfile(p)
      } catch (err: any) {
        setError(err.message || 'Error loading profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
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
