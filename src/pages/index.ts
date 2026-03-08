import { css, html } from "../lib/template";

const styles = css`
	*,
	*::before,
	*::after {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	:root {
		--card: hsl(0 0% 3%);
		--border: hsl(0 0% 12%);
		--muted: hsl(0 0% 50%);
		--accent: hsl(187 72% 55%);
		--accent-teal: hsl(168 65% 45%);
		--accent-violet: hsl(263 70% 58%);
		--accent-emerald: hsl(155 60% 45%);
		--accent-sky: hsl(199 89% 55%);
		--secondary: hsl(0 0% 8%);
		--secondary-fg: hsl(0 0% 70%);
	}

	html {
		scroll-behavior: smooth;
		scroll-padding-top: 5rem;
	}

	body {
		background: #000;
		color: #fff;
		font-family: 'Inter', sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}

	/* Nav */
	nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 50;
		border-bottom: 1px solid hsl(0 0% 12% / 0.5);
		background: rgba(0, 0, 0, 0.8);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}

	.nav-inner {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
	}

	.nav-logo {
		background: none;
		border: none;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: #fff;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.nav-logo:hover {
		opacity: 0.6;
	}

	.nav-links {
		display: flex;
		gap: 1.5rem;
	}

	.nav-links a {
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--muted);
		text-decoration: none;
		transition: color 0.2s;
	}

	.nav-links a:hover {
		color: #fff;
	}

	/* Hero */
	.hero {
		position: relative;
		min-height: 100vh;
		overflow: hidden;
		padding-top: 5rem;
	}

	.hero-name {
		position: absolute;
		left: 0;
		top: 8vh;
		padding: 0 1rem;
		pointer-events: none;
		user-select: none;
	}

	.hero-name h1 {
		font-family: 'Inter', sans-serif;
		font-size: 15vw;
		font-weight: 900;
		text-transform: uppercase;
		line-height: 0.85;
		letter-spacing: -0.04em;
		color: #fff;
	}

	.hero-content {
		position: relative;
		max-width: 1100px;
		margin: 0 auto;
		min-height: calc(100vh - 5rem);
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: 0 1.5rem 4rem;
	}

	.hero-info {
		position: relative;
		z-index: 10;
		max-width: 28rem;
	}

	.hero-tagline {
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--accent);
	}

	.hero-bio {
		font-size: 1.125rem;
		line-height: 1.625;
		color: rgba(255, 255, 255, 0.8);
		margin-top: 0.75rem;
	}

	.hero-location {
		font-family: 'Space Mono', monospace;
		font-size: 0.875rem;
		color: var(--muted);
		margin-top: 1.5rem;
	}

	.hero-links {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-top: 1.75rem;
	}

	.hero-links a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
		text-decoration: none;
		transition: color 0.2s;
	}

	.hero-links a:hover {
		color: #fff;
	}

	.hero-photo {
		position: relative;
		z-index: 10;
		margin-top: 2.5rem;
	}

	.photo-wrap {
		position: relative;
	}

	.photo-wrap img {
		display: block;
		width: 260px;
		height: 320px;
		object-fit: cover;
		object-position: top;
	}

	.photo-grad-t {
		position: absolute;
		inset: 0;
		background: linear-gradient(to top, #000, transparent);
	}

	.photo-grad-l {
		position: absolute;
		inset: 0;
		background: linear-gradient(to right, rgba(0, 0, 0, 0.6), transparent);
	}

	/* Section shared */
	.section-num {
		position: absolute;
		left: 1rem;
		top: 2rem;
		font-family: 'Space Mono', monospace;
		font-size: clamp(6rem, 20vw, 18rem);
		font-weight: 700;
		opacity: 0.03;
		line-height: 1;
		user-select: none;
		pointer-events: none;
	}

	.section-label {
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.2em;
		color: var(--muted);
	}

	.section-heading {
		margin-top: 0.75rem;
		font-size: 1.875rem;
		font-weight: 800;
		letter-spacing: -0.025em;
		color: #fff;
	}

	.section-sub {
		margin-top: 0.75rem;
		font-size: 1.125rem;
		color: var(--muted);
	}

	/* Projects */
	.projects {
		position: relative;
		padding: 6rem 0;
	}

	.projects-header {
		position: relative;
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem;
		margin-bottom: 3rem;
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
	}

	.scroll-arrows {
		display: none;
		align-items: center;
		gap: 0.5rem;
	}

	.scroll-arrows button {
		border: 1px solid var(--border);
		background: none;
		padding: 0.5rem;
		color: var(--muted);
		cursor: pointer;
		transition: all 0.2s;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.scroll-arrows button:hover:not(:disabled) {
		border-color: rgba(255, 255, 255, 0.3);
		color: #fff;
	}

	.scroll-arrows button:disabled {
		opacity: 0.2;
		cursor: default;
	}

	.scroll-strip {
		display: flex;
		gap: 1rem;
		overflow-x: auto;
		padding: 0 1.5rem 1rem;
		scroll-snap-type: x mandatory;
		scrollbar-width: none;
		-ms-overflow-style: none;
	}

	.scroll-strip::-webkit-scrollbar {
		display: none;
	}

	.scroll-spacer {
		width: 0;
		flex-shrink: 0;
	}

	.scroll-spacer-end {
		width: 1.5rem;
		flex-shrink: 0;
	}

	.project-card {
		flex-shrink: 0;
		width: 300px;
		scroll-snap-align: start;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		border: 1px solid var(--border);
		background: var(--card);
		padding: 1.5rem;
		transition: all 0.2s;
		text-decoration: none;
		color: inherit;
	}

	.project-card:hover {
		border-color: rgba(255, 255, 255, 0.2);
		background: rgba(8, 8, 8, 0.8);
	}

	.project-card-top {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
	}

	.project-card h3 {
		font-size: 1.25rem;
		font-weight: 700;
		color: #fff;
	}

	.project-card .ext-icon {
		color: var(--muted);
		opacity: 0;
		transition: opacity 0.2s;
	}

	.project-card:hover .ext-icon {
		opacity: 1;
	}

	.project-type {
		margin-top: 0.5rem;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
	}

	.project-desc {
		margin-top: 1rem;
		font-size: 1rem;
		line-height: 1.625;
		color: var(--muted);
	}

	.project-tags {
		margin-top: 1.5rem;
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.project-tags span {
		border: 1px solid var(--border);
		background: var(--secondary);
		padding: 0.25rem 0.625rem;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--secondary-fg);
	}

	.c-accent {
		color: var(--accent);
	}

	.c-teal {
		color: var(--accent-teal);
	}

	.c-violet {
		color: var(--accent-violet);
	}

	.c-emerald {
		color: var(--accent-emerald);
	}

	.c-sky {
		color: var(--accent-sky);
	}

	.mobile-hint {
		margin-top: 1rem;
		text-align: center;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		color: rgba(128, 128, 128, 0.5);
	}

	/* Experience */
	.experience {
		position: relative;
		padding: 6rem 0;
	}

	.exp-inner {
		position: relative;
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.strengths {
		display: grid;
		gap: 1rem;
		margin-bottom: 5rem;
	}

	.strength-card {
		border: 1px solid var(--border);
		background: var(--card);
		padding: 1.5rem;
	}

	.strength-card h3 {
		font-family: 'Space Mono', monospace;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--accent);
	}

	.strength-card p {
		margin-top: 0.75rem;
		font-size: 1rem;
		line-height: 1.625;
		color: var(--muted);
	}

	.skills-section {
		margin-bottom: 5rem;
	}

	.skills-wrap {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.skills-wrap span {
		border: 1px solid var(--border);
		padding: 0.375rem 0.75rem;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--secondary-fg);
	}

	.jobs {
		display: flex;
		flex-direction: column;
		gap: 4rem;
	}

	.job-header {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}

	.job-header h3 {
		font-size: 1.5rem;
		font-weight: 700;
		color: #fff;
	}

	.job-header span {
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
	}

	.job-roles {
		border-left: 1px solid var(--border);
		padding-left: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.role {
		display: grid;
		gap: 0.5rem;
	}

	.role-meta .role-period {
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--muted);
	}

	.role-meta .role-location {
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		color: rgba(128, 128, 128, 0.6);
	}

	.role-body h4 {
		font-size: 1rem;
		font-weight: 600;
		color: #fff;
	}

	.role-body p {
		margin-top: 0.5rem;
		font-size: 1rem;
		line-height: 1.625;
		color: var(--muted);
	}

	/* Contact */
	.contact {
		position: relative;
		padding: 6rem 0;
	}

	.contact-inner {
		position: relative;
		max-width: 1100px;
		margin: 0 auto;
		padding: 0 1.5rem;
	}

	.contact-grid {
		display: grid;
		gap: 4rem;
	}

	.contact-form {
		max-width: 32rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.contact-form label {
		display: block;
		margin-bottom: 0.5rem;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: var(--muted);
	}

	.contact-form input,
	.contact-form textarea {
		width: 100%;
		border: 1px solid var(--border);
		background: #000;
		padding: 0.75rem 1rem;
		font-size: 1rem;
		font-family: 'Inter', sans-serif;
		color: #fff;
		transition: border-color 0.2s;
	}

	.contact-form input::placeholder,
	.contact-form textarea::placeholder {
		color: rgba(128, 128, 128, 0.4);
	}

	.contact-form input:focus,
	.contact-form textarea:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.3);
	}

	.contact-form textarea {
		resize: none;
		min-height: 140px;
	}

	.submit-btn {
		align-self: flex-start;
		border: 1px solid #fff;
		background: #fff;
		padding: 0.75rem 2rem;
		font-family: 'Space Mono', monospace;
		font-size: 0.875rem;
		text-transform: uppercase;
		letter-spacing: 0.15em;
		color: #000;
		cursor: pointer;
		transition: all 0.2s;
	}

	.submit-btn:hover {
		background: transparent;
		color: #fff;
	}

	.submit-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.footer {
		margin-top: 6rem;
		border-top: 1px solid var(--border);
		padding-top: 2rem;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 1.5rem;
	}

	.footer a {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-family: 'Space Mono', monospace;
		font-size: 0.875rem;
		color: var(--muted);
		text-decoration: none;
		transition: color 0.2s;
	}

	.footer a:hover {
		color: #fff;
	}

	.footer .lang {
		margin-left: auto;
		font-family: 'Space Mono', monospace;
		font-size: 0.75rem;
		color: rgba(128, 128, 128, 0.4);
	}

	/* Fade-in animation */
	.fade-in {
		opacity: 0;
		transform: translateY(24px);
		transition:
			opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1),
			transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
	}

	.fade-in.visible {
		opacity: 1;
		transform: translateY(0);
	}

	/* Responsive */
	@media (min-width: 768px) {
		.nav-inner {
			padding: 1rem 2rem;
		}

		.nav-links {
			gap: 2rem;
		}

		.hero-name {
			top: 12vh;
			padding: 0 2rem;
		}

		.hero-name h1 {
			font-size: 13vw;
		}

		.hero-content {
			flex-direction: row;
			align-items: flex-end;
			justify-content: space-between;
			padding: 0 2rem 6rem;
		}

		.hero-bio {
			font-size: 1.25rem;
		}

		.hero-photo {
			margin-top: 0;
		}

		.photo-wrap img {
			width: 320px;
			height: 420px;
		}

		.photo-grad-l {
			background: linear-gradient(to right, rgba(0, 0, 0, 0.4), transparent);
		}

		.section-num {
			left: 2rem;
		}

		.section-heading {
			font-size: 2.25rem;
		}

		.projects {
			padding: 9rem 0;
		}

		.projects-header {
			padding: 0 2rem;
			margin-bottom: 4rem;
		}

		.scroll-arrows {
			display: flex;
		}

		.scroll-strip {
			gap: 1.25rem;
			padding: 0 2rem 1rem;
		}

		.scroll-spacer {
			width: calc((100vw - 1100px) / 2);
		}

		.scroll-spacer-end {
			width: calc((100vw - 1100px) / 2);
		}

		.project-card {
			width: 340px;
			min-height: 380px;
		}

		.mobile-hint {
			display: none;
		}

		.experience {
			padding: 9rem 0;
		}

		.exp-inner {
			padding: 0 2rem;
		}

		.strengths {
			grid-template-columns: repeat(3, 1fr);
		}

		.job-roles {
			padding-left: 2.5rem;
		}

		.role {
			grid-template-columns: 200px 1fr;
		}

		.contact {
			padding: 9rem 0;
		}

		.contact-inner {
			padding: 0 2rem;
		}

		.contact-grid {
			grid-template-columns: 200px 1fr;
		}
	}
`;

export default html`<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="description" content="Jonathan Gabor — Product Owner and builder based in Malm&ouml;, Sweden." />
		<link rel="icon" href="/favicon.ico" />
		<title>Jonathan Gabor</title>
		<link rel="preconnect" href="https://fonts.googleapis.com" />
		<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
		<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet" />
		<style>
			${styles}
		</style>
	</head>
	<body>
		<!-- Navigation -->
		<nav>
			<div class="nav-inner">
				<button class="nav-logo" onclick="window.scrollTo({top:0,behavior:'smooth'})">JG</button>
				<div class="nav-links">
					<a href="#projects">Projects</a>
					<a href="#experience">Experience</a>
					<a href="#contact">Contact</a>
				</div>
			</div>
		</nav>

		<!-- Hero -->
		<section class="hero">
			<div class="hero-name">
				<h1>Jonathan<br />Gabor</h1>
			</div>
			<div class="hero-content">
				<div class="hero-info">
					<p class="hero-tagline">Speaks code, ships product.</p>
					<p class="hero-bio">
						I bridge the gap between product vision and engineering
						execution &mdash; building tools, shipping platforms, and
						improving things 1% every day.
					</p>
					<p class="hero-location">Malm&ouml;, Sweden</p>
					<div class="hero-links">
						<a href="https://github.com/jgabor" target="_blank" rel="noopener noreferrer">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
							GitHub
						</a>
						<a href="https://linkedin.com/in/jgabor" target="_blank" rel="noopener noreferrer">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
							LinkedIn
						</a>
						<a href="/CV-Jonathan_Gabor.pdf">
							<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
							CV
						</a>
					</div>
				</div>
				<div class="hero-photo">
					<div class="photo-wrap">
						<div class="photo-grad-t"></div>
						<div class="photo-grad-l"></div>
						<img src="/jgabor.jpg" alt="Jonathan Gabor" loading="eager" />
					</div>
				</div>
			</div>
		</section>

		<!-- Projects -->
		<section class="projects" id="projects">
			<div class="section-num">01</div>
			<div class="projects-header">
				<div>
					<p class="section-label">Projects</p>
					<h2 class="section-heading">Things I've built</h2>
					<p class="section-sub" style="max-width:28rem">
						Currently deep in AI-assisted development &mdash; the rabbit hole goes further than expected.
					</p>
				</div>
				<div class="scroll-arrows">
					<button id="scroll-left" disabled aria-label="Scroll left">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
					</button>
					<button id="scroll-right" aria-label="Scroll right">
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
					</button>
				</div>
			</div>
			<div class="scroll-strip" id="scroll-strip">
				<div class="scroll-spacer"></div>
				<a href="https://github.com/jgabor" target="_blank" rel="noopener noreferrer" class="project-card">
					<div>
						<div class="project-card-top">
							<h3>Leda</h3>
							<svg class="ext-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
						</div>
						<p class="project-type c-accent">CLI / MCP</p>
						<p class="project-desc">A dependency-graph context isolator for LLM tools. Parses codebases with tree-sitter, builds a directed dependency graph, then traces only the files relevant to a given prompt &mdash; deterministic graph traversal instead of RAG, cutting token usage by 70%+.</p>
					</div>
					<div class="project-tags">
						<span>Go</span>
						<span>tree-sitter</span>
					</div>
				</a>
				<a href="https://github.com/jgabor" target="_blank" rel="noopener noreferrer" class="project-card">
					<div>
						<div class="project-card-top">
							<h3>Vrida</h3>
							<svg class="ext-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
						</div>
						<p class="project-type c-sky">Skill</p>
						<p class="project-desc">An OpenCode skill that assembles single-file HTML rigs with controls, live preview, and copyable prompt output. Visually tweak design tokens, architecture diagrams, and document reviews.</p>
					</div>
					<div class="project-tags">
						<span>OpenCode</span>
						<span>HTML5</span>
						<span>TypeScript</span>
					</div>
				</a>
				<a href="https://github.com/jgabor" target="_blank" rel="noopener noreferrer" class="project-card">
					<div>
						<div class="project-card-top">
							<h3>LFG (Let's F*ing Go)</h3>
							<svg class="ext-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
						</div>
						<p class="project-type c-violet">Plugin</p>
						<p class="project-desc">A workflow engine plugin for OpenCode that turns high-level objectives into deterministic delivery loops across research, planning, coding, review, and docs. Say "go build the feature" and get autonomous momentum with real guardrails.</p>
					</div>
					<div class="project-tags">
						<span>OpenCode</span>
						<span>TypeScript</span>
						<span>SQLite</span>
					</div>
				</a>
				<a href="https://github.com/jgabor" target="_blank" rel="noopener noreferrer" class="project-card">
					<div>
						<div class="project-card-top">
							<h3>Finsliparn</h3>
							<svg class="ext-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
						</div>
						<p class="project-type c-emerald">MCP</p>
						<p class="project-desc">An MCP server that turns single-shot LLM coding into a multi-attempt refinement loop. Runs the test suite after each iteration, feeds failures back as structured directives, and picks the best passing solution using git worktrees.</p>
					</div>
					<div class="project-tags">
						<span>TypeScript</span>
						<span>Git</span>
					</div>
				</a>
				<a href="https://github.com/jgabor" target="_blank" rel="noopener noreferrer" class="project-card">
					<div>
						<div class="project-card-top">
							<h3>Spela</h3>
							<svg class="ext-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
						</div>
						<p class="project-type c-accent">Desktop / TUI / CLI</p>
						<p class="project-desc">A Linux gaming optimization tool that manages DLSS/DLL versions and per-game profiles for Steam/Proton games. Handles GPU/CPU tuning, HDR setup, and launch configuration.</p>
					</div>
					<div class="project-tags">
						<span>Go</span>
						<span>Svelte</span>
						<span>Wails</span>
					</div>
				</a>
				<a href="https://github.com/jgabor" target="_blank" rel="noopener noreferrer" class="project-card">
					<div>
						<div class="project-card-top">
							<h3>Utforskarn</h3>
							<svg class="ext-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
						</div>
						<p class="project-type c-accent">Desktop / Web</p>
						<p class="project-desc">A local-first research tool for organizing topics into projects, with AI-powered auto-tagging and related-topic discovery. Write markdown notes, and an LLM analyzes them to surface connections you missed.</p>
					</div>
					<div class="project-tags">
						<span>Svelte 5</span>
						<span>Tailwind CSS</span>
					</div>
				</a>
				<a href="https://github.com/jgabor" target="_blank" rel="noopener noreferrer" class="project-card">
					<div>
						<div class="project-card-top">
							<h3>Signalspanarn</h3>
							<svg class="ext-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
						</div>
						<p class="project-type c-accent">CLI / TUI</p>
						<p class="project-desc">CLI and TUI that aggregates signals from Hacker News, GitHub, arXiv, Exa, and Kagi, then ranks and summarizes them so I can keep up with what's actually happening in AI without drowning in noise.</p>
					</div>
					<div class="project-tags">
						<span>Python</span>
						<span>Textual</span>
						<span>SQLite</span>
					</div>
				</a>
				<a href="https://github.com/jgabor" target="_blank" rel="noopener noreferrer" class="project-card">
					<div>
						<div class="project-card-top">
							<h3>Tuta</h3>
							<svg class="ext-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
						</div>
						<p class="project-type c-teal">CLI</p>
						<p class="project-desc">A tiny CLI tool that plays synthesized notification tones for scripts and build pipelines. Each sound is designed around music theory principles &mdash; interval quality, pitch contour, waveform choice &mdash; so they're immediately recognizable without being annoying.</p>
					</div>
					<div class="project-tags">
						<span>Go</span>
					</div>
				</a>
				<div class="scroll-spacer-end"></div>
			</div>
			<div class="mobile-hint">Swipe to see more &rarr;</div>
		</section>

		<!-- Experience -->
		<section class="experience" id="experience">
			<div class="section-num">02</div>
			<div class="exp-inner">
				<div style="margin-bottom:4rem">
					<p class="section-label">Experience</p>
					<h2 class="section-heading">15+ years building products</h2>
					<p class="section-sub" style="max-width:32rem">
						I am relentless about creating intuitive and simple products in a complex and technological environment. My opinion changes with new information.
					</p>
				</div>

				<!-- Strengths -->
				<div class="strengths">
					<div class="strength-card fade-in">
						<h3>Systems Thinking</h3>
						<p>Connects immediate decisions to long-term outcomes. Sees several steps ahead without losing sight of today.</p>
					</div>
					<div class="strength-card fade-in">
						<h3>Team Enabler</h3>
						<p>Leads by enabling others &mdash; aligning teams toward a shared north star without needing formal authority.</p>
					</div>
					<div class="strength-card fade-in">
						<h3>Quick Study</h3>
						<p>Active listener with high-bandwidth information intake. New concepts stick quickly.</p>
					</div>
				</div>

				<!-- Skills -->
				<div class="skills-section fade-in">
					<p class="section-label" style="margin-bottom:1rem">Skills</p>
					<div class="skills-wrap">
						<span>Product Strategy</span>
						<span>Product Vision</span>
						<span>Product Roadmap</span>
						<span>Platform Engineering</span>
						<span>Artificial Intelligence</span>
						<span>Developer Experience</span>
						<span>Software Development Lifecycle</span>
						<span>Infrastructure-as-Code</span>
						<span>Backlog Management</span>
						<span>User Research</span>
						<span>Cross-functional Leadership</span>
						<span>Agile Methodologies</span>
					</div>
				</div>

				<!-- Work History -->
				<div class="jobs">
					<!-- IKEA -->
					<div class="fade-in">
						<div class="job-header">
							<h3>IKEA</h3>
							<span>3 years 11 months</span>
						</div>
						<div class="job-roles">
							<div class="role">
								<div class="role-meta">
									<p class="role-period">May 2024 &mdash; Present</p>
									<p class="role-location">Malm&ouml;</p>
								</div>
								<div class="role-body">
									<h4>Product Owner, Operational Intelligence</h4>
									<p>Product Owner for two teams, responsible for synthetic monitoring and software observability capabilities that underpin critical customer flows across IKEA.com and in-store experiences. Collaborated closely with software engineers during IKEA's migration from Akamai to Cloudflare. Established ways of working aligned with Ingka's product management strategy. Defined OKRs and product taxonomy.</p>
								</div>
							</div>
							<div class="role">
								<div class="role-meta">
									<p class="role-period">Feb 2022 &mdash; Apr 2024</p>
									<p class="role-location">Malm&ouml;</p>
								</div>
								<div class="role-body">
									<h4>Product Owner, Data Enablement Technology</h4>
									<p>Defined the product vision and initiated a centralized data platform from the ground up, recruiting the founding engineering team. What started as one team has since grown into multiple teams covering data governance, quality, and product development &mdash; forming the foundation of IKEA's modernized data infrastructure.</p>
								</div>
							</div>
						</div>
					</div>

					<!-- UpCloud -->
					<div class="fade-in">
						<div class="job-header">
							<h3>UpCloud</h3>
							<span>6 years</span>
						</div>
						<div class="job-roles">
							<div class="role">
								<div class="role-meta">
									<p class="role-period">Dec 2018 &mdash; Dec 2021</p>
									<p class="role-location">Finland</p>
								</div>
								<div class="role-body">
									<h4>Head of Data &amp; Product Owner, Internal Tools</h4>
									<p>Built and led the Data team responsible for data warehousing, BI, and internal tooling. Created an in-house CRM and BI platform. Stack: PostgreSQL, TimescaleDB, Kafka, Python, Golang.</p>
								</div>
							</div>
							<div class="role">
								<div class="role-meta">
									<p class="role-period">Jan 2016 &mdash; Dec 2018</p>
									<p class="role-location">Finland</p>
								</div>
								<div class="role-body">
									<h4>Head of Marketing</h4>
									<p>Led a complete brand overhaul. Directed the redesign of UpCloud.com centering community tutorials and open-source contributions. Developed a data-informed advertising strategy executed entirely in-house. Achieved positive ROI with a small team.</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Cloud Royale -->
					<div class="fade-in">
						<div class="job-header">
							<h3>Cloud Royale</h3>
							<span>3 years 8 months</span>
						</div>
						<div class="job-roles">
							<div class="role">
								<div class="role-meta">
									<p class="role-period">May 2012 &mdash; Dec 2015</p>
								</div>
								<div class="role-body">
									<h4>Founder &amp; Product Manager</h4>
									<p>Took Cloud Royale from idea to launched product with a small team. Owned brand strategy, led engineering projects, and drove sales and marketing.</p>
								</div>
							</div>
						</div>
					</div>

					<!-- FS Data -->
					<div class="fade-in">
						<div class="job-header">
							<h3>FS Data</h3>
							<span>1 year 7 months</span>
						</div>
						<div class="job-roles">
							<div class="role">
								<div class="role-meta">
									<p class="role-period">Oct 2011 &mdash; Apr 2013</p>
								</div>
								<div class="role-body">
									<h4>Head of Shared Hosting</h4>
									<p>Responsible for customer service, development, marketing, and reselling. Launched a reseller program that achieved sustained growth beyond tenure.</p>
								</div>
							</div>
						</div>
					</div>

					<!-- Surftown -->
					<div class="fade-in">
						<div class="job-header">
							<h3>Surftown A/S</h3>
							<span>4 years 7 months</span>
						</div>
						<div class="job-roles">
							<div class="role">
								<div class="role-meta">
									<p class="role-period">Apr 2009 &mdash; Sep 2011</p>
								</div>
								<div class="role-body">
									<h4>Product Coordinator</h4>
									<p>Managed product development &mdash; packaging, pricing, research &mdash; and marketing execution against roadmap.</p>
								</div>
							</div>
							<div class="role">
								<div class="role-meta">
									<p class="role-period">May 2007 &mdash; Mar 2009</p>
								</div>
								<div class="role-body">
									<h4>Communications Advisor</h4>
									<p>Marketing communications: copywriting, corporate blogging, digital advertising, press interviews, and customer service.</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Contact -->
		<section class="contact" id="contact">
			<div class="section-num">03</div>
			<div class="contact-inner">
				<div class="contact-grid">
					<div>
						<p class="section-label">Contact</p>
						<h2 class="section-heading">Get in touch</h2>
					</div>
					<form class="contact-form fade-in" id="contact-form">
						<div>
							<label for="contact-email">Email</label>
							<input type="email" id="contact-email" name="from" required placeholder="you@company.com" />
						</div>
						<div>
							<label for="contact-message">Message</label>
							<textarea id="contact-message" name="message" rows="5" required placeholder="What's on your mind?"></textarea>
						</div>
						<button type="submit" class="submit-btn" id="submit-btn">Send</button>
					</form>
				</div>
				<div class="footer">
					<a href="https://github.com/jgabor" target="_blank" rel="noopener noreferrer">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
						GitHub
					</a>
					<a href="https://linkedin.com/in/jgabor" target="_blank" rel="noopener noreferrer">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
						LinkedIn
					</a>
					<a href="/CV-Jonathan_Gabor.pdf">
						<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M12 18v-6"/><path d="m9 15 3 3 3-3"/></svg>
						Download CV
					</a>
					<span class="lang">Swedish &middot; English</span>
				</div>
			</div>
		</section>

		<script>
			/* Scroll fade-in with IntersectionObserver */
			var observer = new IntersectionObserver(function (entries) {
				entries.forEach(function (entry) {
					if (entry.isIntersecting) {
						entry.target.classList.add('visible');
						observer.unobserve(entry.target);
					}
				});
			}, { threshold: 0.1 });

			document.querySelectorAll('.fade-in').forEach(function (el) {
				observer.observe(el);
			});

			/* Project carousel scroll arrows */
			var strip = document.getElementById('scroll-strip');
			var leftBtn = document.getElementById('scroll-left');
			var rightBtn = document.getElementById('scroll-right');

			function updateScrollButtons() {
				if (!strip) return;
				leftBtn.disabled = strip.scrollLeft <= 10;
				rightBtn.disabled = strip.scrollLeft >= strip.scrollWidth - strip.clientWidth - 10;
			}

			if (strip) {
				strip.addEventListener('scroll', updateScrollButtons, { passive: true });
				updateScrollButtons();
			}

			if (leftBtn) {
				leftBtn.addEventListener('click', function () {
					strip.scrollBy({ left: -340, behavior: 'smooth' });
				});
			}

			if (rightBtn) {
				rightBtn.addEventListener('click', function () {
					strip.scrollBy({ left: 340, behavior: 'smooth' });
				});
			}

			/* Contact form */
			var contactForm = document.getElementById('contact-form');
			var submitBtn = document.getElementById('submit-btn');

			if (contactForm) {
				contactForm.addEventListener('submit', function (e) {
					e.preventDefault();
					submitBtn.disabled = true;
					submitBtn.textContent = 'Sending...';

					var emailInput = document.getElementById('contact-email');
					var messageInput = document.getElementById('contact-message');

					fetch('/contact', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({
							from: emailInput.value,
							message: messageInput.value
						})
					}).then(function (res) {
						if (!res.ok) throw new Error('Failed');
						submitBtn.textContent = 'Sent';
						contactForm.reset();
						setTimeout(function () {
							submitBtn.textContent = 'Send';
							submitBtn.disabled = false;
						}, 3000);
					}).catch(function () {
						submitBtn.textContent = 'Error';
						setTimeout(function () {
							submitBtn.textContent = 'Send';
							submitBtn.disabled = false;
						}, 3000);
					});
				});
			}
		</script>
	</body>
</html>`;
