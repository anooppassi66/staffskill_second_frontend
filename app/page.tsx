import { LoginForm } from "@/components/auth/login-form"
import { GraduationCap } from "lucide-react"

export default function Home() {
  return (
    <div className="flex min-h-screen">
      {/* Left side - Hero section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#C7E6F5] to-[#E8F5F9] p-12 flex-col justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-2 rounded">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-primary">Learnq</span>
        </div>

        <div className="space-y-8">
          <div className="w-full max-w-md">
            <img
              src="/person-at-desk-with-laptop-illustration.png"
              alt="Learning illustration"
              className="w-full h-auto"
            />
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              Turn your ambition
              <br />
              into a success story
            </h1>
            <p className="text-lg text-gray-700">Choose from over 100,000 online video</p>
          </div>
        </div>

        <div className="h-16"></div>
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-2 bg-white">
        <LoginForm />
      </div>
    </div>
  )
}
