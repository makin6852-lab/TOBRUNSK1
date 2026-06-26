document.addEventListener("DOMContentLoaded", () => {
    if (typeof AOS !== 'undefined') {
        AOS.init({ 
            offset: 100, 
            once: true,
            duration: 800,
            easing: 'ease-out-cubic'
        });
    }

    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({ 
            duration: 1.2, 
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), 
            smooth: true 
        });
        function raf(time) { 
            lenis.raf(time); 
            requestAnimationFrame(raf); 
        }
        requestAnimationFrame(raf);
    }

    const stage = document.getElementById("cinema-stage");
    const body = document.getElementById("layer-body");
    if (stage && body) {
        setTimeout(() => {
            stage.classList.add("stage-entered");
            body.classList.add("car-drive-out");
        }, 150);
    }

    const header = document.getElementById("header");
    const heroSection = document.getElementById("hero-section");
    if (header && heroSection) {
        const headerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) {
                    header.classList.add("scrolled");
                } else {
                    header.classList.remove("scrolled");
                }
            });
        }, { rootMargin: "-80px 0px 0px 0px" });
        headerObserver.observe(heroSection);
    }

    const seg1 = document.getElementById('path-segment-1');
    const seg2 = document.getElementById('path-segment-2');
    const seg3 = document.getElementById('path-segment-3');

    if (seg1 && seg2 && seg3) {
        const l1_len = seg1.getTotalLength();
        const l2_len = seg2.getTotalLength();
        const l3_len = seg3.getTotalLength();

        seg1.style.strokeDasharray = l1_len; seg1.style.strokeDashoffset = l1_len;
        seg2.style.strokeDasharray = l2_len; seg2.style.strokeDashoffset = l2_len;
        seg3.style.strokeDasharray = l3_len; seg3.style.strokeDashoffset = l3_len;

        const steps = [
            { node: document.getElementById('p-step-1'), path: seg1, len: l1_len },
            { node: document.getElementById('p-step-2'), path: seg2, len: l2_len },
            { node: document.getElementById('p-step-3'), path: seg3, len: l3_len },
            { node: document.getElementById('p-step-4'), path: null, len: 0 }
        ];

        let isTicking = false;
        const updateTimeline = () => {
            const viewHeight = window.innerHeight;
            steps.forEach((step) => {
                if (!step.node) return;
                const nodeRect = step.node.getBoundingClientRect();
                const circle = step.node.querySelector('.node-circle');
                
                if (nodeRect.top < viewHeight * 0.72) {
                    step.node.style.opacity = "1";
                    if (circle) {
                        circle.style.borderColor = "#0052FF";
                        circle.style.boxShadow = "0 0 15px rgba(0, 82, 255, 0.5)";
                        circle.style.backgroundColor = "rgba(0, 82, 255, 0.08)";
                        circle.style.color = "#fff";
                    }
                    if (step.path) step.path.style.strokeDashoffset = "0";
                } else {
                    step.node.style.opacity = "0.25";
                    if (circle) {
                        circle.style.borderColor = "rgba(255,255,255,0.1)";
                        circle.style.boxShadow = "none";
                        circle.style.backgroundColor = "#03050d";
                        circle.style.color = "#AAB3C5";
                    }
                    if (step.path) step.path.style.strokeDashoffset = step.len;
                }
            });
            isTicking = false;
        };

        window.addEventListener("scroll", () => {
            if (!isTicking) {
                requestAnimationFrame(updateTimeline);
                isTicking = true;
            }
        }, { passive: true });
    }

    const toggleBtn = document.getElementById('toggle-services-btn');
    const servicesGrid = document.getElementById('services-grid');
    if (toggleBtn && servicesGrid) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = servicesGrid.classList.toggle('hidden');
            servicesGrid.classList.toggle('grid', !isHidden);
            toggleBtn.textContent = isHidden ? 'Каталог' : 'Скрыть';
            toggleBtn.setAttribute('aria-expanded', !isHidden);
        });
    }

    const phoneInput = document.getElementById('phone-mask');
    if (phoneInput) {
        phoneInput.addEventListener('input', () => {
            let matrix = "+7 (___) ___-__-__", i = 0, def = matrix.replace(/\D/g, ""), val = phoneInput.value.replace(/\D/g, "");
            if (def.length >= val.length) val = def;
            phoneInput.value = matrix.replace(/./g, function(a) {
                return /[_\d]/.test(a) && i < val.length ? val.charAt(i++) : i >= val.length ? "" : a;
            });
        });
    }

    const leadForm = document.getElementById('lead-form');
    const formStatus = document.getElementById('form-status');
    const privacyCheckbox = document.getElementById('privacy-agree');

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('user-name');
            let isValid = true;

            if (!nameInput.value.trim()) isValid = false;
            if (phoneInput.value.replace(/\D/g, "").length < 11) isValid = false;

            if (privacyCheckbox && !privacyCheckbox.checked) {
                formStatus.innerText = "НЕОБХОДИМО ДАТЬ СОГЛАСИЕ НА ОБРАБОТКУ ДАННЫХ.";
                formStatus.className = "text-red-500 font-bold uppercase tracking-widest mt-4 text-center block";
                formStatus.classList.remove('hidden');
                return;
            }

            if (!isValid) {
                formStatus.innerText = "ПОЖАЛУЙСТА, ЗАПОЛНИТЕ ВСЕ ПОЛЯ КОРРЕКТНО.";
                formStatus.className = "text-red-500 font-bold uppercase tracking-widest mt-4 text-center block";
                formStatus.classList.remove('hidden');
                return;
            }

            const submitBtn = leadForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = "ОТПРАВЛЯЕМ ЗАЯВКУ...";

            const formData = {
                name: nameInput.value.trim(),
                phone: phoneInput.value
            };

            try {
                formStatus.classList.remove('hidden');
                formStatus.innerText = "СВЯЗЬ С СЕРВЕРОМ...";
                formStatus.className = "text-white font-bold uppercase tracking-widest mt-4 text-center block";

                const response = await fetch('/api/send-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) { 
                    formStatus.innerText = "ЗАЯВКА УСПЕШНО ПРИНЯТА! МАСТЕР СВЯЖЕТСЯ С ВАМИ.";
                    formStatus.className = "text-green-500 font-bold uppercase tracking-widest mt-4 text-center block";
                    leadForm.reset();
                    submitBtn.disabled = true;
                    submitBtn.innerText = "ОТПРАВЛЕНО";
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.telegramError || `Ошибка сервера: ${response.status}`);
                }
            } catch (error) {
                console.error("Форма не отправлена:", error);
                formStatus.innerText = "ОШИБКА СЕРВЕРА. ПОПРОБУЙТЕ ПОЗЖЕ.";
                formStatus.className = "text-red-500 font-bold uppercase tracking-widest mt-4 text-center block";
                submitBtn.disabled = false;
                submitBtn.innerText = "ОТПРАВИТЬ ЗАПРОС";
            }
        });
    }

    const cookieBanner = document.getElementById('cookie-banner');
    const cookieAcceptBtn = document.getElementById('cookie-accept-btn');

    if (cookieBanner && cookieAcceptBtn) {
        if (!localStorage.getItem('cookie_accepted')) {
            cookieBanner.classList.remove('hidden');
            cookieBanner.classList.add('flex');
        }

        cookieAcceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookie_accepted', 'true');
            cookieBanner.classList.remove('flex');
            cookieBanner.classList.add('hidden');
        });
    }
});