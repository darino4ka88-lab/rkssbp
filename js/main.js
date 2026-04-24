/* ==============================================================
   main.js – Таблица, список, отправка формы
   ============================================================== */

document.addEventListener('DOMContentLoaded', () => {
    loadCatalog();
    fillEquipmentSelect();
    setupForm();
});

/* ---------- 1. Таблица каталога ---------- */
async function loadCatalog() {
    try {
        const resp = await fetch('./data/equipment.json');
        const equipment = await resp.json();
        const tbody = document.getElementById('catalog-body');
        if (!tbody) return;

        equipment.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.title}</td>
                <td>${item.description}</td>
                <td>от ${item.price} ₽/ч</td>
            `;
            tbody.appendChild(tr);
        });
    } catch (err) {
        console.error('Ошибка загрузки каталога:', err);
    }
}

/* ---------- 2. Выпадающий список ---------- */
async function fillEquipmentSelect() {
    try {
        const resp = await fetch('./data/equipment.json');
        const equipment = await resp.json();
        const select = document.getElementById('equipment');
        if (!select) return;

        equipment.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.id;
            opt.textContent = `${item.title} — от ${item.price} ₽/ч`;
            opt.setAttribute('data-price', item.price);
            select.appendChild(opt);
        });
    } catch (err) {
        console.error('Ошибка заполнения списка:', err);
    }
}

/* ---------- 3. Обработка формы ---------- */
function setupForm() {
    const form = document.getElementById('order-form');
    const status = document.getElementById('form-status');
    const priceHidden = document.getElementById('priceHidden');

    if (!form || !status) {
        console.error('❌ Не найдена форма или блок статуса');
        return;
    }

    form.addEventListener('submit', async e => {
        e.preventDefault();
        status.textContent = 'Отправка...';
        status.className = 'form-status';

        // 1. Проверка основных полей
        if (!form.name.value.trim() || !form.phone.value.trim() || 
            !form.equipment.value || !form.date.value) {
            status.textContent = 'Заполните все обязательные поля.';
            status.classList.add('error');
            return;
        }

        // 2. Проверка согласий
        const agreeData = document.getElementById('agree-data');
        const agreePolicy = document.getElementById('agree-privacy');

        if (agreeData && !agreeData.checked) {
            status.textContent = 'Необходимо согласие на обработку данных.';
            status.classList.add('error');
            return;
        }
        if (agreePolicy && !agreePolicy.checked) {
            status.textContent = 'Необходимо согласие с политикой конфиденциальности.';
            status.classList.add('error');
            return;
        }

        // 3. Запись цены
        if (priceHidden) {
            const selectedOption = document.querySelector('#equipment option:checked');
            if (selectedOption) {
                priceHidden.value = selectedOption.getAttribute('data-price') || '';
            }
        }

        // 4. Отправка
        try {
            const resp = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { 'Accept': 'application/json' }
            });

            if (resp.ok) {
                status.textContent = 'Заявка успешно отправлена!';
                status.classList.add('success');
                form.reset();
            } else {
                throw new Error('Ошибка сервера');
            }
        } catch (err) {
            console.error(err);
            status.textContent = 'Ошибка отправки. Попробуйте позже.';
            status.classList.add('error');
        }
    });
}
