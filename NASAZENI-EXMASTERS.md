# Nasazení redesignu treehouseweb.com na hosting Exmasters

> **Nic z tohoto postupu se neprovádí, dokud Jakub neřekne „jo“.** Do té doby je redesign jen náhled na GitHub Pages
> (`https://pokornyj423-code.github.io/treehouseweb-preview/`). Na doménu, DNS (Porkbun / Exmasters), poštu ani hosting se zatím nesahá.

## 1. Co v balíčku je

| Co | Kde | K čemu |
| --- | --- | --- |
| Náhled (statické HTML) | kořen repa: `index.html`, `estimate.html`, `references.html`, `privacy.html`, `legal-notice.html`, `terms.html`, `admin.html` | Běží na GitHub Pages bez PHP. Kalkulačka počítá v JS, odeslání formuláře se v náhledu jen zdvořile omluví (není tam `contact.php`). |
| **Šablony pro PHP hosting** | `php-ready/*.php` | Totéž, ale se **stejnými názvy souborů, odkazy (`…php?lang=cz`), formuláři, názvy polí (`name`/`id`), `action="contact.php"` a `data-pricing` / `data-translations`** jako původní web. |
| Nové styly a skripty | `assets/css/site.css`, `assets/js/fx.js`, `assets/js/nav.js`, `assets/js/scene.js`, `assets/js/calculator.js`, `assets/images/treehouseweb-mark-light.svg` | `site.css` je **nový** soubor, nepřepisuje `style.css` ani `brand-overrides.css`. `calculator.js` je původní skript s drobnými úpravami (viz níže). |

Načítá se z CDN (jsdelivr): Three.js 0.160, GSAP 3.12.5 a ScrollTrigger; fonty z Google Fonts (**Fraunces** display, **Manrope** text, **JetBrains Mono** štítky; latin-ext, `display=swap`, `preconnect`). Žádný build.

### Nové podstránky (kolo 2)

| Náhled | PHP hosting | Obsah |
| --- | --- | --- |
| `sluzby.html` | `php-ready/sluzby.php` | Tři služby z původního webu (Nový web / Starý kód, nový začátek / Na míru a správa), odkazy na balíčky |
| `normalni-web.html` | `php-ready/normalni-web.php` | Balíček 9 999 Kč: co obsahuje, co se počítá zvlášť (příplatky z kalkulačky) |
| `3d-web.html` | `php-ready/3d-web.php` | Balíček 15 999 Kč: co obsahuje, živá ukázka (přepínač času dne ovládá 3D scénu), srovnání s Normálním webem |
| `jak-pracujeme.html` | `php-ready/jak-pracujeme.php` | Tři kroky spolupráce z původního webu + principy |

Tyto čtyři stránky jsou **nové, bez serverového kódu** (čistá česká statika). Stačí je nahrát vedle ostatních; nic v PHP je nevyžaduje. Odkazy v hlavní navigaci a patičce všech šablon na ně míří (`sluzby.php?lang=cz` apod.), proto nové šablony nasazujte všechny najednou. Do EN/DE/ES verzí se nové stránky nepřekládaly.

Mobilní navigace je celoobrazovkové menu (`nav.js`): `aria-expanded`, focus trap, Esc, zamknutí scrollu. V `calculator.js` je původní kód mobilního menu zachován, ale vypíná se, je-li na `<html>` atribut `data-nav2` (nastavuje ho nová hlavička), takže původní šablony ostatních jazyků fungují dál.
Přechody mezi stránkami (wipe) a vlastní kurzor jsou v `fx.js` a při `prefers-reduced-motion` se vypínají.

## 2. Které části původního webu jsou PHP (serverový kód nemáme)

Stahovali jsme jen vykreslené HTML, takže PHP zdrojáky jsme neviděli. Z výstupu je ale poznat:

| Soubor | Co dělá |
| --- | --- |
| `index.php` | Úvodní stránka. Vybírá jazyk (`?lang=cz\|en\|de\|es`, uloženo v relaci `treehouse_session`), vypisuje texty podle jazyka, vkládá do formuláře skryté pole `csrf` a `form_token`. |
| `estimate.php` | Kalkulačka. Do atributů `data-pricing` (ceník, kurz, slevy) a `data-translations` (texty) vkládá data z konfigurace; pod kalkulačkou je stejný kontaktní formulář. |
| `contact.php` | Zpracuje poptávku (POST: `name, email, website, intent, message, privacy_acknowledged, estimate, csrf, form_token, lang`, honeypot `company_fax`), kontroluje CSRF a antispam, posílá e-mail, vrací JSON. Druhá funkce: `action=quote` ověří slevový kód (JSON). GET vrací „405 Method not allowed“, to je správně. |
| `admin.php` | Správa ceníku, měn, slev a slevových kódů (přihlášení hashem `TREEHOUSE_ADMIN_PASSWORD_HASH`). Bez nastaveného hesla ukazuje jen upozornění. |
| `references.php`, `privacy.php`, `legal-notice.php`, `terms.php` | Obsahové stránky, v podstatě jen šablona s textem podle jazyka (právní údaje se doplňují z prostředí hostingu, proto na webu zůstává „NENASTAVENO“). |

**Co jsme nezměnili ani nemohli měnit:** `contact.php`, `admin.php` (logika), session, odesílání e-mailu, ukládání ceníku. Nový design s nimi počítá, ale je jen vrstva HTML/CSS/JS.

## 3. Jak nový design napojit na původní PHP

Ceník kalkulačky (viz bod 4) a jazyky (bod 5) jsou jediná místa, kde je potřeba přemýšlet. Postup:

1. **Záloha** celého původního webu (bod 6) a stažení jeho PHP souborů lokálně, protože v nich jsou kusy kódu, které `php-ready` obsahuje jen jako zástupné značky.
2. **Zkopírujte nové assety** do `assets/` na serveru (jen **přidat**, nic nemazat):
   `assets/css/site.css`, `assets/js/fx.js`, `assets/js/nav.js`, `assets/js/scene.js`, `assets/images/treehouseweb-mark-light.svg`.
3. **Nahraďte** `assets/js/calculator.js` verzí z repa. Je to původní skript; změny jsou jen tyto (zpětně kompatibilní): zpracování odpovědi, která není JSON, ruční vyplnění zprávy z ceníkových tlačítek (`data-prefill`) a obsluha `[data-intent]` i na stránkách bez kalkulačky. Slevové kódy a odeslání formuláře volají dál `contact.php` stejně jako dřív, admin (řádky slevových kódů, mobilní menu, posuvník na referencích) funguje beze změny.
4. **Šablony stránek** `index.php`, `estimate.php`, `references.php`, `privacy.php`, `legal-notice.php`, `terms.php` a nové `sluzby.php`, `normalni-web.php`, `3d-web.php`, `jak-pracujeme.php`: vezměte soubory z `php-ready/` a v nich **nahraďte zástupné značky původním PHP kódem** z původních souborů:
   - `__CSRF__` (skryté pole `csrf` a `data-csrf` u kalkulačky) → původní výraz pro CSRF token,
   - `__FORM_TOKEN__` (skryté pole `form_token`) → původní výraz pro form token,
   - hodnota skrytého pole `lang` zůstává `cz`; u více jazyků ji nahraďte původním výrazem,
   - `data-pricing` a `data-translations` na `#estimator` v `estimate.php` mají vložené české hodnoty **s novými cenami**; na ostrém webu je nahraďte původním PHP, který je generuje z konfigurace ceníku (aby se ceny dál měnily v administraci).
5. **`admin.php` nechte původní.** `php-ready/admin.php` je jen vzhledově sladěná ukázka stavu „přístup není nastaven“ a postrádá administrační formuláře. Pokud admin zůstane se starým `style.css`, funguje dál. Proto `style.css` a `brand-overrides.css` **nemažte**.
6. **Ceník v `admin.php` na serveru je potřeba nastavit stejně jako v kalkulačce: Normální web 9 999 Kč a 3D web 15 999 Kč** (ostatní příplatky beze změny). Jinak bude `data-pricing` na ostrém webu (generované ze serveru) ukazovat staré ceny 1 000 / 18 000 Kč a kalkulačka by nesouhlasila s ceníkem na úvodní stránce.
7. **Odeslání formuláře** zůstává `POST contact.php`, pole se stejnými názvy. Až bude na serveru, formulář projde přesně jako dřív. V náhledu na GitHub Pages `contact.php` neexistuje, proto tam formulář zobrazí omluvu a e-mail `info@treehouseweb.com`.

### Cenová logika kalkulačky (jak jsme ji upravili)

Logika výpočtu je beze změny (`estimateLocally()` v `calculator.js` a stejná pole). Mění se jen výchozí ceny v ceníku:

| Klíč | Dřív | Teď | Poznámka |
| --- | --- | --- | --- |
| `simple` | 1 000 Kč | **9 999 Kč** | „Normální web“ |
| `website` | 18 000 Kč | **15 999 Kč** | „3D web“ |
| `combined` | 30 000 Kč | **27 999 Kč** | 3D web + migrace (15 999 + 12 000), stejný vzorec jako dřív |
| `migration` | 12 000 Kč | 12 000 Kč | zůstala, je to i příplatek „Migrace PHP“ |
| ostatní příplatky | | beze změny | stránka 1 800, doména 300, CMS 8 000, skripty 6 000, jazyk 4 500, texty 4 000, péče 1 500 |

Počet stránek v ceně zůstal po původu (jednoduchý web 1 stránka, ostatní 3). **K rozhodnutí Jakuba:** zda má Normální web za 9 999 Kč zahrnovat víc stránek (to by byla změna logiky v PHP i JS), a zda zůstává samostatná „Migrace PHP“ za 12 000 Kč.

## 4. Jazyky (CZ / EN / DE / ES)

Redesign je zatím **jen česky** (nové texty ceníku, hero, štítky). Přepínač jazyků je v `php-ready` zachován. Pro EN/DE/ES jsou dvě cesty:

- **Doporučeno do první verze:** původní šablony přejmenovat na např. `index-classic.php` apod. a v nových šablonách na začátku zavést: je-li jazyk jiný než `cz`, `include` původní šablony (vše ostatní zůstane jako dnes);
- nebo nové české texty (ceník, hero) přidat do původních jazykových polí a v šablonách je vypisovat z nich (víc práce, ale jednotné).

## 5. Postup nasazení (až po Jakubově „jo“)

1. **Záloha původního webu:** v správci souborů / přes FTP stáhnout celý adresář webu (`public_html` nebo odpovídající) do lokální složky s datem, např. `treehouseweb-zaloha-2026-11-XX`. Pokud Exmasters nabízí zálohy hostingu, vytvořit také zálohu tam. Stáhněte i soubory s nastavením ceníku a případně databázi (pokud ji web používá).
2. **Nejdřív do podsložky / testovací domény**, ne na ostrou: např. `treehouseweb.com/novy/` nebo subdoména, pokud ji Exmasters dovolí. Ověřit: úvodní stránka, `estimate.php` (výpočet, slevový kód), odeslání formuláře (jedna testovací poptávka e-mailem na `info@treehouseweb.com`), `admin.php`, právní stránky, mobil.
3. **Ostrý web:** po schválení nahrát podle bodu 3 (assety, `calculator.js`, nové `*.php`). Soubory nahrávat po jednom adresáři, `contact.php` a `admin.php` **nepřepisovat**.
4. **Zpět:** pokud by něco nefungovalo, nahrát zpátky zálohované soubory. Původní `style.css` a `brand-overrides.css` zůstávají, takže návrat je otázka vrácení několika `*.php` souborů.
5. Po nasazení zkontrolovat `?lang=en|de|es`, slevový kód, odeslání formuláře a v administraci nastavit ceník 9 999 / 15 999 Kč.

### Čeho se nedotýkat

- **DNS** (Porkbun, Exmasters), **A/AAAA záznamy**, **nameservery**.
- **MX záznamy a `mail.treehouseweb.com`**: přes ně chodí pošta, nesmí se změnit ani smazat.
- Nastavení domény, SSL certifikátu, e-mailových schránek a PHP verze na hostingu.
- Soubor `robots.txt` (HestiaCP ho generuje automaticky).

## 6. Známá omezení první verze

- Právní stránky obsahují původní texty a upozornění „NENASTAVENO“, protože údaje se doplňují v prostředí hostingu. Stránka `terms` byla upravena jen v cenách (1 000 Kč → 9 999 / 15 999 Kč); text by měl zkontrolovat Jakub.
- Ostatní jazyky viz bod 4.
- Náhled je označen `noindex`, ostrá verze (`php-ready`) má původní `canonical` a `hreflang` (bez `noindex`).
