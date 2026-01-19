import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Camera, BookOpen, Users, Check, Star, Sparkles, Zap, Shield } from 'lucide-react';
import noteitLogo from '@/assets/noteit-logo.png';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 pointer-events-none" />
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="relative z-50 bg-card/50 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={noteitLogo} alt="Noteit" className="h-10 w-auto" />
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/login">
                <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button className="gradient-bg text-primary-foreground rounded-xl shadow-glow-sm hover:shadow-glow transition-all">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 py-20 lg:py-32 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-primary mr-2" />
            <span className="text-sm text-primary font-medium">The future of note-taking is here</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-foreground mb-6 animate-fade-in leading-tight">
            Bridge Physical &{' '}
            <span className="text-gradient">Digital</span>
            <br />Note-Taking
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-fade-in">
            Transform your handwritten notes with QR-enabled notebooks. Write on paper, enhance digitally. 
            The perfect fusion of analog creativity and digital organization.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/register">
              <Button size="lg" className="gradient-bg text-primary-foreground text-lg px-8 py-6 rounded-2xl shadow-glow hover:shadow-glow-lg transition-all duration-300 w-full sm:w-auto font-semibold">
                Start Free Trial
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm w-full sm:w-auto">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 py-20 lg:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg">Three simple steps to revolutionize your notes</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: QrCode,
                title: "Scan Your Notebook",
                description: "Register your physical Noteit notebook by scanning the unique QR code",
                gradient: "notebook-gradient-business"
              },
              {
                icon: BookOpen,
                title: "Write on Paper",
                description: "Use your notebook naturally - write, sketch, and brainstorm on pages",
                gradient: "notebook-gradient-journal"
              },
              {
                icon: Camera,
                title: "Add Digital Notes",
                description: "Scan page QR codes to add photos, voice memos, and annotations",
                gradient: "notebook-gradient-planner"
              }
            ].map((step, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl hover-scale group overflow-hidden">
                <CardContent className="p-8 text-center">
                  <div className={`w-16 h-16 ${step.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-primary/60 text-sm font-semibold mb-2">STEP {index + 1}</div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 py-20 lg:py-24 bg-card/30">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-muted-foreground text-lg">Powerful features for the modern note-taker</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: QrCode, title: "QR Code Integration", desc: "Every page has a unique QR code for instant digital access" },
              { icon: Camera, title: "Multi-Type Notes", desc: "Add text, photos, and voice recordings to any page" },
              { icon: BookOpen, title: "Multiple Notebooks", desc: "Manage up to 5 notebooks on the free plan" },
              { icon: Users, title: "Cross-Platform Sync", desc: "Access your notes from any device, anywhere" },
              { icon: Shield, title: "Secure & Private", desc: "Your notes are encrypted and protected" },
              { icon: Zap, title: "Lightning Fast", desc: "Instant scanning and syncing capabilities" }
            ].map((feature, index) => (
              <Card key={index} className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl p-6 hover-scale group">
                <feature.icon className="w-10 h-10 text-primary mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative z-10 py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple Pricing
            </h2>
            <p className="text-muted-foreground text-lg">Start free, upgrade when you need more</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Free Plan */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/30 rounded-2xl p-8 hover-scale">
              <h3 className="text-2xl font-bold text-foreground mb-2">Free</h3>
              <div className="text-4xl font-bold text-foreground mb-6">
                $0<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Up to 5 notebooks", "Unlimited pages", "Text & photo notes", "Basic templates"].map((item, i) => (
                  <li key={i} className="flex items-center text-muted-foreground">
                    <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button variant="outline" className="w-full rounded-xl h-12 border-border/50">
                  Get Started Free
                </Button>
              </Link>
            </Card>

            {/* Pro Plan */}
            <Card className="relative bg-card/80 backdrop-blur-sm border-primary/30 rounded-2xl p-8 hover-scale shadow-glow">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="gradient-bg text-primary-foreground px-4 py-1.5 rounded-full text-sm font-semibold">
                  Popular
                </span>
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Pro</h3>
              <div className="text-4xl font-bold text-foreground mb-6">
                $9<span className="text-lg text-muted-foreground font-normal">/month</span>
              </div>
              <ul className="space-y-4 mb-8">
                {["Unlimited notebooks", "Voice recordings", "Premium templates", "Advanced search", "Priority support"].map((item, i) => (
                  <li key={i} className="flex items-center text-muted-foreground">
                    <Check className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/register">
                <Button className="w-full gradient-bg text-primary-foreground rounded-xl h-12 font-semibold shadow-glow-sm hover:shadow-glow transition-all">
                  Start Pro Trial
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-20 lg:py-24">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="gradient-bg rounded-3xl p-10 lg:p-16 text-center shadow-glow-lg">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Note-Taking?
            </h2>
            <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of students, professionals, and creatives who've discovered the perfect blend of analog and digital.
            </p>
            <Link to="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-2xl font-semibold">
                Start Your Free Trial
              </Button>
            </Link>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/30 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img src={noteitLogo} alt="Noteit" className="h-10 w-auto mb-4" />
              <p className="text-muted-foreground text-sm">
                Bridging physical and digital note-taking for the modern world.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li><a href="#" className="hover:text-foreground transition-colors">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Careers</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border/30 mt-8 pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; {new Date().getFullYear()} Noteit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
