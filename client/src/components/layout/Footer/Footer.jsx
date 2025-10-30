import React from "react";
import { Facebook, Twitter, Mail, MapPin, Phone, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const companyLinks = [
    { title: "About Us", link: "/about" },
    {
      title: "Privacy Policy",
      link: "/privacy-policy",
    },
    {
      title: "Terms of Service",
      link: "/terms-of-service",
    },
    {
      title: "Cookie Policy",
      link: "/cookie-policy",
    },
  ];

  return (
    <footer className="bg-[#041d09] text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-25">
          <div className="space-y-4">
            <div className="flex items-center space-x-3 mb-10">
              <img
                src="/logo1.png"
                alt="PriceWise Logo"
                className="w-70 object-cover"
              />
            </div>

            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/share/1CH3TN6Sr7/?mibextid=wwXIfr"
                className="w-10 h-10 bg-gray-700 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a
                href="https://x.com"
                className="w-10 h-10 bg-gray-700 hover:bg-blue-400 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a
                href="https://www.linkedin.com/in/imran-khan-722537252?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app"
                className="w-10 h-10 bg-gray-700 hover:bg-pink-600 rounded-full flex items-center justify-center transition-colors duration-200"
                aria-label="Linkedin"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Quick Links</h4>
            <ul className="space-y-2">
              {["Tech", "Cosmetics", "Home Appliances"].map((category) => (
                <li key={category}>
                  <a
                    href={`/search?category=${category}`}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {category}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Company</h4>
            <ul className="space-y-2">
              {companyLinks.map((item, index) => (
                <li key={index}>
                  <Link
                    key={index}
                    to={item.link}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">
              Connect with us
            </h4>

            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail size={16} className="text-gray-400" />
                <span className="text-gray-300 text-sm">
                  kamranullah@gmail.com
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-300 text-sm">+923220577117</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-300 text-sm">
                  Street 6, house No 235, I-9/2, Islamabad
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0">
            <div className="text-gray-300 text-sm">
              © 2025 PriceWise. All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
