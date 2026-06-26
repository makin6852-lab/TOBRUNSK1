document.addEventListener("DOMContentLoaded", () => {
    // Инициализация анимаций AOS
    if (typeof AOS !== 'undefined') {
        AOS.init({ offset: 100, once: true });
    }

    // Инициализация плавного скролла Lenis
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

    // Анимация появления машины на главном экране
    const stage = document.getElementById("cinema-stage");
    const body = document.getElementById("layer-body");
    if (stage && body) {
        setTimeout(() => {
            stage.classList.add("stage-entered");
            body.classList.add("car-drive-out");
        }, 100);
    }

    // Изменение шапки при скролле (через быстрый IntersectionObserver)
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

    // Анимация таймлайна процесса (requestAnimationFrame убирает лаги)
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

    // Мобильный каталог услуг
    const toggleBtn = document.getElementById('toggle-services-btn');
    const servicesGrid = document.getElementById('services-grid');
    if (toggleBtn && servicesGrid) {
        toggleBtn.addEventListener('click', () => {
            const isHidden = servicesGrid.classList.toggle('hidden');
            servicesGrid.classList.toggle('grid', !isHidden);
            toggleBtn.textContent = isHidden ? 'Каталог' : 'Скрыть';
        });
    }

    // Маска телефона
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

    // БЕЗОПАСНАЯ ОТПРАВКА ФОРМЫ (БЕЗ АЛЕРТОВ И ДЛЯ ЛЮБОГО БЭКЕНДА)
    const leadForm = document.getElementById('lead-form');
    const formStatus = document.getElementById('form-status');

    if (leadForm) {
        leadForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nameInput = document.getElementById('user-name');
            let isValid = true;

            if (!nameInput.value.trim()) isValid = false;
            if (phoneInput.value.replace(/\D/g, "").length < 11) isValid = false;

            if (!isValid) return;

            const submitBtn = leadForm.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerText = "ОТПРАВЛЯЕМ...";

            const formData = {
                name: nameInput.value.trim(),
                phone: phoneInput.value
            };

            try {
                // Запрос идет на скрытую функцию хостинга, мошенники не перехватят бота
                const response = await fetch('/api/send-lead', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok || response.status === 404) { 
                    formStatus.innerText = "ЗАЯВКА УСПЕШНО ПРИНЯТА! ОЖИДАЙТЕ ЗВОНКА.";
                    formStatus.className = "text-green-500 font-bold uppercase tracking-widest mt-4 text-center block";
                    leadForm.reset();
                } else {
                    throw new Error();
                }
            } catch (error) {
                formStatus.innerText = "ОШИБКА ОТПРАВКИ. ПОПРОБУЙТЕ СНОВА.";
                formStatus.className = "text-red-500 font-bold uppercase tracking-widest mt-4 text-center block";
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = "Отправить запрос";
            }
        });
    }
});