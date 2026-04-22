/* -------------------------------------------------
   main.js – таблица, список, отправка формы.
   Включена проверка согласий и запись цены в hidden‑поле.
   ------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {
    loadCatalog();          // заполняет таблицу
    fillEquipmentSelect();  // заполняет выпадающий список
    setupForm();            // обработка отправки формы
});

/* ---------- 1️⃣ Таблица каталога ---------- */
async function loadCatalog() {
    try {
        const resp = await fetch('./data/equipment.json');
        const equipment = await resp.json();

        const tbody = document.getElementById('catalog-body');
        if (!tbody) {
            console.error('❌ Не найден элемент <tbody id="catalog-body">');
            return;
        }

        equipment.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.title}</td>
                <td>${item.description}</td>
                <td>от ${item.price} ₽/ч</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('❌ Ошибка загрузки каталога техники:', err);
    }
}

/* ---------- 2️⃣ Список техники (выпадающий список) ---------- */
async function fillEquipmentSelect() {
    try {
        const resp = await fetch('./data/equipment.json');
        const equipment = await resp.json();

        const select = document.getElementById('equipment');
        if (!select) {
            console.error('❌ Не найден элемент <select id="equipment">');
            return;
        }

        equipment.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.id;

            // Текст виден пользователю: «Техника — от 7800 ₽/ч»
            opt.textContent = `${item.title} — от ${item.price} ₽/ч`;

            // Храним чистую цену в атрибуте data-price
            opt.setAttribute('data-price', item.price);

            select.appendChild(opt);
        });
    } catch (err) {
        console.error('❌ Ошибка заполнения списка техники в форме:', err);
    }
}

/* ---------- 3️⃣ Обработка формы ---------- */
function setupForm() {
    const form   = document.getElementById('order-form');
    const status = document.getElementById('form-status');
    const priceHidden = document.getElementById('priceHidden'); // hidden input

    form.addEventListener('submit', async e => {
        e.preventDefault();                // отключаем обычную отправку
        status.textContent = '';
        status.className = 'form-status';

        // ---------- 3.1 Валидация обязательных полей ----------
        if (!form.name.value.trim() ||
            !form.phone.value.trim() ||
            !form.equipment.value ||
            !form.date.value) {
            status.textContent = 'Заполните все обязательные поля.';
            status.classList.add('error');
            return;
        }

        // ---------- 3.2 Проверка согласий ----------
        const agreeData   = document.getElementById('agree-data');
        const agreePolicy = document.getElementById('agree-privacy');

        if (!agreeData.checked) {
            status.textContent = 'Необходимо согласие на обработку персональных данных.';
            status.classList.add('error');
            return;
        }
        if (!agreePolicy.checked) {
            status.textContent = 'Необходимо согласие с политикой конфиденциальности.';
            status.classList.add('error');
            return;
        }

        // ---------- 3.3 Записываем актуальную цену в hidden‑поле ----------
        const selectedOption = document.querySelector('#equipment option:checked');
        if (selectedOption) {
            const price = selectedOption.getAttribute('data-price'); // чистое число
            priceHidden.value = price;   // перезаписываем value (один hidden‑input)
        }

        // ---------- 3.4 Отправляем форму в Formspree ----------
        try {
            const resp = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),          // включает hidden price
                headers: { 'Accept': 'application/json' }
            });

            const result = await resp.json();

            if (resp.ok) {
                status.textContent = 'Заявка успешно отправлена! Мы свяжемся с вами.';
                status.classList.add('success');
                form.reset();                     // очистить форму
            } else {
                throw new Error(result.error || 'Ошибка сервера');
            }
        } catch (err) {
            console.error('❌ Ошибка отправки формы:', err);
            status.textContent = 'Не удалось отправить заявку. Попробуйте позже.';
            status.classList.add('error');
        }
    });
}
