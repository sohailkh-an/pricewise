import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Target,
  Lightbulb,
  Users,
  Shield,
  Zap,
  TrendingUp,
  Search,
  Heart,
  Star,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  const features = [
    {
      icon: <Search className="h-8 w-8 text-[#041d09]" />,
      title: "Smart Price Comparison",
      description:
        "Compare prices across multiple online stores instantly with our intelligent search engine.",
    },
    {
      icon: <Zap className="h-8 w-8 text-[#041d09]" />,
      title: "Real-time Updates",
      description:
        "Get the latest prices and deals as they happen with our real-time monitoring system.",
    },
    {
      icon: <Heart className="h-8 w-8 text-[#041d09]" />,
      title: "Wishlist & Alerts",
      description:
        "Save your favorite products and get notified when prices drop to your desired level.",
    },
    {
      icon: <Shield className="h-8 w-8 text-[#041d09]" />,
      title: "Trusted Sources",
      description:
        "We partner with verified retailers to ensure you get accurate pricing and reliable information.",
    },
  ];

  const stats = [
    { number: "50+", label: "Products Tracked" },
    { number: "30+", label: "Partner Stores" },
    { number: "95%", label: "User Satisfaction" },
  ];

  const values = [
    {
      icon: <Target className="h-6 w-6 text-[#041d09]" />,
      title: "Transparency",
      description:
        "We believe in complete transparency in pricing and never hide fees or commissions.",
    },
    {
      icon: <Users className="h-6 w-6 text-[#041d09]" />,
      title: "User-Centric",
      description:
        "Every feature we build is designed with our users' needs and preferences in mind.",
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-[#041d09]" />,
      title: "Innovation",
      description:
        "We continuously innovate to provide cutting-edge price comparison technology.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7]">
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <img
              src="/logo1.jpg"
              alt="PriceWise Logo"
              className="h-20 mx-auto mb-6"
            />
          </div>
          <h1 className="text-5xl font-bold text-[#041d09] mb-6 leading-tight">
            About <span className="text-[#16a34a]">PriceWise</span>
          </h1>
          <p className="text-xl text-gray-700 mb-8 max-w-3xl mx-auto leading-relaxed">
            PriceWise is an intelligent price comparison platform built to help
            users find the best deals across various online stores. We aim to
            make your shopping experience smarter by saving time, money, and
            effort.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-[#041d09] hover:bg-[#041d09]/90"
            >
              <Link to="/search">
                Start Comparing Prices
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              size="lg"
              className="border-[#041d09] text-[#041d09] hover:bg-[#041d09] hover:text-white"
            >
              <Link to="/register">Join PriceWise</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 bg-white/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-[#041d09] mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            <Card
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-0 shadow-xl"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-8 w-8 text-[#041d09]" />
                  <CardTitle className="text-2xl text-[#041d09]">
                    OUR MISSION
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  Our mission is to simplify online shopping by delivering
                  real-time price comparisons, deal alerts, and smart
                  recommendations—empowering users to make confident,
                  cost-effective choices.
                </p>
              </CardContent>
            </Card>

            <Card
              size="sm"
              className="bg-white/80 backdrop-blur-sm border-0 shadow-xl"
            >
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-8 w-8 text-[#041d09]" />
                  <CardTitle className="text-2xl text-[#041d09]">
                    OUR GOAL
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed text-lg">
                  We aim to become the leading shopping companion by
                  continuously improving our features, expanding store coverage,
                  and making price tracking accessible and effortless for all
                  users.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#041d09] mb-4">
              Why Choose PriceWise?
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Discover the features that make PriceWise the smartest choice for
              price comparison
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card
                size="sm"
                key={index}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-[#c0f6cb] rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg text-[#041d09]">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#041d09] mb-4">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              The principles that guide everything we do at PriceWise
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <Card
                size="sm"
                key={index}
                className="bg-white/80 backdrop-blur-sm border-0 shadow-lg"
              >
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-[#c0f6cb] rounded-lg">
                      {value.icon}
                    </div>
                    <CardTitle className="text-xl text-[#041d09]">
                      {value.title}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#041d09] mb-4">
              How PriceWise Works
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto">
              Simple steps to start saving money on your purchases
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-[#041d09] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-[#041d09] mb-4">
                Search Products
              </h3>
              <p className="text-gray-700">
                Enter the product you're looking for and let our smart search
                find it across multiple stores.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-[#041d09] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-[#041d09] mb-4">
                Compare Prices
              </h3>
              <p className="text-gray-700">
                View real-time prices from different retailers and see the best
                deals available.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-6 w-16 h-16 bg-[#041d09] text-white rounded-full flex items-center justify-center text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-[#041d09] mb-4">
                Save Money
              </h3>
              <p className="text-gray-700">
                Choose the best deal and save money on your purchase with
                confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-[#041d09]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Saving?
          </h2>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Join thousands of smart shoppers who trust PriceWise to find the
            best deals
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="bg-white text-[#041d09] hover:bg-gray-100"
            >
              <Link to="/search">
                <Search className="mr-2 h-5 w-5" />
                Start Shopping
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              size="lg"
              className="border-white text-white hover:bg-white hover:text-[#041d09]"
            >
              <Link to="/register">
                <Star className="mr-2 h-5 w-5" />
                Create Account
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-600 mb-4">
            <strong>PriceWise</strong> - Your trusted partner in smart shopping
          </p>
          <p className="text-sm text-gray-500">
            © 2024 PriceWise. All rights reserved. | Making online shopping
            smarter.
          </p>
        </div>
      </section>
    </div>
  );
};

export default About;
