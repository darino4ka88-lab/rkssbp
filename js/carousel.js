/* ==============================================================
   carousel.js – Карусель Swiper + Lightbox для изображений
   ============================================================== */

document.addEventListener('DOMContentLoaded', () => {
    initCarousel();
    initLightbox();
});

/* ---------- Инициализация карусели ---------- */
async function initCarousel() {
    try {
        const resp = await fetch('./data/equipment.json');
        const equipment = await resp.json();

        const wrapper = document.querySelector('.swiper-wrapper');

        equipment.forEach(item => {
            const slide = document.createElement('div');
            slide.className = 'swiper-slide';
            slide.innerHTML = `
                <div class="slide-image-wrapper" 
                     data-title="${item.title}" 
                     data-price="${item.price} ₽/ч">
                    <img src="${item.image}" alt="${item.title}" loading="lazy">
                    <div class="slide-overlay">
                        <span class="zoom-icon">🔍</span>
                    </div>
                </div>
                <div class="slide-caption">
                    <strong>${item.title}</strong><br>
                    <small>${item.description}</small>
                </div>
            `;
            wrapper.appendChild(slide);
        });

        // Инициализация Swiper
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

        // Обработчик клика на слайд
        wrapper.addEventListener('click', (e) => {
            const imageWrapper = e.target.closest('.slide-image-wrapper');
            if (imageWrapper) {
                const img = imageWrapper.querySelector('img');
                const title = imageWrapper.dataset.title;
                const price = imageWrapper.dataset.price;
                openLightbox(img.src, title, price);
            }
        });
    } catch (err) {
        console.error('❌ Ошибка инициализации карусели:', err);
    }
}

/* ---------- Lightbox (модальное окно) ---------- */
let lightbox = null;
let lightboxImg = null;
let lightboxTitle = null;
let lightboxPrice = null;
let lightboxClose = null;
let currentIndex = 0;
let slides = [];

function initLightbox() {
    // Создаём HTML модального окна
    const lightboxHTML = `
        <div id="equipment-lightbox" class="lightbox">
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Закрыть">&times;</button>
                <button class="lightbox-prev" aria-label="Предыдущее">&lsaquo;</button>
                <img src="" alt="" class="lightbox-image">
                <button class="lightbox-next" aria-label="Следующее">&rsaquo;</button>
                <div class="lightbox-info">
                    <h3 class="lightbox-title"></h3>
                    <p class="lightbox-price"></p>
                </div>
            </div>
            <div class="lightbox-overlay"></div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', lightboxHTML);

    // Сохраняем ссылки на элементы
    lightbox = document.getElementById('equipment-lightbox');
    lightboxImg = lightbox.querySelector('.lightbox-image');
    lightboxTitle = lightbox.querySelector('.lightbox-title');
    lightboxPrice = lightbox.querySelector('.lightbox-price');
    lightboxClose = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const overlay = lightbox.querySelector('.lightbox-overlay');

    // Загрузка слайдов из карусели
    const slideElements = document.querySelectorAll('.swiper-slide');
    slides = Array.from(slideElements).map(slide => ({
        src: slide.querySelector('img').src,
        title: slide.querySelector('.slide-image-wrapper').dataset.title,
        price: slide.querySelector('.slide-image-wrapper').dataset.price
    }));

    // Обработчики событий
    lightboxClose.addEventListener('click', closeLightbox);
    overlay.addEventListener('click', closeLightbox);
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showPrevious();
    });
    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        showNext();
    });

    // Закрытие по Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevious();
        if (e.key === 'ArrowRight') showNext();
    });

    // Запрет propagation на контент
    lightbox.querySelector('.lightbox-content').addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function openLightbox(src, title, price) {
    if (!lightbox) return;
    
    currentIndex = slides.findIndex(slide => slide.src === src);
    if (currentIndex === -1) currentIndex = 0;

    lightboxImg.src = src;
    lightboxImg.alt = title;
    lightboxTitle.textContent = title;
    lightboxPrice.textContent = `Цена: ${price}`;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

function showPrevious() {
    if (!lightbox || slides.length === 0) return;
    currentIndex = (currentIndex - 1 + slides.length) % slides.length;
    updateLightboxContent();
}

function showNext() {
    if (!lightbox || slides.length === 0) return;
    currentIndex = (currentIndex + 1) % slides.length;
    updateLightboxContent();
}

function updateLightboxContent() {
    const slide = slides[currentIndex];
    lightboxImg.src = slide.src;
    lightboxImg.alt = slide.title;
    lightboxTitle.textContent = slide.title;
    lightboxPrice.textContent = `Цена: ${slide.price}`;
}
