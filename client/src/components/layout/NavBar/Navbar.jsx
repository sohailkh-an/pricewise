import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
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
import { User, LogOut, Search, LogIn, UserPlus, Plus } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
  return (
    <nav className="flex items-center justify-start px-6 py-4 bg-[#041d09] border-b">
      <Link to="/">
        <img src="/logo1.jpg" alt="Logo" className="h-15" />
      </Link>

      <div className="flex items-center gap-20 justify-between px-20">
        <NavigationMenu>
          <NavigationMenuList>
            <Link to="/">
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4 py-2 text-sm cursor-pointer font-medium text-white hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Link>
            <Link to="/products">
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4 py-2 text-sm cursor-pointer font-medium text-white hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                  Products
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Link>
            <Link to="/about">
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4 py-2 text-sm cursor-pointer font-medium text-white hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                  About
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Link>
            <Link to="/contact">
              <NavigationMenuItem>
                <NavigationMenuLink className="px-4 py-2 text-sm cursor-pointer font-medium text-white hover:bg-accent hover:text-accent-foreground rounded-md transition-colors">
                  Contact
                </NavigationMenuLink>
              </NavigationMenuItem>
            </Link>
          </NavigationMenuList>
        </NavigationMenu>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            className="pl-10 pr-4 py-2 w-84 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </div>
      </div>

      <div className="flex items-center flex-1 justify-end gap-4">
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
