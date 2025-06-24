
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Brain, Sparkles, Search, Network, Upload, Shield, Zap, Globe, Moon, Sun, Menu, X, ArrowRight, Star, Users, Play } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { LoginModal } from '@/components/auth/LoginModal';
import { SignupModal } from '@/components/auth/SignupModal';

const Landing = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/app');
    }
  }, [user, navigate]);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Processing",
      description: "Automatically extract insights, entities, and connections from your content using advanced AI.",
      gradient: "from-blue-500 to-cyan-500",
      delay: "0s"
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find exactly what you're looking for with natural language queries and intelligent filtering.",
      gradient: "from-purple-500 to-pink-500",
      delay: "0.1s"
    },
    {
      icon: Network,
      title: "Knowledge Graph",
      description: "Visualize connections between your ideas and discover hidden relationships in your knowledge.",
      gradient: "from-green-500 to-teal-500",
      delay: "0.2s"
    },
    {
      icon: Upload,
      title: "Multi-Format Support",
      description: "Upload text, URLs, files, and embedded content from social media platforms.",
      gradient: "from-orange-500 to-red-500",
      delay: "0.3s"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays secure with enterprise-grade encryption and privacy controls.",
      gradient: "from-indigo-500 to-purple-500",
      delay: "0.4s"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Instant search, real-time updates, and seamless performance across all devices.",
      gradient: "from-yellow-500 to-orange-500",
      delay: "0.5s"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Research Scientist",
      content: "Second Brain has revolutionized how I organize my research. The AI connections are incredible!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Content Creator",
      content: "I can finally keep track of all my ideas and inspirations in one place. Game changer!",
      rating: 5
    },
    {
      name: "Dr. Emily Watson",
      role: "Professor",
      content: "The knowledge graph feature helps me see patterns I never noticed before. Brilliant!",
      rating: 5
    }
  ];

  const stats = [
    { number: "50K+", label: "Active Users" },
    { number: "2M+", label: "Ideas Stored" },
    { number: "98%", label: "Satisfaction Rate" },
    { number: "24/7", label: "AI Processing" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900 overflow-hidden relative">
      {/* Enhanced Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-purple-600/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/30 to-pink-600/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-72 h-72 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-gradient-to-br from-green-400/20 to-teal-600/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/20 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/10 dark:bg-black/20 backdrop-blur-xl border-b border-white/20 dark:border-white/10 sticky top-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent dark:from-gray-100 dark:via-blue-100 dark:to-purple-100">
                  EchoBrain
                </h1>
                <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Knowledge Base</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full hover:scale-110 transition-transform duration-300"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              
              <Button 
                variant="ghost" 
                onClick={() => setShowLogin(true)}
                className="hover:scale-105 transition-transform duration-300"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => setShowSignup(true)}
                className="hover:scale-105 transition-transform duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
              >
                Get Started Free
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-full"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 p-4 bg-white/20 dark:bg-black/30 backdrop-blur-xl rounded-lg border border-white/20 dark:border-white/10 animate-scale-in">
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowLogin(true)}
                  className="w-full justify-start"
                >
                  Sign In
                </Button>
                <Button 
                  onClick={() => setShowSignup(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Get Started Free
                </Button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
            <div className="space-y-6">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-full border border-blue-200 dark:border-blue-800 mb-6">
                <Star className="h-4 w-4 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Trusted by 50,000+ users worldwide</span>
              </div>
              
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent dark:from-gray-100 dark:via-blue-100 dark:to-purple-100 leading-tight">
                EchoBrain
                <span className="block text-5xl md:text-7xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  AI Powered Second Brain
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Transform how you capture, organize, and discover knowledge. Let AI help you build connections, 
                extract insights, and unlock the full potential of your information.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => setShowSignup(true)}
                className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group"
              >
                <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
                Start Building Your Brain
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setShowLogin(true)}
                className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 group bg-white/20 dark:bg-black/20 backdrop-blur-sm border-white/30"
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                Watch Demo
              </Button>
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div 
                  key={index} 
                  className="text-center group hover:scale-105 transition-transform duration-300"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent dark:from-gray-100 dark:to-blue-100">
              Powerful Features
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to build and maintain your personal knowledge base with the power of artificial intelligence
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card 
                key={index} 
                className="bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:bg-white/20 dark:hover:bg-black/30 transition-all duration-500 hover:scale-105 hover:shadow-2xl group cursor-pointer animate-fade-in"
                style={{ animationDelay: feature.delay }}
              >
                <CardContent className="p-8 text-center space-y-6">
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${feature.gradient} p-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <feature.icon className="h-10 w-10 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent dark:from-gray-100 dark:to-blue-100">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground">Join thousands of satisfied users</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 dark:from-blue-600/20 dark:to-purple-600/20 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:shadow-2xl transition-all duration-300">
              <CardContent className="p-12 text-center space-y-6">
                <div className="flex justify-center space-x-1 mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl font-medium text-foreground italic leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="space-y-2">
                  <div className="font-semibold text-lg">{testimonials[currentTestimonial].name}</div>
                  <div className="text-muted-foreground">{testimonials[currentTestimonial].role}</div>
                </div>
                
                {/* Testimonial indicators */}
                <div className="flex justify-center space-x-2 mt-6">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentTestimonial(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentTestimonial 
                          ? 'bg-blue-600 w-8' 
                          : 'bg-gray-300 dark:bg-gray-600 hover:bg-blue-400'
                      }`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="container mx-auto px-4 py-20">
          <Card className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 dark:from-blue-600/30 dark:to-purple-600/30 backdrop-blur-xl border border-white/20 dark:border-white/10 hover:shadow-2xl transition-all duration-300 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 dark:from-blue-600/10 dark:to-purple-600/10"></div>
            <CardContent className="p-16 text-center space-y-8 relative z-10">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Ready to augment your intelligence?
                </h2>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Join thousands of users who are already building their second brain with AI. 
                  Start your journey to enhanced productivity and knowledge management today.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button 
                  size="lg" 
                  onClick={() => setShowSignup(true)}
                  className="text-lg px-8 py-6 hover:scale-105 transition-all duration-300 shadow-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group"
                >
                  <Brain className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Free plan available • No credit card required</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="relative z-10 bg-white/5 dark:bg-black/20 backdrop-blur-xl border-t border-white/20 dark:border-white/10 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-sm opacity-75"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-xl">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Second Brain
              </span>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              © 2024 Second Brain. Built with AI for the future of knowledge management. 
              Empowering minds, one connection at a time.
            </p>
            <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-blue-600 transition-colors duration-300">Privacy Policy</a>
              <a href="#" className="hover:text-blue-600 transition-colors duration-300">Terms of Service</a>
              <a href="#" className="hover:text-blue-600 transition-colors duration-300">Contact Us</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <LoginModal
        open={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToSignup={() => {
          setShowLogin(false);
          setShowSignup(true);
        }}
      />

      <SignupModal
        open={showSignup}
        onClose={() => setShowSignup(false)}
        onSwitchToLogin={() => {
          setShowSignup(false);
          setShowLogin(true);
        }}
      />
    </div>
  );
};

export default Landing;
