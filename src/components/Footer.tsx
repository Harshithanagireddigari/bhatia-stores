import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle, Phone } from "lucide-react";

const supportPhone = "+91 91204 35950";
const supportEmail = "bhatiasanitaryware@gmail.com";

export default function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-[#ddd5c9] bg-[#f1ece4] text-[#322e28] dark:border-stone-800 dark:bg-[#14120f] dark:text-stone-300">
      <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-bl-[6rem] rounded-tl-[6rem] border-b border-l border-[#d8c9b3] bg-[#e5dbcf]/70 dark:border-stone-800 dark:bg-stone-900/40 sm:h-64 sm:w-64" />
      <div className="relative mx-auto max-w-6xl px-5 py-8 md:py-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_.7fr_.8fr_1fr]">
          <div>
            <p className="font-serif text-2xl tracking-[.12em] text-[#4a3373] dark:text-[#e2bd72]">BHATIA</p>
            <p className="mt-3 max-w-xs text-xs leading-5 text-[#625b52] dark:text-stone-400">Thoughtful tiles and sanitaryware for homes made to feel calm, personal and lasting.</p>
            <a href="https://wa.me/919120435950" className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#b49663] bg-[#fbf8f3] px-3.5 py-1.5 text-xs font-semibold text-[#584015] shadow-sm transition hover:bg-white dark:border-stone-700 dark:bg-stone-900 dark:text-[#e2bd72] dark:hover:bg-stone-800">
              <MessageCircle size={14} /> Start a WhatsApp enquiry <ArrowUpRight size={13} />
            </a>
          </div>

          <div>
            <p className="footer-title text-xs font-bold uppercase tracking-wider text-[#786a5b] dark:text-[#b49663]">Shop</p>
            <div className="mt-3 space-y-2 text-xs text-[#625b52] dark:text-stone-400"><Link href="/shop" className="block transition hover:text-[#4a3373] dark:hover:text-white">All products</Link><Link href="/wishlist" className="block transition hover:text-[#4a3373] dark:hover:text-white">Wishlist</Link><Link href="/cart" className="block transition hover:text-[#4a3373] dark:hover:text-white">Cart</Link></div>
          </div>

          <div>
            <p className="footer-title text-xs font-bold uppercase tracking-wider text-[#786a5b] dark:text-[#b49663]">Your account</p>
            <div className="mt-3 space-y-2 text-xs text-[#625b52] dark:text-stone-400"><Link href="/account" className="block transition hover:text-[#4a3373] dark:hover:text-white">My account</Link><Link href="/orders" className="block transition hover:text-[#4a3373] dark:hover:text-white">My orders</Link><Link href="/login" className="block transition hover:text-[#4a3373] dark:hover:text-white">Sign in</Link></div>
          </div>

          <div>
            <p className="footer-title text-xs font-bold uppercase tracking-wider text-[#786a5b] dark:text-[#b49663]">Contact us</p>
            <div className="mt-3 space-y-2.5 text-xs text-[#625b52] dark:text-stone-400">
              <a href="tel:+919120435950" className="flex items-center gap-2 hover:text-[#4a3373] dark:hover:text-white"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e3d5bd] text-[#73511b] dark:bg-stone-800 dark:text-[#e2bd72]"><Phone size={13} /></span>{supportPhone}</a>
              <a href="https://wa.me/919120435950" className="flex items-center gap-2 hover:text-[#4a3373] dark:hover:text-white"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e3d5bd] text-[#73511b] dark:bg-stone-800 dark:text-[#e2bd72]"><MessageCircle size={13} /></span>WhatsApp support</a>
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 break-all hover:text-[#4a3373] dark:hover:text-white"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#e3d5bd] text-[#73511b] dark:bg-stone-800 dark:text-[#e2bd72]"><Mail size={13} /></span>{supportEmail}</a>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-[#d7cdbf] pt-4 text-[11px] text-[#7d746a] dark:border-stone-800 dark:text-stone-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Bhatia Stores. All rights reserved.</p><p>Tiles for beautifully considered spaces.</p>
        </div>
      </div>
    </footer>
  );
}
