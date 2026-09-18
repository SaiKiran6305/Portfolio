document.getElementById('year').textContent = new Date().getFullYear();

const progress = document.querySelector('.scroll-progress span');
const navLinks = [...document.querySelectorAll('nav a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];

function updatePageState() {
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
  const orderedSections = [...sections].sort((a, b) => a.offsetTop - b.offsetTop);
  const current = orderedSections.reduce((active, section) =>
    scrollY + 160 >= section.offsetTop ? section.id : active, 'home');
  navLinks.forEach(link => link.classList.toggle('active', link.hash === `#${current}`));
}

document.querySelectorAll('.reveal').forEach(element => element.classList.add('will-reveal'));
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.will-reveal').forEach(element => observer.observe(element));

addEventListener('scroll', updatePageState, { passive: true });
updatePageState();

const contactForm = document.getElementById('contact-form');
contactForm?.addEventListener('submit', async event => {
  event.preventDefault();
  const submitButton = contactForm.querySelector('.form-submit');
  const submitLabel = contactForm.querySelector('.submit-label');
  const formNote = document.getElementById('form-note');

  submitButton.disabled = true;
  submitLabel.textContent = 'Sending…';
  formNote.className = 'form-note';
  formNote.textContent = 'Sending your message securely…';

  try {
    const response = await fetch(contactForm.action, {
      method: 'POST',
      body: new FormData(contactForm),
      headers: { Accept: 'application/json' }
    });

    const result = await response.json().catch(() => ({}));
    const delivered = result.success === true || result.success === 'true';
    if (!response.ok || !delivered) {
      throw new Error(result.message || 'Message delivery failed');
    }

    contactForm.reset();
    formNote.className = 'form-note success';
    formNote.textContent = 'Thanks — your message was sent directly to my inbox.';
  } catch (error) {
    formNote.className = 'form-note error';
    formNote.textContent = error.message.includes('Activation')
      ? 'Message delivery is being activated. Please try again shortly.'
      : 'The message could not be sent. Please try again or use the email link beside this form.';
  } finally {
    submitButton.disabled = false;
    submitLabel.textContent = 'Send message';
  }
});
