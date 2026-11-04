import { Mail, Send } from "lucide-react";
import type React from "react";

const Footer: React.FC = () => (
	<footer className="mt-auto border-t border-north-200 bg-white py-4">
		<div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 sm:px-6 md:flex-row">
			<div className="flex items-center gap-2">
				<img src="/logo.png" alt="" aria-hidden="true" className="h-6 w-6 object-contain" />
				<span className="font-serif text-base font-bold text-north-800 sm:text-lg">New-North</span>
			</div>

			<div className="flex items-center gap-5 text-sm text-north-500 sm:gap-8">
				<a
					href="https://t.me/your_group"
					target="_blank"
					rel="noreferrer"
					className="flex min-h-11 items-center gap-2 rounded-md px-1 transition-colors hover:text-north-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-north-800"
				>
					<Send size={18} aria-hidden="true" />
					tg-канал
				</a>
				<a
					href="mailto:new-north@gmail.com"
					className="flex min-h-11 items-center gap-2 rounded-md px-1 transition-colors hover:text-north-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-north-800"
				>
					<Mail size={18} aria-hidden="true" />
					n-n@gmail.com
				</a>
			</div>
		</div>
	</footer>
);

export default Footer;
