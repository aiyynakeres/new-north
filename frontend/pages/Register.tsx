import { BriefcaseBusiness, Camera, HeartHandshake, MessageCircle, UserRound } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Tag from "../components/ui/Tag";
import { api } from "../services/api";
import type { User as UserType } from "../types";

type Props = { onLogin: (u: UserType) => void };
type FormField = "telegramHandle" | "authCode" | "nickname" | "fullName";

type RegistrationForm = {
	telegramHandle: string;
	nickname: string;
	fullName: string;
	avatarUrl: string;
	country: string;
	city: string;
	bio: string;
	occupation: string;
	company: string;
	aboutClub: string;
	clubOffers: string[];
	tags: string[];
};

const OFFER_OPTIONS = ["Могу менторить", "Попить кофе", "Обсудить стартап"];

const Section = ({
	id,
	icon,
	title,
	children,
}: {
	id: string;
	icon: React.ReactNode;
	title: string;
	children: React.ReactNode;
}) => (
	<section className="border-t border-north-100 pt-8" aria-labelledby={id}>
		<div className="mb-5 flex items-center justify-center gap-2 text-north-800">
			<span aria-hidden="true">{icon}</span>
			<h2 id={id} className="font-serif text-lg font-bold text-north-900">
				{title}
			</h2>
		</div>
		{children}
	</section>
);

const TextAreaField = ({
	id,
	label,
	placeholder,
	value,
	maxLength,
	onChange,
}: {
	id: string;
	label: string;
	placeholder: string;
	value: string;
	maxLength: number;
	onChange: (value: string) => void;
}) => (
	<div>
		<label htmlFor={id} className="mb-1 block text-sm font-medium text-north-700">
			{label}
		</label>
		<textarea
			id={id}
			maxLength={maxLength}
			className="min-h-28 w-full resize-y rounded-xl border border-north-200 bg-white px-4 py-3 text-north-800 placeholder-north-300 transition-all focus:outline-none focus:ring-2 focus:ring-north-400"
			placeholder={placeholder}
			value={value}
			onChange={(event) => onChange(event.target.value)}
		/>
		<p className="mt-1 text-right text-xs tabular-nums text-north-500">
			{value.length}/{maxLength}
		</p>
	</div>
);

const Register: React.FC<Props> = ({ onLogin }) => {
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [formData, setFormData] = useState<RegistrationForm>({
		telegramHandle: "",
		nickname: "",
		fullName: "",
		avatarUrl: "",
		country: "",
		city: "",
		bio: "",
		occupation: "",
		company: "",
		aboutClub: "",
		clubOffers: [],
		tags: [],
	});
	const [authCode, setAuthCode] = useState("");
	const [tagInput, setTagInput] = useState("");
	const [touched, setTouched] = useState<Record<FormField, boolean>>({
		telegramHandle: false,
		authCode: false,
		nickname: false,
		fullName: false,
	});
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const updateForm = <K extends keyof RegistrationForm>(field: K, value: RegistrationForm[K]) => {
		setFormData((previous) => ({ ...previous, [field]: value }));
	};

	const fieldErrors = useMemo(() => {
		const errors: Partial<Record<FormField, string>> = {};
		if (!formData.telegramHandle.trim()) errors.telegramHandle = "Telegram обязателен";
		if (!authCode.trim()) errors.authCode = "Код обязателен";
		else if (!/^\d{6}$/.test(authCode.trim())) errors.authCode = "Код должен состоять из 6 цифр";
		if (!formData.nickname.trim()) errors.nickname = "Придумайте никнейм";
		else if (!/^[a-zA-Z0-9._-]{3,30}$/.test(formData.nickname.trim())) {
			errors.nickname = "От 3 до 30 латинских букв, цифр, точек, дефисов или подчёркиваний";
		}
		if (!formData.fullName.trim()) errors.fullName = "Укажите имя и фамилию";
		return errors;
	}, [authCode, formData.fullName, formData.nickname, formData.telegramHandle]);

	const isValid =
		step === 1
			? !fieldErrors.telegramHandle
			: step === 2
				? !fieldErrors.authCode
				: !fieldErrors.nickname && !fieldErrors.fullName;

	const touchStep = () => {
		if (step === 1) setTouched((value) => ({ ...value, telegramHandle: true }));
		else if (step === 2) setTouched((value) => ({ ...value, authCode: true }));
		else setTouched((value) => ({ ...value, nickname: true, fullName: true }));
	};

	const goForward = () => {
		if (!isValid) return touchStep();
		setError("");
		setStep((step + 1) as 2 | 3);
	};

	const handleRegister = async () => {
		if (!isValid) return touchStep();
		setError("");
		try {
			const result = await api.register({
				telegramHandle: formData.telegramHandle.trim(),
				nickname: formData.nickname.trim(),
				fullName: formData.fullName.trim(),
				avatarUrl: formData.avatarUrl,
				country: formData.country.trim(),
				city: formData.city.trim(),
				bio: formData.bio.trim(),
				occupation: formData.occupation.trim(),
				company: formData.company.trim(),
				aboutClub: formData.aboutClub.trim(),
				clubOffers: formData.clubOffers,
				tags: formData.tags,
			});
			localStorage.setItem("token", result.token);
			onLogin(result.user);
			navigate("/");
		} catch (registrationError) {
			setError(
				registrationError instanceof Error ? registrationError.message : "Ошибка регистрации",
			);
		}
	};

	const handleAvatar = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = () => updateForm("avatarUrl", reader.result as string);
		reader.readAsDataURL(file);
	};

	const addTag = (event: React.KeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter" || !tagInput.trim()) return;
		event.preventDefault();
		if (!formData.tags.includes(tagInput.trim()))
			updateForm("tags", [...formData.tags, tagInput.trim()]);
		setTagInput("");
	};

	const toggleOffer = (offer: string) => {
		updateForm(
			"clubOffers",
			formData.clubOffers.includes(offer)
				? formData.clubOffers.filter((item) => item !== offer)
				: [...formData.clubOffers, offer],
		);
	};

	return (
		<div className="min-h-[calc(100vh-64px)] px-4 py-8 sm:py-12">
			<div
				className={`mx-auto w-full ${
					step === 3
						? "max-w-2xl rounded-2xl border border-north-100 bg-white p-5 shadow-xl sm:p-8"
						: "max-w-md rounded-2xl border border-north-100 bg-white p-5 shadow-xl sm:p-8"
				}`}
			>
				<header className={`mb-8 text-center ${step === 3 ? "sm:mb-10" : ""}`}>
					<h1 className="mb-2 font-serif text-3xl font-bold text-north-900">
						{step === 1
							? "Вступить в клуб"
							: step === 2
								? "Подтвердить Telegram"
								: "Расскажите о себе"}
					</h1>
					<p className="text-north-500">Шаг {step} из 3</p>
				</header>

				{error && (
					<div role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
						{error}
					</div>
				)}

				{step === 1 && (
					<div className="space-y-4">
						<Input
							label="Telegram"
							placeholder="username"
							required
							autoComplete="username"
							error={touched.telegramHandle ? fieldErrors.telegramHandle : undefined}
							onBlur={() => setTouched((value) => ({ ...value, telegramHandle: true }))}
							value={formData.telegramHandle}
							onChange={(event) => updateForm("telegramHandle", event.target.value)}
						/>
						<Button className="w-full" onClick={goForward} disabled={!isValid}>
							Получить код
						</Button>
					</div>
				)}

				{step === 2 && (
					<div className="space-y-4">
						<Input
							label="Код авторизации"
							placeholder="123456"
							required
							inputMode="numeric"
							maxLength={6}
							error={touched.authCode ? fieldErrors.authCode : undefined}
							onBlur={() => setTouched((value) => ({ ...value, authCode: true }))}
							value={authCode}
							onChange={(event) => setAuthCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
						/>
						<p className="-mt-2 text-xs text-north-500">Тестовый код: 123456</p>
						<Button className="w-full" onClick={goForward} disabled={!isValid}>
							Подтвердить код
						</Button>
						<button
							type="button"
							onClick={() => setStep(1)}
							className="min-h-11 w-full text-sm text-north-600 hover:underline"
						>
							Назад
						</button>
					</div>
				)}

				{step === 3 && (
					<div className="space-y-8">
						<p className="mx-auto max-w-lg text-center text-sm leading-6 text-north-500">
							Указывайте только проверенную информацию. Необязательные поля можно заполнить позже.
						</p>

						<div className="space-y-8">
							<div className="text-center">
								<label className="group inline-flex cursor-pointer flex-col items-center focus-within:outline-none">
									<span className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border border-dashed border-north-300 bg-north-50 transition-colors group-hover:border-north-500 group-focus-within:ring-2 group-focus-within:ring-north-500 group-focus-within:ring-offset-2">
										{formData.avatarUrl ? (
											<img
												src={formData.avatarUrl}
												alt="Предпросмотр фотографии"
												className="h-full w-full object-cover"
											/>
										) : (
											<Camera className="h-8 w-8 text-north-400" aria-hidden="true" />
										)}
									</span>
									<span className="mt-3 flex min-h-11 items-center text-sm font-medium text-north-700 group-hover:text-north-900">
										{formData.avatarUrl ? "Заменить фото" : "Добавить фото"}
									</span>
									<input type="file" accept="image/*" className="sr-only" onChange={handleAvatar} />
								</label>
							</div>

							<div className="space-y-8">
								<Section id="identity" icon={<UserRound size={20} />} title="Профиль">
									<div className="grid gap-x-5 sm:grid-cols-2">
										<div>
											<Input
												label="Никнейм *"
												placeholder="aiana"
												required
												autoComplete="nickname"
												error={touched.nickname ? fieldErrors.nickname : undefined}
												onBlur={() => setTouched((value) => ({ ...value, nickname: true }))}
												value={formData.nickname}
												onChange={(event) =>
													updateForm(
														"nickname",
														event.target.value.replace(/\s/g, "").toLowerCase(),
													)
												}
											/>
											<p className="-mt-3 mb-4 text-xs text-north-500">
												Адрес профиля: /people/{formData.nickname || "nickname"}
											</p>
										</div>
										<div>
											<Input
												label="Имя и фамилия *"
												placeholder="Айаана Петрова"
												required
												autoComplete="name"
												error={touched.fullName ? fieldErrors.fullName : undefined}
												onBlur={() => setTouched((value) => ({ ...value, fullName: true }))}
												value={formData.fullName}
												onChange={(event) => updateForm("fullName", event.target.value)}
											/>
										</div>
										<Input
											label="Страна"
											placeholder="Россия"
											autoComplete="country-name"
											value={formData.country}
											onChange={(event) => updateForm("country", event.target.value)}
										/>
										<Input
											label="Город"
											placeholder="Якутск"
											autoComplete="address-level2"
											value={formData.city}
											onChange={(event) => updateForm("city", event.target.value)}
										/>
									</div>
								</Section>

								<div className="space-y-8">
									<Section id="about" icon={<MessageCircle size={20} />} title="О себе">
										<TextAreaField
											id="bio"
											label="Био и ссылки"
											maxLength={500}
											value={formData.bio}
											onChange={(value) => updateForm("bio", value)}
											placeholder="Пара предложений о себе + ссылки на соцсети"
										/>
									</Section>

									<Section id="work" icon={<BriefcaseBusiness size={20} />} title="Работа и опыт">
										<div className="grid gap-x-5 sm:grid-cols-2">
											<Input
												label="Чем занимаетесь"
												placeholder="Продуктовый дизайнер"
												autoComplete="organization-title"
												value={formData.occupation}
												onChange={(event) => updateForm("occupation", event.target.value)}
											/>
											<Input
												label="Компания"
												placeholder="Название компании или проекта"
												autoComplete="organization"
												value={formData.company}
												onChange={(event) => updateForm("company", event.target.value)}
											/>
										</div>
										<label
											htmlFor="interests"
											className="mb-2 block text-sm font-medium text-north-700"
										>
											Интересы и экспертиза
										</label>
										<div className="mb-2 flex min-h-8 flex-wrap gap-2">
											{formData.tags.map((tag) => (
												<Tag
													key={tag}
													onRemove={() =>
														updateForm(
															"tags",
															formData.tags.filter((item) => item !== tag),
														)
													}
												>
													{tag}
												</Tag>
											))}
										</div>
										<input
											id="interests"
											className="min-h-11 w-full rounded-lg border border-north-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-north-400"
											placeholder="Например: продукты, дизайн, путешествия"
											value={tagInput}
											onKeyDown={addTag}
											onChange={(event) => setTagInput(event.target.value)}
										/>
										<p className="mt-1 text-xs text-north-500">Enter — добавить тему</p>
									</Section>
								</div>

								<Section id="club" icon={<HeartHandshake size={20} />} title="Для клуба">
									<TextAreaField
										id="about-club"
										label="Расскажите клубу о себе"
										maxLength={800}
										value={formData.aboutClub}
										onChange={(value) => updateForm("aboutClub", value)}
										placeholder="Чем занимаетесь сейчас и о чём мечтаете?"
									/>
									<fieldset className="mt-5">
										<legend className="text-sm font-medium text-north-700">
											Для клуба и людей я могу
										</legend>
										<div className="mt-3 flex flex-wrap gap-2">
											{OFFER_OPTIONS.map((offer) => {
												const selected = formData.clubOffers.includes(offer);
												return (
													<button
														key={offer}
														type="button"
														aria-pressed={selected}
														onClick={() => toggleOffer(offer)}
														className={`min-h-11 rounded-full border px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-north-500 ${selected ? "border-north-800 bg-north-800 text-white" : "border-north-200 text-north-700 hover:border-north-400"}`}
													>
														{offer}
													</button>
												);
											})}
										</div>
									</fieldset>
								</Section>

								<Button className="min-h-12 w-full" onClick={handleRegister} disabled={!isValid}>
									Завершить регистрацию
								</Button>
								<button
									type="button"
									onClick={() => setStep(2)}
									className="min-h-11 w-full text-sm text-north-600 hover:underline"
								>
									Назад
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default Register;
