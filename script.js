document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const kolommen = 24, rijen = 24;
    let versleepbareType = null;
    let verplaatsteElement = null;

    // 1) Maak het 24×24-grid aan
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

    // 2) Toolbox-templates sleepbaar maken
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

    // 4) Drop-handler: nieuw of verplaats bestaand
    function handleDrop(e) {
        e.preventDefault();
        const cel = e.currentTarget;

        // Verplaats bestaande kaart
        if (verplaatsteElement) {
            cel.appendChild(verplaatsteElement);
            verplaatsteElement = null;
            return;
        }

        // Maak nieuwe kaart
        if (versleepbareType) {
            const kaart = maakKaart(versleepbareType);
            cel.appendChild(kaart);
            toonToast(`Kaart toegevoegd: ${typeBeschrijving(versleepbareType)}`);
            versleepbareType = null;
        }
    }

    // 5) Factory: maak een kaart-div op basis van type
    function maakKaart(type) {
        const icoonMap = { wortel: '🌱', tak: '🌿', wolk: '☁️', boom: '🌳' };

        const kaart = document.createElement('div');
        kaart.classList.add('kaart', `kaart--${type}`);
        kaart.draggable = true;
        kaart.style.animation = 'fadeInPop .4s ease';

        // Verwijderknop
        const btn = document.createElement('span');
        btn.classList.add('kaart-remove');
        btn.textContent = '✖';
        btn.addEventListener('click', () => {
            kaart.remove();
            toonToast('Kaart verwijderd');
        });
        kaart.appendChild(btn);

        // Icoon
        const iconDiv = document.createElement('div');
        iconDiv.classList.add('kaart-icon');
        iconDiv.textContent = icoonMap[type] || '❔';
        kaart.appendChild(iconDiv);

        // Tekstvlak (contenteditable)
        const txtDiv = document.createElement('div');
        txtDiv.classList.add('kaart-text');
        txtDiv.setAttribute('contenteditable', 'true');
        txtDiv.setAttribute('data-placeholder', 'Typ hier…');
        kaart.appendChild(txtDiv);

        return kaart;
    }

    // 6) Toon toast-melding
    function toonToast(msg) {
        const cont = document.getElementById('toast-container');
        const t = document.createElement('div');
        t.classList.add('toast');
        t.textContent = msg;
        cont.appendChild(t);
        setTimeout(() => cont.removeChild(t), 3000);
    }

    // 7) Converteer type naar leesbare naam
    function typeBeschrijving(t) {
        const namen = {
            wortel: 'Wortelkaart',
            tak: 'Takkaart',
            wolk: 'Wolkkaart',
            boom: 'Boomkaart'
        };
        return namen[t] || 'Kaart';
    }

    // 8) Achtergrond uploaden/resetten op het grid
    const bgUpload = document.getElementById('bg-upload');
    const bgReset = document.getElementById('bg-reset');

    bgUpload.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        grid.style.backgroundImage = `url(${url})`;
        grid.style.backgroundSize = 'contain';
        grid.style.backgroundPosition = 'center';
        grid.style.backgroundRepeat = 'no-repeat';
    });

    bgReset.addEventListener('click', () => {
        grid.style.backgroundImage = '';
    });

    // 9) Export JSON
    document.getElementById('export-json').addEventListener('click', () => {
        const data = [];
        document.querySelectorAll('.grid-cel > .kaart').forEach(k => {
            const { rij, kol } = k.parentElement.dataset;
            const type = ['wortel', 'tak', 'wolk', 'boom'].find(t => k.classList.contains(`kaart--${t}`)) || '';
            const text = k.querySelector('.kaart-text').textContent;
            data.push({ type, rij: +rij, kol: +kol, text });
        });
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.download = 'boom-config.json';
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
    });

    // 10) Import JSON
    document.getElementById('import-json').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            try {
                const data = JSON.parse(reader.result);
                maakGrid();
                data.forEach(item => {
                    const cel = grid.querySelector(`.grid-cel[data-rij="${item.rij}"][data-kol="${item.kol}"]`);
                    if (!cel) return;
                    const kaart = maakKaart(item.type);
                    kaart.querySelector('.kaart-text').textContent = item.text;
                    cel.appendChild(kaart);
                });
            } catch (err) {
                console.error('Import error:', err);
                toonToast('Fout bij importeren JSON');
            }
        };
        reader.readAsText(file);
    });

    // Initialize everything
    maakGrid();
    initialiseerTemplates();
    initialiseerGrid();
});
