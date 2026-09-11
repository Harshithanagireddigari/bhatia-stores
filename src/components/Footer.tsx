import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";

const supportPhone = "+91 91204 35950";
const supportEmail = "bhatiasanitaryware@gmail.com";

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-[#ddd5c9] bg-[#f1ece4] text-[#322e28]">
      <div className="pointer-events-none absolute -right-12 top-0 h-72 w-72 rounded-bl-[9rem] rounded-tl-[9rem] border-b border-l border-[#d8c9b3] bg-[#e5dbcf]/70 sm:h-96 sm:w-96" />
      <div className="relative mx-auto max-w-7xl px-6 py-14 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.35fr_.7fr_.8fr_1.05fr]">
          <div>
            <p className="font-serif text-3xl tracking-[.14em] text-[#4a3373]">BHATIA</p>
            <p className="mt-5 max-w-sm text-base leading-7 text-[#625b52]">Thoughtful tiles and sanitaryware for homes made to feel calm, personal and lasting.</p>
            <a href="https://wa.me/919120435950" className="mt-7 inline-flex items-center gap-2 rounded-full border border-[#b49663] bg-[#fbf8f3] px-5 py-3 text-sm font-semibold text-[#584015] shadow-sm transition hover:-translate-y-0.5 hover:bg-white">
              <MessageCircle size={17} /> Start a WhatsApp enquiry <ArrowUpRight size={15} />
            </a>
          </div>

          <div>
            <p className="footer-title !text-[#786a5b]">Shop</p>
            <div className="space-y-3"><Link href="/shop">All products</Link><Link href="/wishlist">Wishlist</Link><Link href="/cart">Cart</Link></div>
          </div>

          <div>
            <p className="footer-title !text-[#786a5b]">Your account</p>
            <div className="space-y-3"><Link href="/account">My account</Link><Link href="/orders">My orders</Link><Link href="/login">Sign in</Link></div>
          </div>

          <div>
            <p className="footer-title !text-[#786a5b]">Contact us</p>
            <div className="space-y-4 text-sm text-[#625b52]">
              <a href="tel:+919120435950" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e3d5bd] text-[#73511b]"><Phone size={16} /></span>{supportPhone}</a>
              <a href="https://wa.me/919120435950" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e3d5bd] text-[#73511b]"><MessageCircle size={16} /></span>WhatsApp support</a>
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-3 break-all"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e3d5bd] text-[#73511b]"><Mail size={16} /></span>{supportEmail}</a>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[#d7cdbf] pt-5 text-xs text-[#7d746a] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bhatia Stores. All rights reserved.</p><p>Tiles for beautifully considered spaces.</p>
        </div>
      </div>
    </footer>
  );
}
