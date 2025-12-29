"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Clock, Award } from "lucide-react"
import type { Course, Enrollment } from "@/lib/data/mock-data"
import Link from "next/link"
import Image from "next/image"

interface CourseCardProps {
  course: Course
  enrollment?: Enrollment
  showProgress?: boolean
}

export function CourseCard({ course, enrollment, showProgress = true }: CourseCardProps) {
  const progress = enrollment?.progress || 0

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-40 w-full bg-gradient-to-br from-primary to-secondary">
        <Image
          src={course.image || "/placeholder.svg?height=160&width=400"}
          alt={course.title}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
          <Badge>{course.level}</Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-lg line-clamp-1">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{course.chapters.length} chapters</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{course.duration} min</span>
          </div>
        </div>

        {showProgress && enrollment && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <Link href={`/employee/courses/${course.id}`}>
          <Button className="w-full">
            {enrollment?.isCompleted ? (
              <>
                <Award className="h-4 w-4 mr-2" />
                View Certificate
              </>
            ) : (
              <>Continue Learning</>
            )}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}
