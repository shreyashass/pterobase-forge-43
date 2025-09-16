import { Link } from 'react-router-dom';
import { Server, Mail, Phone, MapPin, Shield, FileText, Cookie, RefreshCw } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Server className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">PteroBilling</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Professional game server hosting with advanced billing and management capabilities. 
              Secure payments through PayPal and Razorpay.
            </p>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
                  Game Server Hosting
                </Link>
              </li>
              <li>
                <Link to="/order" className="text-muted-foreground hover:text-foreground transition-colors">
                  Order Servers
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Manage Servers
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
                  <Mail className="h-3 w-3 mr-1" />
                  24/7 Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <Mail className="h-4 w-4 mr-2" />
                  Contact Support
                </Link>
              </li>
              <li className="flex items-center text-muted-foreground">
                <Phone className="h-4 w-4 mr-2" />
                24/7 Available
              </li>
              <li className="flex items-center text-muted-foreground">
                <MapPin className="h-4 w-4 mr-2" />
                Global Infrastructure
              </li>
            </ul>
          </div>

          {/* Legal Pages */}
          <div>
            <h3 className="font-semibold mb-4">Legal & Policies</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <Shield className="h-3 w-3 mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-conditions" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="h-3 w-3 mr-2" />
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link to="/refund-policy" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="flex items-center text-muted-foreground hover:text-foreground transition-colors">
                  <Cookie className="h-3 w-3 mr-2" />
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 PteroBilling. All rights reserved. Secure payments via PayPal & Razorpay.</p>
        </div>
      </div>
    </footer>
  );
};