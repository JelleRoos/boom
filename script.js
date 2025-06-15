document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const kolommen = 24, rijen = 24;
    let versleepbareType = null;
    let verplaatsteElement = null;

    // — 1) Grid aanmaken —
    function maakGrid() {
        grid.innerHTML = '';
        for (let r = 0; r < rijen; r++) {
            for (let c = 0; c < kolommen; c++) {
                const cel = document.createElement('div');
                cel.classList.add('grid-cel');
                cel.dataset.rij = r;
                cel.dataset.kol = c;
                cel.addEventListener('dragover', e => e.preventDefault());
                cel.addEventListener('drop', handleDrop);
                grid.appendChild(cel);
            }
        }
    }

    // — 2) Toolbox-templates sleepbaar maken —
    function initialiseerTemplates() {
        document.querySelectorAll('.kaart-template').forEach(tpl => {
            tpl.draggable = true;
            tpl.addEventListener('dragstart', e => {
                versleepbareType = e.target.dataset.type;
                verplaatsteElement = null;
                e.dataTransfer.setData('text/plain', versleepbareType);
            });
        });
    }

    // — 3) Bestaande kaarten verplaatsbaar maken —
    function initialiseerGrid() {
        grid.addEventListener('dragstart', e => {
            const k = e.target.closest('.kaart');
            if (k) {
                verplaatsteElement = k;
                e.dataTransfer.setData('text/plain', 'move');
            }
        });
    }

    // — 4) Drop-handler —
    function handleDrop(e) {
        e.preventDefault();
        const cel = e.currentTarget;
        // verplaats bestaand
        if (verplaatsteElement) {
            cel.appendChild(verplaatsteElement);
            verplaatsteElement = null;
            return;
        }
        // nieuw
        if (versleepbareType) {
            const kaart = maakKaart(versleepbareType);
            cel.appendChild(kaart);
            toonToast(`Kaart toegevoegd: ${typeBeschrijving(versleepbareType)}`);
            versleepbareType = null;
        }
    }

    // — 5) Kaart-element maken —
    function maakKaart(type) {
        const icoonMap = { wortel: '🌱', tak: '🌿', wolk: '☁️', emotie: '🔥' };
        const kaart = document.createElement('div');
        kaart.classList.add('kaart');
        kaart.draggable = true;
        kaart.style.animation = 'fadeInPop .4s ease';

        // ✖ Verwijderknop
        const btn = document.createElement('span');
        btn.classList.add('kaart-remove');
        btn.textContent = '✖';
        btn.addEventListener('click', () => {
            kaart.remove();
            toonToast('Kaart verwijderd');
        });
        kaart.appendChild(btn);

        // Icoon
        const icon = document.createElement('div');
        icon.classList.add('kaart-icon');
        icon.textContent = icoonMap[type] || '❔';
        kaart.appendChild(icon);

        // Tekstvlak (contenteditable)
        const txt = document.createElement('div');
        txt.classList.add('kaart-text');
        txt.setAttribute('contenteditable', 'true');
        txt.setAttribute('data-placeholder', 'Typ hier…');
        kaart.appendChild(txt);

        return kaart;
    }

    // — 6) Toon toast —
    function toonToast(msg) {
        const cont = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.classList.add('toast');
        t.textContent = msg;
        cont.appendChild(t);
        setTimeout(() => cont.removeChild(t), 3000);
    }

    // — 7) Leesbare typenamen —
    function typeBeschrijving(t) {
        const nm = {
            wortel: 'Wortelkaart',
            tak: 'Takkaart',
            wolk: 'Wolkkaart',
            emotie: 'Emotiekaart'
        };
        return nm[t] || 'Kaart';
    }

    // **Initialiseer alles**
    maakGrid();
    initialiseerTemplates();
    initialiseerGrid();
});
