import {
  CreditCardIcon,
  FolderIcon,
  HomeIcon,
  ListBulletIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";

export const navbarRoutes = [
  {
    href: "/subscriptions",
    text: "Suscribete",
    auth: false,
  },
  {
    href: "/products",
    text: "Products",
    auth: false,
  },
  {
    href: "/auth/login",
    text: "Login",
    auth: false,
  },
  {
    href: "/auth/register",
    text: "Register",
    auth: false,
  },
];

export const dashboardRoutes = [
  {
    href: "/dashboard",
    text: "Dashboard",
    icon: HomeIcon,
    roles: ["admin", "user"],
  },
  {
    href: "/dashboard/profile",
    text: "Perfil",
    roles: ["admin", "user"],
    icon: UserCircleIcon,
  },
  {
    href: "/dashboard/products",
    text: "Productos",
    roles: ["admin", "user"],
    icon: ShoppingBagIcon,
  },
  {
    href: "/dashboard/subscriptions",
    text: "Planes",
    roles: ["admin"],
    icon: CreditCardIcon,
  },
  {
    href: "/dashboard/categories",
    text: "Categorias",
    roles: ["admin"],
    icon: ListBulletIcon,
  },
  {
    href: "/dashboard/categories/new",
    text: "Crea Categoria",
    roles: ["admin"],
    icon: FolderIcon,
  },
  {
    href: "/dashboard/users",
    text: "Usuarios",
    icon: UsersIcon,
    roles: ["admin"],
  },
];
