/* =========================
   SIDEBAR MENU
========================= */
const btn = document.querySelector('.menu-btn');
const sidebar = document.querySelector('.sidebar');

if (btn && sidebar) {
    btn.addEventListener('click', function (e) {
        e.stopPropagation();
        sidebar.classList.toggle('active');
    });

    function closeSidebar() {
        sidebar.classList.remove('active');
    }

    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && !btn.contains(e.target)) {
            closeSidebar();
        }
    });

    window.addEventListener('scroll', () => {
        if (sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });
}

/* =========================
   BARBER CARDS TOGGLE
========================= */
const cards = document.querySelectorAll('.barberCard');

cards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.stopPropagation();

        cards.forEach(c => {
            if (c !== card) c.classList.remove('active');
        });

        card.classList.toggle('active');
    });
});

/* =========================
   MAP ANIMATION (SCROLL)
========================= */
const mapSection = document.querySelector('.map-section');

if (mapSection) {
    const mapObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.2
    });

    mapObserver.observe(mapSection);
}

/* =========================
   FLOATING BUTTONS HIDE ON FOOTER
========================= */
const floating = document.querySelector('.floating-buttons');
const footer = document.querySelector('.footerWrapper');

if (floating && footer) {
    window.addEventListener('scroll', () => {
        const footerTop = footer.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if (footerTop < windowHeight) {
            floating.classList.add('hide');
        } else {
            floating.classList.remove('hide');
        }
    });
}

/* =========================
   GALLERY MODAL + SWIPE
========================= */
const items = document.querySelectorAll('.gallery-item img');
const modal = document.getElementById('galleryModal');
const modalImg = document.getElementById('modalImg');
const closeBtn = document.querySelector('.close');

let currentIndex = 0;
let startX = 0;

function openModal(index) {
    if (!modal || !modalImg) return;

    currentIndex = index;
    modal.style.display = 'flex';
    modalImg.src = items[currentIndex].src;
}

items.forEach((img, index) => {
    img.addEventListener('click', () => openModal(index));
});

if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });

    modal.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
    });

    modal.addEventListener('touchend', (e) => {
        const endX = e.changedTouches[0].clientX;

        if (startX - endX > 50) {
            currentIndex = (currentIndex + 1) % items.length;
            modalImg.src = items[currentIndex].src;
        }

        if (endX - startX > 50) {
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            modalImg.src = items[currentIndex].src;
        }
    });
}

/* =========================
   GALLERY SCROLL ANIMATION
========================= */
const galleryItems = document.querySelectorAll('.gallery-item');

if (galleryItems.length) {
    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show');
            }
        });
    }, {
        threshold: 0.2
    });

    galleryItems.forEach(item => {
        item.classList.add('hidden');
        galleryObserver.observe(item);
    });
}

/* =========================
   CONTACT FORM + TURNSTILE + API
========================= */

function showMessage(text, type) {
    console.log(`[${type}]`, text);
    alert(text);
}

const form = document.querySelector('.contact-form');

let turnstileToken = null;

/* =========================
   TURNSTILE CALLBACKS
========================= */
window.onTurnstileSuccess = (token) => {
    console.log("✅ Turnstile success");
    turnstileToken = token;
};

window.onTurnstileExpired = () => {
    console.log("⚠️ Turnstile expired");
    turnstileToken = null;
};

/* =========================
   FORM SUBMIT
========================= */
if (form) {
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const btn = form.querySelector('button[type="submit"]');

        const name = form.querySelector('[name="name"]')?.value?.trim() || '';
        const email = form.querySelector('[name="email"]')?.value?.trim() || '';
        const message = form.querySelector('[name="message"]')?.value?.trim() || '';

        console.log("📤 Sending:", {
            name,
            email,
            message,
            token: turnstileToken
        });

        /* =========================
           VALIDATION
        ========================= */
        if (name.length < 2) {
            return showMessage("Nome inválido", "error");
        }

        if (!email.includes('@')) {
            return showMessage("Email inválido", "error");
        }

        if (message.length < 10) {
            return showMessage("Mensagem muito curta", "error");
        }

        if (!turnstileToken) {
            return showMessage("Confirma o captcha primeiro", "error");
        }

        /* =========================
           LOADING
        ========================= */
        btn.disabled = true;
        btn.innerText = "A enviar...";

        try {
            const res = await fetch('https://original-cut-barbershop-production.up.railway.app/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    message,
                    token: turnstileToken
                })
            });

            const data = await res.json();
            console.log("📩 Response:", data);

            if (!res.ok || !data.success) {
                throw new Error(data.message || "Erro ao enviar mensagem");
            }

            showMessage("Mensagem enviada com sucesso ✔", "success");

            form.reset();
            turnstileToken = null;

            window.turnstile?.reset?.();

        } catch (err) {
            console.error("❌ FETCH ERROR:", err);
            showMessage(err.message || "Erro de ligação ao servidor", "error");
        } finally {
            btn.disabled = false;
            btn.innerText = "Enviar Mensagem";
        }
    });
}