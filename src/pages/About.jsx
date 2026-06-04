import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-heading font-bold text-foreground mb-6">About TrustHaul Freight</h1>

        <div className="prose prose-lg max-w-none text-muted-foreground space-y-5">
          <p>
            TrustHaul Freight is a modern freight marketplace built to connect independent truck drivers and carriers
            with shippers who need reliable, on-time delivery across the United States. We believe the trucking
            industry deserves a platform that is transparent, fair, and built for real working professionals.
          </p>

          <p>
            Our platform allows shippers to post loads in minutes — specifying pickup and delivery locations,
            cargo type, weight, required truck type, and their budget. Verified drivers can then browse available
            loads, submit competitive bids, and get matched with shipments that fit their routes and equipment.
            No middlemen, no hidden fees — just direct connections between the people who move freight and the
            businesses that need it moved.
          </p>

          <p>
            TrustHaul Freight is designed for independent owner-operators, small trucking companies, freight
            brokers, and any business that needs to ship goods reliably. Whether you're hauling flatbed loads,
            refrigerated freight, dry van shipments, or hotshot deliveries, our platform supports all major
            truck types and cargo categories.
          </p>

          <p>
            Trust and safety are at the core of everything we do. All drivers go through a verification process
            including CDL validation, insurance verification, and background checks. Shippers are rated by
            drivers after each delivery, and drivers build public profiles with star ratings and completed
            load histories — so both sides of every transaction can make informed decisions.
          </p>

          <p>
            TrustHaul Freight is built and maintained by a passionate team of logistics and technology
            professionals who have spent years working in the freight industry. We understand the challenges
            drivers and shippers face every day, and we're committed to building tools that make freight
            hauling simpler, safer, and more profitable for everyone involved.
          </p>
        </div>

        <div className="mt-10 flex gap-4">
          <Link
            to="/loads"
            className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
          >
            Browse Loads
          </Link>
          <Link
            to="/contact"
            className="inline-block border border-border text-foreground px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}