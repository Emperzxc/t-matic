export function Footer() {
  return (
    <footer className="border-t bg-slate-950 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-3 px-4 py-8 text-center sm:px-6 lg:px-8">
        <p className="text-sm font-semibold sm:text-base">
          © 2026 T-Matic: Thematic Analysis Tool. All rights reserved.
        </p>
        <div className="flex flex-wrap justify-center gap-5 text-sm text-slate-400">
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
          <span>Contact</span>
        </div>
      </div>
    </footer>
  );
}
