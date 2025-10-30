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
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../../ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "../../ui/sheet";
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
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

const NavBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState(null);

  useEffect(() => {
    setSearchQuery("");
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
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
    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setMobileMenuOpen(false);
    setShowMobileSearch(false);
  };

  const handleCategoryClick = (link) => {
    navigate(link);
    setMobileMenuOpen(false);
  };

  const categories = [
    {
      name: "Tech",
      items: [
        {
          name: "Laptops",
          icon: Laptop,
          link: "/search?category=Tech&subCategory=Laptops",
        },
        {
          name: "Smartphones",
          icon: Smartphone,
          link: "/search?category=Tech&subCategory=Smartphones",
        },
        {
          name: "Smartwatches",
          icon: Watch,
          link: "/search?category=Tech&subCategory=Smart Watches",
        },
        {
          name: "Headphones",
          icon: Headphones,
          link: "/search?category=Tech&subCategory=Headphones",
        },
      ],
    },
    {
      name: "Home Appliances",
      items: [
        {
          name: "TVs",
          icon: Tv,
          link: "/search?category=Home Appliances&subCategory=TV's",
        },
        {
          name: "Fridge",
          icon: Refrigerator,
          link: "/search?category=Home Appliances&subCategory=Fridge",
        },
        {
          name: "Microwave Ovens",
          icon: Microwave,
          link: "/search?category=Home Appliances&subCategory=Oven",
        },
        {
          name: "Washing Machine",
          icon: WashingMachine,
          link: "/search?category=Home Appliances&subCategory=Washing Machine",
        },
      ],
    },
    {
      name: "Cosmetics",
      items: [
        {
          name: "Skincare",
          icon: Sparkles,
          link: "/search?category=Cosmetics&subCategory=Skincare",
        },
        {
          name: "Hair Care",
          icon: Sparkles,
          link: "/search?category=Cosmetics&subCategory=Hair Care",
        },
        {
          name: "Fragrances",
          icon: Sparkles,
          link: "/search?category=Cosmetics&subCategory=Fragrances",
        },
        {
          name: "Shampoo",
          icon: Sparkles,
          link: "/search?subCategory=shampoo",
        },
      ],
    },
  ];

  return (
    <nav className="flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-[#041d09] border-b">
      <Link to="/" className="bg-transparent shrink-0">
        <img src="/logo1.png" alt="Logo" className="h-12 md:h-15" />
      </Link>

      <div className="hidden lg:flex items-center gap-8 xl:gap-20 flex-1 px-8 xl:px-20">
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

        <form onSubmit={handleSearch} className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
          />
        </form>
      </div>

      <div className="hidden lg:flex items-center gap-4">
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
              {/* <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem> */}
              {user.email === "sohail@studio2001.com" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link
                      to="/admin/add-product"
                      className="cursor-pointer flex items-center"
                    >
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

      <div className="flex lg:hidden items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
          className="text-white hover:text-green-300"
        >
          {showMobileSearch ? (
            <X className="h-5 w-5" />
          ) : (
            <Search className="h-5 w-5" />
          )}
        </Button>

        {user && (
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-white hover:text-green-300"
          >
            <Link to="/wishlist">
              <Heart className="h-5 w-5 text-[#ffffff] fill-[#ffffff]" />
            </Link>
          </Button>
        )}

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-green-300"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[300px] sm:w-[400px] overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {user && (
                <div className="pb-4 border-b">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar>
                      <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                      <AvatarFallback>
                        {getInitials(user.fullName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{user.fullName}</div>
                      <div className="text-xs text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                >
                  Home
                </Link>
                <Link
                  to="/about"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                >
                  About
                </Link>
              </div>

              <div className="space-y-2">
                <h3 className="px-4 text-sm font-semibold text-muted-foreground">
                  Categories
                </h3>
                {categories.map((category) => (
                  <div key={category.name} className="space-y-1">
                    <button
                      onClick={() =>
                        setExpandedCategory(
                          expandedCategory === category.name
                            ? null
                            : category.name
                        )
                      }
                      className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium hover:bg-accent rounded-md transition-colors"
                    >
                      <span>{category.name}</span>
                      <ChevronRight
                        className={`h-4 w-4 transition-transform ${
                          expandedCategory === category.name ? "rotate-90" : ""
                        }`}
                      />
                    </button>
                    {expandedCategory === category.name && (
                      <div className="pl-4 space-y-1">
                        {category.items.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.name}
                              onClick={() => handleCategoryClick(item.link)}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors"
                            >
                              <Icon className="h-4 w-4" />
                              {item.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {user ? (
                <div className="space-y-2 pt-4 border-t">
                  {/* <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link> */}
                  {user.email === "sohail@studio2001.com" && (
                    <Link
                      to="/admin/add-product"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex cursor-pointer items-center gap-2 px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      Add Product
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2 pt-4 border-t">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-accent rounded-md transition-colors"
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {showMobileSearch && (
        <div className="absolute top-full left-0 right-0 bg-[#041d09] border-b p-4 lg:hidden z-50">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              autoFocus
            />
          </form>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
