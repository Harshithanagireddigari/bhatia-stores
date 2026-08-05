export default function Footer() {
  return (
    <footer className="border-t border-neutral/20 bg-neutral-light py-8 dark:border-neutral-dark dark:bg-neutral-dark">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-neutral">
        <p>&copy; {new Date().getFullYear()} Bhatia Stores. Quality tiles and sanitaryware for every space.</p>
        <div className="mt-2 flex justify-center gap-4">
          <span>Fast Delivery</span>
          <span>&middot;</span>
          <span>Secure Payments</span>
          <span>&middot;</span>
          <a href="https://wa.me/919120435950" className="hover:text-primary">WhatsApp Support</a>
        </div>
      </div>
    </footer>
  );
}
