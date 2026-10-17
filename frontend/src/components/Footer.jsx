import React from "react";
import { ArrowRight } from "lucide-react";

const Footer = () => {
  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "Restaurants", href: "/restaurants" },
    { name: "Explore Food", href: "/menu" },
    { name: "My Orders", href: "/orders" },
    { name: "My Cart", href: "/cart" },
    { name: "Contact Us", href: "/contact" },
  ];

  const resources = [
    { name: "Help Center", href: "/help" },
    { name: "FAQs", href: "/faq" },
    { name: "Delivery Information", href: "/delivery" },
    { name: "Payment Options", href: "/payments" },
  ];

  const aboutLinks = [
    { name: "About Us", href: "/about" },
    { name: "Careers", href: "/careers" },
    { name: "Become a Partner", href: "/partner" },
  ];

  const legalLinks = [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Accessibility", href: "/accessibility" },
  ];

  const LinkColumn = ({ title, links }) => (
    <div>
      <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">
        {title}
      </h3>

      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.name}>
            <a
              href={link.href}
              className="text-sm text-gray-600 transition-colors hover:text-orange-500"
            >
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
   <footer className="zipbite-footer bg-gradient-to-br from-red-950 via-neutral-950 to-black p-2 sm:p-4">
      <div className="mx-auto flex min-h-[680px] max-w-[1600px] flex-col rounded-[28px] bg-white px-6 py-8 sm:px-10 sm:py-10">
        {/* Top section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
          <div>
            <a
              href="/"
              className="inline-flex items-center text-4xl font-extrabold tracking-tight text-neutral-900"
            >
              <span className="bg-orange-500 px-2 py-1 text-white">Z</span>
              <span>IPBITE</span>
            </a>

            <p className="mt-5 max-w-sm text-sm leading-6 text-gray-500">
              Delicious food, delivered to your doorstep. Discover your favorite
              restaurants and enjoy every bite with ZIPBITE.
            </p>
          </div>

          {/* CTA cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <a
              href="/partner"
              className="group flex min-h-40 flex-col justify-between rounded-2xl bg-neutral-950 p-5 text-white transition-transform hover:-translate-y-1"
            >
              <h3 className="text-base font-semibold">
                Become a restaurant partner
              </h3>

              <span className="flex h-11 w-11 items-center justify-center self-end rounded-full bg-white/15 transition-colors group-hover:bg-white/25">
                <ArrowRight size={21} />
              </span>
            </a>

            <a
              href="/restaurants"
              className="group flex min-h-40 flex-col justify-between rounded-2xl bg-orange-500 p-5 text-white transition-transform hover:-translate-y-1"
            >
              <h3 className="text-base font-semibold">Explore restaurants</h3>

              <span className="flex h-11 w-11 items-center justify-center self-end rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
                <ArrowRight size={21} />
              </span>
            </a>
          </div>
        </div>

        {/* Footer links */}
        <div className="my-auto grid grid-cols-2 gap-x-6 gap-y-10 py-16 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          <LinkColumn title="Quick Links" links={quickLinks} />

          <LinkColumn title="Resources" links={resources} />

          <LinkColumn title="About" links={aboutLinks} />

          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Delivery Hours
            </h3>

            <p className="text-sm leading-7 text-gray-600">
              Monday – Sunday
              <br />
              9:00 AM – 11:00 PM
            </p>
          </div>

          <div>
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-widest text-gray-500">
              Support
            </h3>

            <div className="space-y-3 text-sm text-gray-600">
              <a
                href="mailto:support@zipbite.com"
                className="block hover:text-orange-500"
              >
                support@zipbite.com
              </a>

              <a
                href="tel:+910000000000"
                className="block hover:text-orange-500"
              >
                +91 XXXXX XXXXX
              </a>

              <p>India</p>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="flex flex-col gap-5 border-t border-gray-200 pt-6 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} ZIPBITE. All rights reserved.</p>

          <div className="flex flex-wrap gap-x-5 gap-y-3">
            {legalLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="transition-colors hover:text-orange-500"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
