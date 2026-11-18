'use strict';

const estimator = document.querySelector('#estimator');

function estimateLocally(config, state, promoPercent) {
    const price = key => state.currency === 'EUR'
        ? (config.prices[key].eur ?? config.prices[key].czk / config.exchange_rate)
        : config.prices[key].czk;
    const round = amount => Math.round((amount + Number.EPSILON) * 100) / 100;
    const lines = [{key: state.project, quantity: 1, amount: price(state.project)}];
    const includedPages = state.project === 'simple' ? 1 : 3;
    if (state.pages > includedPages) lines.push({key: 'page', quantity: state.pages - includedPages, amount: (state.pages - includedPages) * price('page')});
    for (const addon of [...new Set(state.addons)]) {
        if (addon === 'care' || addon === 'domain' || (addon === 'migration' && state.project !== 'website')) continue;
        const quantity = addon === 'multilingual' ? state.languages : 1;
        lines.push({key: addon, quantity, amount: quantity * price(addon)});
    }
    const subtotal = lines.reduce((sum, line) => sum + line.amount, 0);
    const automatic = Math.max(state.project === 'combined' ? config.discounts.bundle_percent : 0,
        state.preview && ['website', 'combined'].includes(state.project) ? config.discounts.preview_percent : 0);
    const automaticSaving = round(subtotal * automatic / 100);
    const promoSaving = round((subtotal - automaticSaving) * promoPercent / 100);
    return {lines, subtotal: round(subtotal), savings: round(automaticSaving + promoSaving),
        total: round(subtotal - automaticSaving - promoSaving), monthly: state.addons.includes('care') ? round(price('care')) : 0,
        annual: state.addons.includes('domain') ? round(price('domain')) : 0};
}

if (estimator) {
    const pricing = JSON.parse(estimator.dataset.pricing);
    const copy = JSON.parse(estimator.dataset.translations);
    const lang = estimator.dataset.lang;
    let csrf = estimator.dataset.csrf;
    let activeCode = '';
    let activePercent = 0;
    let promoRequest = 0;
    const promo = document.querySelector('#promo');
    const promoStatus = document.querySelector('#promo-status');
    const form = document.querySelector('#contact-form');
    const formToken = form.elements.namedItem('form_token');
    const moneyFormat = currency => new Intl.NumberFormat(copy.locale, {style: 'currency', currency, maximumFractionDigits: 2, minimumFractionDigits: 0});
    const collect = () => ({
        project: estimator.querySelector('[name="project"]:checked').value,
        currency: estimator.querySelector('[name="currency"]:checked').value,
        pages: Number(document.querySelector('#pages').value),
        languages: Math.max(1, Math.min(6, Number(document.querySelector('#languages').value) || 1)),
        addons: [...estimator.querySelectorAll('[name="addons"]:checked')].map(input => input.value),
        preview: document.querySelector('#preview-discount').checked,
        promo: activeCode,
    });
    const format = (currency, amount) => moneyFormat(currency).format(amount);

    function render() {
        const state = collect();
        const migration = estimator.querySelector('[name="addons"][value="migration"]');
        migration.disabled = state.project !== 'website';
        if (migration.disabled) migration.checked = false;
        const preview = document.querySelector('#preview-discount');
        preview.disabled = !['website', 'combined'].includes(state.project);
        if (preview.disabled) preview.checked = false;
        const current = collect();
        const result = estimateLocally(pricing, current, activePercent);
        const money = amount => format(current.currency, amount);
        document.querySelector('#page-output').textContent = `${current.pages} ${copy.pages}`;
        document.querySelector('#language-count').hidden = !current.addons.includes('multilingual');
        estimator.querySelectorAll('[data-price]').forEach(element => {
            const key = element.dataset.price;
            const unit = current.currency === 'EUR' ? (pricing.prices[key].eur ?? pricing.prices[key].czk / pricing.exchange_rate) : pricing.prices[key].czk;
            element.textContent = key === 'migration' && current.project !== 'website'
                ? copy.included : `+ ${money(unit)}${key === 'care' ? ` ${copy.per_month}` : key === 'domain' ? ` ${copy.per_year}` : ''}`;
        });
        const rows = result.lines.map(line => {
            const row = document.createElement('div');
            const label = document.createElement('span');
            label.textContent = `${copy.prices[line.key]}${line.quantity > 1 ? ` × ${line.quantity}` : ''}`;
            const amount = document.createElement('span');
            amount.className = 'mono';
            amount.textContent = money(line.amount);
            row.append(label, amount);
            return row;
        });
        document.querySelector('#estimate-lines').replaceChildren(...rows);
        document.querySelector('#subtotal').textContent = money(result.subtotal);
        document.querySelector('#savings').textContent = `−${money(result.savings)}`;
        document.querySelector('#total').textContent = money(result.total);
        document.querySelector('#monthly').textContent = result.monthly ? `${money(result.monthly)} ${copy.per_month}` : copy.no_care;
        document.querySelector('#annual').textContent = result.annual ? `${money(result.annual)} ${copy.per_year}` : copy.no_domain;
        document.querySelector('#estimate-payload').value = JSON.stringify(current);
    }

    estimator.addEventListener('input', event => {
        if (event.target === promo) {
            promoRequest++;
            activeCode = '';
            activePercent = 0;
            promoStatus.textContent = '';
        }
        render();
    });
    estimator.querySelectorAll('[name="project"]').forEach(input => input.addEventListener('change', () => {
        document.querySelector('#pages').value = input.value === 'simple' ? '1' : '3';
        render();
    }));
    document.querySelector('#apply-promo').addEventListener('click', async event => {
        const button = event.currentTarget;
        const code = promo.value.trim().toUpperCase();
        const requestId = ++promoRequest;
        activeCode = '';
        activePercent = 0;
        render();
        if (!code) {
            promoStatus.textContent = copy.promo_removed;
            return;
        }
        button.disabled = true;
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 12000);
        try {
            const body = new FormData();
            body.set('action', 'quote');
            body.set('csrf', csrf);
            body.set('lang', lang);
            body.set('estimate', JSON.stringify({...collect(), promo: code}));
            const response = await fetch('contact.php', {method: 'POST', body, headers: {'Accept': 'application/json'}, signal: controller.signal, credentials: 'same-origin'});
            const data = await response.json().catch(() => ({}));
            if (requestId !== promoRequest) return;
            if (!response.ok || !data.estimate) throw new Error(data.message || copy.promo_error);
            activePercent = data.estimate.promo_percent;
            activeCode = data.estimate.promo_valid ? code : '';
            promoStatus.textContent = copy[data.estimate.promo_valid ? 'promo_valid' : 'promo_invalid'];
            render();
        } catch (error) {
            if (requestId === promoRequest) promoStatus.textContent = error.name === 'AbortError' || !error.message ? copy.promo_error : error.message;
        } finally {
            clearTimeout(timer);
            button.disabled = false;
        }
    });
    promo.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
            event.preventDefault();
            document.querySelector('#apply-promo').click();
        }
    });
    document.querySelector('#print-estimate').addEventListener('click', () => window.print());


    form.addEventListener('submit', async event => {
        event.preventDefault();
        render();
        const button = document.querySelector('#send-enquiry');
        const buttonLabel = button.querySelector('span');
        const status = document.querySelector('#form-status');
        button.disabled = true;
        buttonLabel.textContent = copy.sending;
        status.textContent = '';
        status.className = 'form-status';
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 20000);
        try {
            const response = await fetch(form.action, {method: 'POST', body: new FormData(form), headers: {'Accept': 'application/json'}, signal: controller.signal, credentials: 'same-origin'});
            const data = await response.json().catch(() => null);
            if (!data) {
                // Náhled bez PHP (např. GitHub Pages): contact.php neexistuje.
                status.innerHTML = '';
                status.append('Toto je náhled bez serveru, formulář se zde neodesílá. Napište nám prosím přímo na ');
                const mail = document.createElement('a');
                mail.href = 'mailto:info@treehouseweb.com'; mail.textContent = 'info@treehouseweb.com'; status.append(mail, '.');
                status.className = 'form-status notice error';
                return;
            }
            if (data.form_token) formToken.value = data.form_token;
            status.textContent = data.message || copy.mail_error;
            status.className = `form-status notice${response.ok ? '' : ' error'}`;
            if (response.ok) {
                form.reset();
                formToken.value = data.form_token || formToken.value;
                render();
            }
        } catch {
            status.textContent = copy.network_error;
            status.className = 'form-status notice error';
        } finally {
            clearTimeout(timer);
            button.disabled = false;
            buttonLabel.textContent = copy.send;
        }
    });
    render();
}

const comparison = document.querySelector('#comparison-range');
if (comparison) {
    const image = document.querySelector('.comparison');
    const updateComparison = value => {
        comparison.value = String(value);
        document.querySelector('#legacy-layer').style.clipPath = `inset(0 ${100 - value}% 0 0)`;
        document.querySelector('#comparison-line').style.left = `${value}%`;
    };
    comparison.addEventListener('input', () => updateComparison(Number(comparison.value)));
    image.addEventListener('pointermove', event => {
        if (event.pointerType !== 'mouse') return;
        const bounds = image.getBoundingClientRect();
        updateComparison(Math.max(0, Math.min(100, Math.round((event.clientX - bounds.left) / bounds.width * 100))));
    });
}

const menuButton = document.querySelector('.menu-toggle');
if (menuButton && !document.documentElement.hasAttribute('data-nav2')) {
    const navigation = document.querySelector('#main-nav');
    menuButton.addEventListener('click', () => {
        const expanded = menuButton.getAttribute('aria-expanded') !== 'true';
        menuButton.setAttribute('aria-expanded', String(expanded));
        navigation.classList.toggle('is-open', expanded);
    });
    navigation.addEventListener('click', event => {
        if (event.target.closest('a')) {
            navigation.classList.remove('is-open');
            menuButton.setAttribute('aria-expanded', 'false');
        }
    });
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
            navigation.classList.remove('is-open');
            menuButton.setAttribute('aria-expanded', 'false');
            menuButton.focus();
        }
    });
}

const promoRows = document.querySelector('#promo-rows');
if (promoRows) {
    let nextRow = Number(promoRows.dataset.next);
    document.querySelector('#add-promo').addEventListener('click', () => {
        if (promoRows.children.length >= 50) return;
        const row = document.querySelector('#promo-template').content.cloneNode(true);
        row.querySelectorAll('[name]').forEach(input => {input.name = input.name.replace('__INDEX__', String(nextRow));});
        nextRow++;
        promoRows.append(row);
        promoRows.lastElementChild.querySelector('input').focus();
    });
    promoRows.addEventListener('click', event => {
        const remove = event.target.closest('.remove-promo');
        if (remove) remove.closest('.promo-admin-row').remove();
    });
}

document.querySelectorAll('[data-intent]').forEach(link => link.addEventListener('click', () => {
    const intent = document.querySelector('#contact-intent');
    if (intent) intent.value = link.dataset.intent;
    const message = document.querySelector('#contact-form textarea[name="message"]');
    if (message && link.dataset.prefill && !message.value.trim()) message.value = link.dataset.prefill;
    if (link.id === 'request-estimate') { const name = document.querySelector('#contact-name'); if (name) name.focus({preventScroll: true}); }
}));
