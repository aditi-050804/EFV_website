/**
 * EFV Contact JS - Form Validation & Submission
 */

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button');
            const originalText = btn.textContent;
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            btn.disabled = true;
            btn.textContent = 'Transmitting...';

            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/contacts`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name,
                        email,
                        message,
                        purpose: 'EFV Website Contact Form'
                    })
                });

                if (response.ok) {
                    formMessage.textContent = 'Success! Your resonance has been received by the ecosystem.';
                    formMessage.classList.add('success');
                    btn.textContent = 'Message Sent';
                    contactForm.reset();
                } else {
                    throw new Error('Transmission failed');
                }
            } catch (err) {
                console.error('API Error:', err);
                formMessage.textContent = 'Transmission Interrupted. Please check your connection.';
                formMessage.style.color = '#ff4757';
            } finally {
                setTimeout(() => {
                    formMessage.textContent = '';
                    formMessage.classList.remove('success');
                    btn.disabled = false;
                    btn.textContent = originalText;
                }, 5000);
            }
        });
    }

    // Waitlist Form Handling
    const waitlistBtn = document.getElementById('waitlist-btn');
    const waitlistEmail = document.getElementById('waitlist-email');
    const waitlistMessage = document.getElementById('waitlist-message');

    // Initialize EmailJS with Public Key (User needs to replace this)
    if (typeof emailjs !== 'undefined') {
        emailjs.init("YOUR_PUBLIC_KEY");
    }

    if (waitlistBtn && waitlistEmail) {
        waitlistBtn.addEventListener('click', async () => {
            const email = waitlistEmail.value.trim();

            if (!email || !email.includes('@')) {
                showWaitlistMessage('Please enter a valid email address.', 'error');
                return;
            }

            const originalText = waitlistBtn.textContent;
            waitlistBtn.disabled = true;
            waitlistBtn.textContent = 'Aligning...';

            try {
                const response = await fetch(`${CONFIG.API_BASE_URL}/api/subscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                if (response.ok) {
                    showWaitlistMessage('Success! Your resonance is aligned. Check your inbox.', 'success');
                    waitlistBtn.textContent = "You're In!";
                    waitlistEmail.value = '';
                } else {
                    throw new Error('Subscription failed');
                }
            } catch (err) {
                console.error('Subscription Error:', err);
                showWaitlistMessage('Transmission failed. Ecosystem connection error.', 'error');
            } finally {
                setTimeout(() => {
                    waitlistBtn.disabled = false;
                    waitlistBtn.textContent = originalText;
                    waitlistMessage.style.display = 'none';
                }, 6000);
            }
        });
    }

    function showWaitlistMessage(text, type) {
        waitlistMessage.textContent = text;
        waitlistMessage.style.display = 'block';
        waitlistMessage.style.padding = '10px 15px';

        if (type === 'success') {
            waitlistMessage.style.background = 'rgba(46, 213, 115, 0.1)';
            waitlistMessage.style.color = '#2ed573';
            waitlistMessage.style.border = '1px solid #2ed573';
        } else {
            waitlistMessage.style.background = 'rgba(255, 71, 87, 0.1)';
            waitlistMessage.style.color = '#ff4757';
            waitlistMessage.style.border = '1px solid #ff4757';
        }
    }
});
