"use client";
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ProfileCard from '../components/ProfileCard';

const ProfilePage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="container mt-4" style={{ maxWidth: 920 }}>
        <ProfileCard />
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
