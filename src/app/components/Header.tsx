import Image from "next/image";
import { Menu, Pencil } from "lucide-react";
import "../styles/header.css";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function Header({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
}) {

  const user = useSelector((state: RootState) => state.user)

  return (
    <div className="p-3">
      <div className="header-blue p-4">
        {/* Left: Profile Info */}
        <div className="d-flex align-items-center">
          <Menu color="#fff" size={27} style={{ cursor: "pointer" }} onClick={() => setIsOpen(!isOpen)} />&nbsp;&nbsp;
          <div className="profile-img-wrapper me-3">
            <Image
              src="/assets/user.png" // replace with your profile image path
              alt="Profile"
              width={64}
              height={64}
              className="rounded-circle profile-img"
            />
          </div>
          <div>
            <h6 className="mb-1 fw-normal text-white d-flex align-items-center">
              {user?.first_name}{" "}{user?.last_name}
            </h6>
            <p className="mb-0 text-white-50 small">{user.role === 'admin' ? 'Admin' : 'Employee'}</p>
          </div>
        </div>

      </div>
    </div>
  );
}
