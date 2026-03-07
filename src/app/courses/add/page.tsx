'use client'

import CourseFormSteps from '@/app/components/CourseFormSteps'
import DashboardLayout from '@/app/components/DashboardLayout'
import React from 'react'

const page = () => {
    return (
        <DashboardLayout>
            <CourseFormSteps />
        </DashboardLayout>
    )
}

export default page
