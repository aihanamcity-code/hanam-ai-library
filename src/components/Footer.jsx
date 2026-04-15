export default function Footer() {
  return (
    <footer className="bg-zinc-100 dark:bg-black w-full py-12 px-12 border-t border-zinc-200 dark:border-zinc-800">
      <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto">
        <div className="mb-6 md:mb-0">
          <p className="font-['SF_Pro'] text-[12px] font-medium text-zinc-500 opacity-80">
            © Hanam City AI Library. Editorial Authority via The Digital Curator.
          </p>
        </div>
        <div className="flex gap-8">
          <a className="font-['SF_Pro'] text-[12px] font-medium text-zinc-500 hover:text-blue-600 transition-colors duration-200" href="#">Privacy Policy</a>
          <a className="font-['SF_Pro'] text-[12px] font-medium text-zinc-500 hover:text-blue-600 transition-colors duration-200" href="#">Terms of Service</a>
          <a className="font-['SF_Pro'] text-[12px] font-medium text-zinc-500 hover:text-blue-600 transition-colors duration-200" href="#">Administrative Guidelines</a>
        </div>
      </div>
    </footer>
  );
}
