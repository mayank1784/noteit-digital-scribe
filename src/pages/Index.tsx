
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Camera, BookOpen, Users, Check, Star } from 'lucide-react';
import Layout from '@/components/Layout';

const Index = () => {
  return (
    <Layout showHeader={false}>
      <div className="min-h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Noteit.digital</span>
              </div>
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button className="gradient-bg">Get Started</Button>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 animate-fade-in">
              Bridge Physical & 
              <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Digital</span> Note-Taking
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fade-in">
              Transform your handwritten notes with QR-enabled notebooks. Write on paper, enhance digitally. 
              The perfect fusion of analog creativity and digital organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Link to="/register">
                <Button size="lg" className="gradient-bg text-lg px-8 py-3 w-full sm:w-auto">
                  Start Free Trial
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 w-full sm:w-auto">
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
              How It Works in 3 Simple Steps
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="text-center hover-scale">
                <CardContent className="p-8">
                  <div className="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                    <QrCode className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">1. Scan Your Notebook</h3>
                  <p className="text-gray-600">
                    Register your physical Noteit notebook by scanning the unique QR code on the cover
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover-scale">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">2. Write on Paper</h3>
                  <p className="text-gray-600">
                    Use your notebook naturally - write, sketch, and brainstorm on the physical pages
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center hover-scale">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4">3. Add Digital Notes</h3>
                  <p className="text-gray-600">
                    Scan page QR codes to add photos, voice memos, and digital annotations
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
              Everything You Need
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                { icon: QrCode, title: "QR Code Integration", desc: "Every page has a unique QR code for instant digital access" },
                { icon: Camera, title: "Multi-Type Notes", desc: "Add text, photos, and voice recordings to any page" },
                { icon: BookOpen, title: "Multiple Notebooks", desc: "Manage up to 5 notebooks on the free plan" },
                { icon: Users, title: "Cross-Platform Sync", desc: "Access your notes from any device, anywhere" },
                { icon: Check, title: "Offline Access", desc: "View and edit notes even without internet connection" },
                { icon: Star, title: "Premium Templates", desc: "Choose from student, business, creative, and journal layouts" }
              ].map((feature, index) => (
                <Card key={index} className="p-6 hover-scale">
                  <feature.icon className="w-8 h-8 text-blue-600 mb-4" />
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-16">
              Simple, Transparent Pricing
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-2 border-gray-200">
                <h3 className="text-2xl font-bold mb-4">Free</h3>
                <div className="text-4xl font-bold mb-6">$0<span className="text-lg text-gray-600">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />Up to 5 notebooks</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />Unlimited pages</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />Text & photo notes</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />Basic templates</li>
                </ul>
                <Link to="/register">
                  <Button className="w-full" variant="outline">Get Started Free</Button>
                </Link>
              </Card>

              <Card className="p-8 border-2 border-blue-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm">Popular</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">Pro</h3>
                <div className="text-4xl font-bold mb-6">$9<span className="text-lg text-gray-600">/month</span></div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />Unlimited notebooks</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />Voice recordings</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />Premium templates</li>
                  <li className="flex items-center"><Check className="w-5 h-5 text-green-500 mr-2" />Advanced search</li>
                </ul>
                <Link to="/register">
                  <Button className="w-full gradient-bg">Start Pro Trial</Button>
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 gradient-bg">
          <div className="max-w-4xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold text-white mb-6">
              Ready to Transform Your Note-Taking?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Join thousands of students, professionals, and creatives who've discovered the perfect blend of analog and digital.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3">
                Start Your Free Trial
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                  </div>
                  <span className="text-xl font-bold">Noteit.digital</span>
                </div>
                <p className="text-gray-400">
                  Bridging physical and digital note-taking for the modern world.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Features</a></li>
                  <li><a href="#" className="hover:text-white">Pricing</a></li>
                  <li><a href="#" className="hover:text-white">Templates</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">Help Center</a></li>
                  <li><a href="#" className="hover:text-white">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li><a href="#" className="hover:text-white">About</a></li>
                  <li><a href="#" className="hover:text-white">Blog</a></li>
                  <li><a href="#" className="hover:text-white">Careers</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 Noteit.digital. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default Index;
