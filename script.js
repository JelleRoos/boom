document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const kolommen = 24, rijen = 24;
    let versleepbareType = null, verplaatsteElement = null;

    // 1) Maak grid
    function maakGrid() {
        grid.innerHTML = '';
        for (let r = 0; r < rijen; r++) {
            for (let c = 0; c < kolommen; c++) {
                const cel = document.createElement('div');
                cel.classList.add('grid-cel');
                cel.dataset.rij = r; cel.dataset.kol = c;
                cel.addEventListener('dragover', e => e.preventDefault());
                cel.addEventListener('drop', handleDrop);
                grid.appendChild(cel);
            }
        }
    }

    // 2) Toolbox sleepbaar maken
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

    // 3) Bestaande kaarten verplaatsbaar maken
    function initialiseerGrid() {
        grid.addEventListener('dragstart', e => {
            const k = e.target.closest('.kaart');
            if (k) {
                verplaatsteElement = k;
                e.dataTransfer.setData('text/plain', 'move');
            }
        });
    }

    // 4) Drop-handler
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

    // 5) Kaart-element maken
    function maakKaart(type) {
        const icoon = { wortel: '🌱', tak: '🌿', wolk: '☁️', emotie: '🔥' }[type] || '❔';
        const kaart = document.createElement('div');
        kaart.classList.add('kaart');
        kaart.draggable = true;

        // Remove-knop
        const btn = document.createElement('span');
        btn.classList.add('kaart-remove');
        btn.textContent = '✖';
        btn.addEventListener('click', () => {
            kaart.remove();
            toonToast('Kaart verwijderd');
        });
        kaart.appendChild(btn);

        // Icoon
        const ic = document.createElement('div');
        ic.classList.add('kaart-icon');
        ic.textContent = icoon;
        kaart.appendChild(ic);

        // Tekstblok (contenteditable)
        const txt = document.createElement('div');
        txt.classList.add('kaart-text');
        txt.setAttribute('contenteditable', 'true');
        txt.setAttribute('data-placeholder', 'Typ hier…');
        kaart.appendChild(txt);

        // scaling (optioneel)
        kaart.dataset.scale = 1;
        kaart.addEventListener('wheel', e => {
            e.preventDefault();
            let s = parseFloat(kaart.dataset.scale);
            s = Math.min(Math.max(s + (e.deltaY < 0 ? .1 : -.1), .5), 2);
            kaart.dataset.scale = s;
            kaart.style.transform = `scale(${s})`;
        });

        return kaart;
    }

    // 6) Toast
    function toonToast(msg) {
        const cont = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.classList.add('toast');
        t.textContent = msg;
        cont.appendChild(t);
        setTimeout(() => cont.removeChild(t), 3000);
    }

    // 7) Naam naar leesbare tekst
    function typeBeschrijving(t) {
        return { wortel: 'Wortelkaart', tak: 'Takkaart', wolk: 'Wolkkaart', emotie: 'Emotiekaart' }[t] || 'Kaart';
    }

    maakGrid();
    initialiseerTemplates();
    initialiseerGrid();
});
