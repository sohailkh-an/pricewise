import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "../../ui/navigation-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../../ui/avatar";
import { Button } from "../../ui/button";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import {
  User,
  LogOut,
  Search,
  LogIn,
  UserPlus,
  Plus,
  Heart,
  Laptop,
  Smartphone,
  Watch,
  Headphones,
  Tv,
  Refrigerator,
  Microwave,
  WashingMachine,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const getInitials = (fullName) => {
    if (fullName) {
      const nameParts = fullName.trim().split(" ");
      if (nameParts.length >= 2) {
        return `${nameParts[0].charAt(0)}${nameParts[
          nameParts.length - 1
        ].charAt(0)}`.toUpperCase();
      }
      return fullName.charAt(0).toUpperCase();
    }
    return "U";
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (debouncedSearchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(debouncedSearchQuery.trim())}`);
    }
  };

  const categories = [
    {
      name: "Tech",
      items: [
        { name: "Laptops", icon: Laptop, link: "/search?category=laptops" },
        {
          name: "Smartphones",
          icon: Smartphone,
          link: "/search?category=smartphones",
        },
        {
          name: "Smartwatches",
          icon: Watch,
          link: "/search?category=smartwatches",
        },
        {
          name: "Headphones",
          icon: Headphones,
          link: "/search?category=headphones",
        },
      ],
    },
    {
      name: "Home Appliances",
      items: [
        { name: "TVs", icon: Tv, link: "/search?category=tvs" },
        {
          name: "Fridge",
          icon: Refrigerator,
          link: "/search?subCategory=fridge",
        },
        {
          name: "Microwave Ovens",
          icon: Microwave,
          link: "/search?category=microwave",
        },
        {
          name: "Washing Machine",
          icon: WashingMachine,
          link: "/search?category=washing-machine",
        },
      ],
    },
    {
      name: "Cosmetics",
      items: [
        {
          name: "Foundation",
          icon: Sparkles,
          link: "/search?category=foundation",
        },
        { name: "Eyeliner", icon: Sparkles, link: "/search?category=eyeliner" },
        {
          name: "Lipsticks",
          icon: Sparkles,
          link: "/search?category=lipsticks",
        },
        { name: "Shampoo", icon: Sparkles, link: "/search?category=shampoo" },
      ],
    },
  ];

  return (
    <nav className="flex items-center justify-start px-6 py-4 bg-[#041d09] border-b">
      <Link to="/">
        <img src="/logo1.jpg" alt="Logo" className="h-15" />
      </Link>

      <div className="flex items-center gap-20 justify-between px-20">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="px-4 py-2 text-sm cursor-pointer font-medium text-white hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                <Link to="/">Home</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuTrigger className="px-4 py-2 text-sm font-medium text-white hover:bg-accent hover:text-accent-foreground rounded-md transition-colors bg-transparent cursor-pointer">
                Products
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="grid gap-3 p-6 w-[600px] grid-cols-3">
                  {categories.map((category) => (
                    <div key={category.name} className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-900 mb-3">
                        {category.name}
                      </h4>
                      <ul className="space-y-2">
                        {category.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <li key={item.name}>
                              <Link
                                to={item.link}
                                className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600 hover:bg-gray-50 p-2 rounded-md transition-colors"
                              >
                                <Icon className="h-4 w-4" />
                                {item.name}
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            <NavigationMenuItem>
              <NavigationMenuLink
                asChild
                className="px-4 py-2 text-sm cursor-pointer font-medium text-white hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              >
                <Link to="/about">About</Link>
              </NavigationMenuLink>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-84 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </form>
      </div>

      <div className="flex items-center flex-1 justify-end gap-4">
        {user && (
          <Button
            variant="ghost"
            asChild
            className="text-white hover:text-green-300"
          >
            <Link to="/wishlist" className="flex items-center">
              <Heart className="h-6 w-6 text-[#ffffff] fill-[#ffffff]" />
            </Link>
          </Button>
        )}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer hover:ring-2 hover:ring-ring hover:ring-offset-2 transition-all">
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>{getInitials(user.fullName)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <div className="px-2 py-1.5 text-sm font-medium">
                {user.fullName}
              </div>
              <div className="px-2 py-1 text-xs text-muted-foreground">
                {user.email}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              {user.email === "sohail@studio2001.com" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/admin/add-product" className="flex items-center">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link to="/login" className="text-white hover:text-green-300">
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                to="/register"
                className="text-white border-white hover:bg-white hover:text-green-600"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Sign Up
              </Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;
