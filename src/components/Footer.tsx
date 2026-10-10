import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Mail, MessageCircle, Phone, ShieldCheck } from "lucide-react";

const supportPhone = "+91 91204 35950";
const supportEmail = "bhatiasanitaryware@gmail.com";

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-[#e2d5c3] bg-[#1a1613] pb-16 text-stone-200 dark:border-stone-800 dark:bg-[#12100e] font-sans md:pb-0">
      <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-16">
        
        {/* TOP GRID */}
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
          
          {/* BRAND COLUMN WITH LOGO */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-[#c5a059]/40 shadow-md">
                <Image
                  src="/logo.png"
                  alt="The Bhatias Logo"
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-serif text-xl font-bold tracking-tight text-[#c5a059]">THE BHATIAS</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">PREMIUM HARDWARE STORE</p>
              </div>
            </div>
            <p className="text-xs leading-6 text-stone-400 max-w-sm">
              Crafting beautiful, enduring spaces with luxury sanitaryware, tiles, faucets, and hardware solutions across India.
            </p>
          </div>

          {/* SHOP COLUMN */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#e2bd72]">Shop Collections</p>
            <div className="mt-4 space-y-2.5 text-xs text-stone-300">
              <Link href="/shop" className="block py-1 transition hover:text-white">All Products & Tiles</Link>
              <Link href="/shop?category=Sanitaryware" className="block py-1 transition hover:text-white">Sanitaryware</Link>
              <Link href="/shop?category=Faucets" className="block py-1 transition hover:text-white">Faucets & Taps</Link>
              <Link href="/wishlist" className="block py-1 transition hover:text-white">My Wishlist</Link>
              <Link href="/cart" className="block py-1 transition hover:text-white">Shopping Cart</Link>
            </div>
          </div>

          {/* CUSTOMER CARE & POLICIES */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#e2bd72]">Customer Care & Legal</p>
            <div className="mt-4 space-y-2.5 text-xs text-stone-300">
              <Link href="/account" className="block py-1 transition hover:text-white">My Account</Link>
              <Link href="/orders" className="block py-1 transition hover:text-white">Track Orders</Link>
              <Link href="/returns-and-exchange" className="block py-1 transition hover:text-white">Returns & Exchange Policy</Link>
              <Link href="/privacy-policy" className="block py-1 transition hover:text-white">Privacy Policy</Link>
              <Link href="/terms-and-conditions" className="block py-1 transition hover:text-white">Terms & Conditions</Link>
              <a href="/sitemap.xml" target="_blank" className="block py-1 transition hover:text-white">XML Sitemap</a>
            </div>
          </div>

          {/* CONTACT COLUMN */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#e2bd72]">Get In Touch</p>
            <div className="mt-4 space-y-3 text-xs text-stone-300">
              <a href="tel:+919120435950" className="flex items-center gap-3 py-1 hover:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25201b] text-[#e2bd72]">
                  <Phone size={15} />
                </span>
                <span>{supportPhone}</span>
              </a>
              <a href="https://wa.me/919120435950" className="flex items-center gap-3 py-1 hover:text-white">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#25201b] text-[#e2bd72]">
                  <MessageCircle size={15} />
                </span>
                <span>WhatsApp Priority Support</span>
              </a>
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-3 py-1 break-all hover:text-white">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#25201b] text-[#e2bd72]">
                  <Mail size={15} />
                </span>
                <span>{supportEmail}</span>
              </a>
            </div>
          </div>

        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 flex flex-col gap-3 border-t border-[#2e2720] pt-6 text-xs text-stone-300 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-stone-300 font-medium">© {new Date().getFullYear()} Bhatia Stores (The Bhatias). All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs">
            <Link href="/returns-and-exchange" className="py-2 px-2 hover:text-white text-stone-300">Returns</Link>
            <span className="text-stone-600">•</span>
            <Link href="/privacy-policy" className="py-2 px-2 hover:text-white text-stone-300">Privacy</Link>
            <span className="text-stone-600">•</span>
            <Link href="/terms-and-conditions" className="py-2 px-2 hover:text-white text-stone-300">Terms</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
