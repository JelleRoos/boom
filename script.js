document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById('grid');
    const kolommen = 24;
    const rijen = 24;
    let versleepbareType = null;
    let verplaatsteElement = null;
    let lastBgFile = null;

    // Controls & modals
    const btnOpenImport = document.getElementById('btn-open-import');
    const btnOpenExport = document.getElementById('btn-open-export');
    const btnScreenshot = document.getElementById('btn-screenshot');
    const bgUpload = document.getElementById('bg-upload');
    const bgReset = document.getElementById('bg-reset');
    const inputJsonFile = document.getElementById('import-json-file');
    const inputJsonName = document.getElementById('import-json-name');
    const inputBgFile = document.getElementById('import-bg-file');
    const inputBgName = document.getElementById('import-bg-name');
    const cbExportJson = document.getElementById('export-json-cb');
    const cbExportBg = document.getElementById('export-bg-cb');
    const btnDoImport = document.getElementById('do-import');
    const btnDoExport = document.getElementById('do-export');
    const backdrop = document.getElementById('modal-backdrop');
    const modalImport = document.getElementById('modal-import');
    const modalExport = document.getElementById('modal-export');
    const closeBtns = document.querySelectorAll('.modal-close');

    // 1) Grid aanmaken
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

    // 2) Toolbox drag-start
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

    // 3) Kaart-verplaatsing binnen grid
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
        if (verplaatsteElement) {
            cel.appendChild(verplaatsteElement);
            verplaatsteElement = null;
            return;
        }
        if (versleepbareType) {
            const kaart = maakKaart(versleepbareType);
            cel.appendChild(kaart);
            toonToast(`Kaart toegevoegd: ${typeBeschrijving(versleepbareType)}`);
            versleepbareType = null;
        }
    }

    // 5) Kaart-factory
    function maakKaart(type) {
        const icoonMap = { wortel: '🌱', tak: '🌿', wolk: '☁️', boom: '🌳' };
        const kaart = document.createElement('div');
        kaart.classList.add('kaart', `kaart--${type}`);
        kaart.draggable = true;
        kaart.style.animation = 'fadeInPop .4s ease';

        // verwijderknop
        const btn = document.createElement('span');
        btn.classList.add('kaart-remove');
        btn.textContent = '✖';
        btn.addEventListener('click', () => {
            kaart.remove();
            toonToast('Kaart verwijderd');
        });
        kaart.appendChild(btn);

        // icoon
        const ic = document.createElement('div');
        ic.classList.add('kaart-icon');
        ic.textContent = icoonMap[type] || '❔';
        kaart.appendChild(ic);

        // tekstvlak
        const txt = document.createElement('div');
        txt.classList.add('kaart-text');
        txt.setAttribute('contenteditable', 'true');
        txt.setAttribute('data-placeholder', 'Typ hier…');
        kaart.appendChild(txt);

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

    // 7) typeBeschrijving
    function typeBeschrijving(t) {
        const names = { wortel: 'Wortelkaart', tak: 'Takkaart', wolk: 'Wolkkaart', boom: 'Boomkaart' };
        return names[t] || 'Kaart';
    }

    // 8) Achtergrond upload/reset
    bgUpload.addEventListener('change', e => {
        const f = e.target.files[0];
        if (f) {
            lastBgFile = f;
            const url = URL.createObjectURL(f);
            grid.style.backgroundImage = `url(${url})`;
        }
    });
    bgReset.addEventListener('click', () => {
        lastBgFile = null;
        grid.style.backgroundImage = ''; // valt terug op CSS default
    });

    // 9) Modals open/close
    function openModal(m) { backdrop.classList.remove('hidden'); m.classList.remove('hidden'); }
    function closeModal() {
        backdrop.classList.add('hidden');
        modalImport.classList.add('hidden');
        modalExport.classList.add('hidden');
        inputJsonFile.value = '';
        inputBgFile.value = '';
        inputJsonName.textContent = 'Geen bestand gekozen';
        inputBgName.textContent = 'Geen bestand gekozen';
    }
    btnOpenImport.addEventListener('click', () => openModal(modalImport));
    btnOpenExport.addEventListener('click', () => openModal(modalExport));
    closeBtns.forEach(b => b.addEventListener('click', closeModal));
    backdrop.addEventListener('click', closeModal);

    // 10) Import
    btnDoImport.addEventListener('click', () => {
        const jf = inputJsonFile.files[0];
        if (jf) {
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
                } catch {
                    toonToast('Fout in JSON');
                }
            };
            reader.readAsText(jf);
        }
        const bf = inputBgFile.files[0];
        if (bf) {
            lastBgFile = bf;
            const url = URL.createObjectURL(bf);
            grid.style.backgroundImage = `url(${url})`;
        }
        closeModal();
    });

    // 11) Export
    btnDoExport.addEventListener('click', () => {
        if (cbExportJson.checked) {
            const data = [];
            document.querySelectorAll('.grid-cel>.kaart').forEach(k => {
                const { rij, kol } = k.parentElement.dataset;
                const type = ['wortel', 'tak', 'wolk', 'boom'].find(t => k.classList.contains(`kaart--${t}`)) || '';
                const text = k.querySelector('.kaart-text').textContent;
                data.push({ type, rij: +rij, kol: +kol, text });
            });
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const a = document.createElement('a');
            a.download = 'boom-config.json';
            a.href = URL.createObjectURL(blob);
            a.click();
            URL.revokeObjectURL(a.href);
        }
        if (cbExportBg.checked) {
            if (lastBgFile) {
                const a = document.createElement('a');
                a.download = lastBgFile.name;
                a.href = URL.createObjectURL(lastBgFile);
                a.click();
                URL.revokeObjectURL(a.href);
            } else {
                toonToast('Geen achtergrond geüpload');
            }
        }
        closeModal();
    });

    // 12) Screenshot
    btnScreenshot.addEventListener('click', () => {
        html2canvas(document.getElementById('grid')).then(canvas => {
            canvas.toBlob(blob => {
                const a = document.createElement('a');
                a.download = 'mijn-boom.png';
                a.href = URL.createObjectURL(blob);
                a.click();
                URL.revokeObjectURL(a.href);
            });
        });
    });

    // Init
    maakGrid();
    initialiseerTemplates();
    initialiseerGrid();
});
