/* -------------------------------------------------
   carousel.js – генерация слайдов Swiper из equipment.json
   ------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
});

async function initCarousel() {
    try {
        // 1️⃣ Получаем список техники
        const resp = await fetch('./data/equipment.json');
        const equipment = await resp.json();

        // 2️⃣ Находим контейнер Swiper‑wrapper
        const wrapper = document.querySelector('.swiper-wrapper');

        // 3️⃣ Для каждой позиции создаём слайд
        equipment.forEach(item => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <img src="${item.image}" alt="${item.title}" loading="lazy">
                <div class="slide-caption">
                    <strong>${item.title}</strong><br>
                    <small>${item.description}</small>
                </div>
            `;
            wrapper.appendChild(slide);
        });

        // 4️⃣ Инициализируем Swiper
        new Swiper('.mySwiper', {
            loop: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            slidesPerView: 1,
            spaceBetween: 20,
            breakpoints: {
                640:  { slidesPerView: 2 },
                1024: { slidesPerView: 3 }
            }
        });
    } catch (err) {
        console.error('❌ Ошибка инициализации карусели:', err);
    }
}
