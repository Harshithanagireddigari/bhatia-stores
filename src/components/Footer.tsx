import Link from "next/link";
import { Phone, Mail, MapPin, MessageCircle, ArrowUpRight, ShieldCheck, Truck, Clock } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-stone-200/90 bg-stone-950 text-stone-300 dark:border-stone-800">
      {/* Top Value Banner */}
      <div className="border-b border-stone-800/80 bg-stone-900/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Inspected Safe Transport</h4>
                <p className="text-xs text-stone-400 mt-0.5">Heavy-duty pallet packaging with damage protection</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Prepaid & COD Available</h4>
                <p className="text-xs text-stone-400 mt-0.5">Secure payment processing with verified receipts</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
                <MessageCircle size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">WhatsApp Tile Concierge</h4>
                <p className="text-xs text-stone-400 mt-0.5">Direct chat with our showroom surface specialists</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-block">
              <span className="font-serif text-2xl font-bold tracking-wider text-white">
                BHATIA <span className="font-sans text-lg font-light tracking-widest text-amber-400">STORES</span>
              </span>
              <span className="block text-[10px] uppercase tracking-[0.25em] text-stone-400 mt-0.5">
                Luxury Tiles & Designer Sanitaryware
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-stone-400 max-w-sm">
              Supplying premium vitrified slabs, double charge flooring, waterproof digital wall ceramics, and luxury Italian sanitaryware for refined homes and commercial developments.
            </p>
            <div className="pt-2">
              <a
                href="https://wa.me/919984979720?text=Hello%20Bhatia%20Stores,%20I%20would%20like%20to%20inquire%20about%20your%20tiles%20and%20sanitaryware."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
              >
                <MessageCircle size={14} />
                <span>Chat on WhatsApp (+91 99849 79720)</span>
              </a>
            </div>
          </div>

          {/* Product Catalog Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Showroom Catalog
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/shop" className="hover:text-white transition-colors">
                  All 80+ Products
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Vitrified+Floor+Tiles" className="hover:text-white transition-colors">
                  PGVT Vitrified Slabs
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Double+Charge" className="hover:text-white transition-colors">
                  Double Charge Tiles
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Digital+Wall+Tiles" className="hover:text-white transition-colors">
                  Digital Wall Ceramics
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Satin+Matt" className="hover:text-white transition-colors">
                  Satin Matt Porcelain
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Step+%26+Riser" className="hover:text-white transition-colors">
                  Step & Riser Systems
                </Link>
              </li>
              <li>
                <Link href="/shop?category=Sanitaryware+%26+Faucets" className="hover:text-white transition-colors">
                  Italian Sanitaryware
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Account Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Customer Hub
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-stone-400">
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  My Account Dashboard
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-white transition-colors">
                  Track Order Status
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-white transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-white transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Showroom
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Showroom & Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Showroom & Policies
            </h4>
            <div className="mt-4 space-y-3 text-xs text-stone-400">
              <p className="flex items-start gap-2">
                <MapPin size={14} className="mt-0.5 text-amber-400 shrink-0" />
                <span>Main Ring Road, Industrial Area, Sector 4, India</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-amber-400 shrink-0" />
                <span>+91 99849 79720</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-amber-400 shrink-0" />
                <span>contact@bhatiastores.com</span>
              </p>

              <div className="pt-2 flex flex-col space-y-1.5 border-t border-stone-800 text-[11px]">
                <Link href="/contact" className="hover:text-white">Privacy Policy</Link>
                <Link href="/contact" className="hover:text-white">Terms of Sale & Delivery</Link>
                <Link href="/contact" className="hover:text-white">Damage Replacement Policy</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-stone-800/80 pt-6 text-[11px] text-stone-500">
          <p>&copy; {new Date().getFullYear()} Bhatia Stores. All rights reserved. Premium Tiles & Sanitaryware.</p>
          <div className="mt-3 sm:mt-0 flex items-center gap-4">
            <span>Prepaid & COD Supported</span>
            <span>•</span>
            <span>Inspected Crate Freight</span>
            <span>•</span>
            <a href="https://wa.me/919984979720" className="text-amber-400 hover:underline">
              WhatsApp Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
