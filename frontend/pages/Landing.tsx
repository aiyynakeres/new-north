import type React from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";

const Landing: React.FC = () => (
	<main className="relative isolate flex min-h-[calc(100dvh-9rem)] items-center justify-center overflow-hidden bg-[url('/background.jpg')] bg-cover bg-center px-4 py-16 text-center md:min-h-[calc(100dvh-10.5rem)] md:px-8">
		<div className="absolute inset-0 -z-10 bg-white/10" aria-hidden="true" />
		<div className="mx-auto flex w-full max-w-5xl flex-col items-center">
			<h1 className="font-serif text-5xl font-bold tracking-tight text-north-900 drop-shadow-[0_1px_0_rgba(255,255,255,0.35)] sm:text-6xl md:text-7xl lg:text-8xl">
				Новый Север
			</h1>
			<p className="mt-6 text-xl font-light text-north-700 sm:text-2xl md:mt-8 md:text-3xl">
				Делиться и вдохновлять
			</p>
			<p className="mt-6 max-w-4xl text-base font-medium leading-relaxed text-north-700 sm:text-lg md:mt-8 md:text-xl md:leading-8">
				Ламповое сообщество неравнодушных жителей Якутии. Здесь можно находить единомышленников,
				делиться своим опытом и изучать полезный контент. Чтобы общение было комфортным, участники
				указывают актуальную и проверенную информацию о себе.
			</p>
			<Link
				to="/register"
				className="mt-10 rounded-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-white/80 md:mt-12"
			>
				<Button className="min-h-14 rounded-xl px-10 py-4 text-lg shadow-lg hover:shadow-xl md:min-h-16 md:px-12 md:text-xl">
					Вступить
				</Button>
			</Link>
		</div>
	</main>
);

export default Landing;
