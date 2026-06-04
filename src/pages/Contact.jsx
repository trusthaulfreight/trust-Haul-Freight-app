import { Mail, Phone, MapPin, Twitter, Linkedin } from "lucide-react";

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-heading font-bold text-foreground mb-4">Contact Us</h1>
        <p className="text-muted-foreground text-lg mb-12">
          Have a question or need support? We're here to help. Reach out through any of the methods below.
        </p>

        <div className="grid md:grid-cols-2 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Email</p>
                <a href="mailto:support@trusthaulfreight.com" className="text-secondary hover:underline">
                  support@trusthaulfreight.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Phone</p>
                <a href="tel:+18005551234" className="text-muted-foreground hover:text-foreground">
                  +1 (800) 555-1234
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Headquarters</p>
                <p className="text-muted-foreground">United States</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                <Twitter className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Social</p>
                <div className="flex gap-3 mt-1">
                  <a href="https://twitter.com/trusthaulfreight" target="_blank" rel="noopener noreferrer"
                    className="text-secondary hover:underline text-sm">Twitter / X</a>
                  <a href="https://linkedin.com/company/trusthaulfreight" target="_blank" rel="noopener noreferrer"
                    className="text-secondary hover:underline text-sm">LinkedIn</a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-card border border-border rounded-xl p-6">
            <h2 className="text-xl font-heading font-semibold text-foreground mb-4">Send a Message</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thanks for your message! We'll get back to you within 1 business day.");
                e.target.reset();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your name"
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="your@email.com"
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="How can we help?"
                  className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-secondary text-secondary-foreground py-2.5 rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}