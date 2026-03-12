import Link from "next/link";
import {
  LayoutDashboard,
  User,
  BookOpen,
  Award,
  Heart,
  Star,
  ClipboardList,
  ShoppingCart,
  Share2,
  MessageSquare,
  LifeBuoy,
  Settings,
  LogOut,
  CircleX,
  FileText,
  Users,
  MessageCircleQuestionMark,
  FileBadge2,
  SquarePlus,
} from "lucide-react";
import { useRouter } from 'next/router';
import "../styles/sidebar.css";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { clearUser } from "@/redux/slices/userSlice";

const mainMenu = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, active: true },
  { label: "My Profile", href: "/profile", icon: User },
  { label: "Enrolled Courses", href: "/enrolled-courses", icon: BookOpen },
  { label: "My Certificates", href: "/certificates", icon: Award },
];

const AdminMenu = [
  { label: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard, active: true },
  { label: "My Profile", href: "/profile", icon: User },
  { label: "Categories", href: "/categories", icon: ClipboardList },
  { label: "Courses", href: "/courses", icon: BookOpen },
  // { label: "Assignments", href: "/assignments", icon: FileText },
  { label: "Employees", href: "/employees", icon: Users },
  { label: "Enrollment Requests", href: "/admin/enrollments", icon: ClipboardList },
  { label: "Quiz Management", href: "/quiz", icon: MessageCircleQuestionMark },
  { label: "Employee Certificates", href: "/employee-certificates", icon: FileBadge2 },
  { label: "Add Employee", href: "/add-employee", icon: SquarePlus },
];





const accountSettings = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Logout", href: "/login", icon: LogOut },
];

export default function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (open: boolean) => void }) {
  const router = usePathname()
  const user = useSelector((state: RootState) => state.user)
  const cookieRole = typeof document !== 'undefined' ? (document.cookie.match(/(?:^|; )auth_role=([^;]+)/)?.[1] || null) : null
  const effectiveRole = user?.role ?? cookieRole ?? null
  const dispatch = useDispatch()

  let sideLinks: any[] = [];
  sideLinks = effectiveRole === 'admin' ? AdminMenu : mainMenu

  console.log('router', router)
  const handleLogout = () => {
    dispatch(clearUser())
    document.cookie = 'auth_token=; path=/; max-age=0'
    document.cookie = 'auth_role=; path=/; max-age=0'

    router.push("/login");
  }
  return (
    <div
      className={`sidebar main-border vh-100 shadow-sm ${isOpen ? "" : "toggled"}`}
      style={{ width: "260px" }} // Increased width for better look
    >

      <div className="p-3">
        <div className="d-flex justify-content-end">
          <CircleX color="black" size={27} style={{ cursor: "pointer" }} onClick={() => setIsOpen(!isOpen)} className="d-lg-none" />
        </div>
        <h6 className="fw-normal text-muted mb-3">
          Main Menu
        </h6>
        <ul className="nav flex-column mb-4">
          {sideLinks.map(({ label, href, icon: Icon, active }) => (
            <li className="nav-item" key={href}>
              <Link
                href={href}
                className={`nav-link ${router===href ? "active" : ""}`}
              >
                <Icon className="me-2" size={18} /> {label}
              </Link>
            </li>
          ))}
        </ul>
        <hr />
        {/* Account Settings */}
        <h6 className="fw-normal text-muted mb-3">Account Settings</h6>
        <ul className="nav flex-column">
          {accountSettings.map(({ label, href, icon: Icon }) => {
            const targetHref = label === 'Logout' ? '/login' : href;

            return (
              <li className="nav-item" key={href}>
                <Link
                  href={targetHref}
                  className={`nav-link ${router?.includes(href) ? "active" : ""}`}
                  onClick={label === 'Logout' ? handleLogout : undefined}
                >
                  <Icon className="me-2" size={18} /> {label}
                </Link>
              </li>
            );
          })}

        </ul>
      </div>
    </div>
  );
}
