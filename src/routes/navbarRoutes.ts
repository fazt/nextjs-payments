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
    href: "/products",
    text: "Productos",
    auth: false,
  },
  {
    href: "/subscriptions",
    text: "Suscripciones",
    auth: false,
  },
  {
    href: "/auth/register",
    text: "Crear cuenta",
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
    text: "Categorías",
    roles: ["admin"],
    icon: ListBulletIcon,
  },
  {
    href: "/dashboard/categories/new",
    text: "Nueva categoría",
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
