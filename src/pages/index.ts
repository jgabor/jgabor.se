import { css, html } from "../lib/template";

const styles = css`
	* {
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	body {
		background-color: #000;
		color: #666;
		min-height: 100vh;
		font-size: clamp(1rem, 1rem + ((1.25 - 1) / (100 - 22.5) * (100vw - 22.5rem)), 1.25rem);
		font-size: 1rem;
		font-family: monospace;
		display: flex;
		flex-direction: column;
	}

	nav {
		padding: 1.5rem;
		display: flex;
		justify-content: center;
		gap: 2rem;
	}

	nav a,
	nav button {
		color: #444;
		text-decoration: none;
		transition: color 0.3s;
		background: none;
		border: none;
		font: inherit;
		cursor: pointer;
	}

	nav a:hover,
	nav button:hover {
		color: #888;
		text-decoration: underline;
	}

	nav a.glow {
		animation: glow 3s ease-in-out infinite;
	}

	@keyframes glow {
		0%,
		100% {
			color: #444;
			text-shadow: none;
		}
		50% {
			color: #fff;
			font-weight: 500;
			text-shadow: 0 0 6px rgba(255, 255, 255, 1);
		}
	}

	main {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.sith-code {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: flex-start;
		padding: 0 5vw;
		font-size: clamp(0.65rem, 2.8vw, 2rem);
		line-height: 1.5;
		transform: scale(0.94);
		animation: scale 3s forwards cubic-bezier(0.5, 1, 0.89, 1);
	}

	@keyframes scale {
		100% {
			transform: scale(1);
		}
	}

	.sith-code span {
		display: block;
		white-space: nowrap;
		opacity: 0;
		filter: blur(6px);
	}

	.sith-code span:nth-child(1) {
		animation: fade-in 1s 0s forwards cubic-bezier(0.1, 0, 0.5, 0);
	}
	.sith-code span:nth-child(2) {
		animation: fade-in 1s 3s forwards cubic-bezier(0.1, 0, 0.5, 0);
	}
	.sith-code span:nth-child(3) {
		animation: fade-in 1s 6s forwards cubic-bezier(0.1, 0, 0.5, 0);
	}
	.sith-code span:nth-child(4) {
		animation: fade-in 1s 8s forwards cubic-bezier(0.1, 0, 0.5, 0);
	}
	.sith-code span:nth-child(5) {
		animation: fade-in 1s 10s forwards cubic-bezier(0.1, 0, 0.5, 0);
	}
	.sith-code span:nth-child(6) {
		animation: fade-in 1s 12s forwards cubic-bezier(0.1, 0, 0.5, 0);
	}
	.sith-code span:nth-child(7) {
		animation: fade-in 1s 16s forwards cubic-bezier(0.1, 0, 0.5, 0);
	}

	@keyframes fade-in {
		100% {
			opacity: 1;
			filter: blur(0);
		}
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		opacity: 0;
		visibility: hidden;
		transition:
			opacity 0.3s,
			visibility 0.3s;
	}

	.modal-overlay.open {
		opacity: 1;
		visibility: visible;
	}

	.modal {
		background: #0a0a0a;
		border: 1px solid #333;
		padding: 2rem;
		width: 90%;
		max-width: 400px;
		transform: scale(0.9);
		transition: transform 0.3s;
	}

	.modal-overlay.open .modal {
		transform: scale(1);
	}

	.modal h2 {
		color: #666;
		font-size: 1rem;
		font-weight: normal;
		margin-bottom: 1.5rem;
	}

	.modal label {
		display: block;
		color: #444;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.modal input,
	.modal textarea {
		width: 100%;
		background: #000;
		border: 1px solid #333;
		color: #888;
		padding: 0.75rem;
		font: inherit;
		margin-bottom: 1rem;
		transition: border-color 0.3s;
	}

	.modal input:focus,
	.modal textarea:focus {
		outline: none;
		border-color: #555;
	}

	.modal textarea {
		min-height: 120px;
		resize: vertical;
	}

	.modal-buttons {
		display: flex;
		gap: 1rem;
		justify-content: flex-end;
	}

	.modal button {
		background: none;
		border: 1px solid #333;
		color: #666;
		padding: 0.5rem 1rem;
		font: inherit;
		cursor: pointer;
		transition:
			border-color 0.3s,
			color 0.3s;
	}

	.modal button:hover {
		border-color: #555;
		color: #888;
	}

	.modal button[type='submit'] {
		border-color: #444;
	}

	.modal button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.modal .status {
		font-size: 0.875rem;
		margin-bottom: 1rem;
		min-height: 1.25rem;
	}

	.modal .status.error {
		color: #a44;
	}
	.modal .status.success {
		color: #4a4;
	}
`;

export default html`<!DOCTYPE html>
	<html lang="en">
		<head>
			<meta charset="UTF-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			<meta name="description" content="Jonathan Gabor" />
			<link rel="icon" href="data:," />
			<title>jonathan at jgabor dot se</title>
			<style>
				${styles}
			</style>
		</head>
		<body>
			<nav>
				<a href="/cv" class="glow">cv</a>
				<button id="email-btn">email</button>
				<a href="https://github.com/jgabor">code</a>
			</nav>
			<main>
				<p class="sith-code">
					<span>Peace is a lie.</span>
					<span>There is only passion.</span>
					<span>Through passion, I gain strength.</span>
					<span>Through strength, I gain power.</span>
					<span>Through power, I gain victory.</span>
					<span>Through victory, my chains are broken.</span>
					<span>The Force shall set me free.</span>
				</p>
			</main>
			<div class="modal-overlay" id="modal">
				<form class="modal" id="contact-form">
					<h2>send a message</h2>
					<div class="status" id="status"></div>
					<label for="from">from</label>
					<input type="email" id="from" name="from" required placeholder="your@email.com" />
					<label for="message">message</label>
					<textarea id="message" name="message" required placeholder="..."></textarea>
					<div class="modal-buttons">
						<button type="button" id="close-btn">cancel</button>
						<button type="submit" id="send-btn">send</button>
					</div>
				</form>
			</div>
			<script>
				const modal = document.getElementById('modal');
				const form = document.getElementById('contact-form');
				const status = document.getElementById('status');
				const sendBtn = document.getElementById('send-btn');

				document.getElementById('email-btn').onclick = () => modal.classList.add('open');
				document.getElementById('close-btn').onclick = () => modal.classList.remove('open');
				modal.onclick = (e) => {
					if (e.target === modal) modal.classList.remove('open');
				};

				form.onsubmit = async (e) => {
					e.preventDefault();
					sendBtn.disabled = true;
					status.className = 'status';
					status.textContent = 'sending...';

					try {
						const res = await fetch('/contact', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							body: JSON.stringify({
								from: form.from.value,
								message: form.message.value,
							}),
						});

						if (res.ok) {
							status.className = 'status success';
							status.textContent = 'sent';
							form.reset();
							setTimeout(() => modal.classList.remove('open'), 1500);
						} else {
							throw new Error(await res.text());
						}
					} catch (err) {
						status.className = 'status error';
						status.textContent = err.message || 'failed to send';
					} finally {
						sendBtn.disabled = false;
					}
				};
			</script>
		</body>
	</html>`;
