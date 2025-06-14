// Instellingen voor het grid
const grid = document.getElementById('grid');
const kolommen = 24;
const rijen = 12;

// Genereer het grid met lege cellen
function maakGrid() {
    for (let rij = 0; rij < rijen; rij++) {
        for (let kol = 0; kol < kolommen; kol++) {
            const cel = document.createElement('div');
            cel.classList.add('grid-cel');
            cel.dataset.rij = rij;
            cel.dataset.kol = kol;
            grid.appendChild(cel);
        }
    }
}

// Start de tool
document.addEventListener('DOMContentLoaded', () => {
    maakGrid();
});

// Drag & drop logica
let versleepbareKaart = null;

// Maak de template sleepbaar
document.querySelectorAll('.kaart-template').forEach(template => {
    template.addEventListener('dragstart', e => {
        versleepbareKaart = e.target.dataset.type;
        e.dataTransfer.setData('text/plain', versleepbareKaart);
    });

    // Maak element officieel sleepbaar
    template.setAttribute('draggable', true);
});

// Sta toe dat je iets op een cel dropt
grid.querySelectorAll('.grid-cel').forEach(cel => {
    cel.addEventListener('dragover', e => e.preventDefault());

    cel.addEventListener('drop', e => {
        e.preventDefault();
        if (!versleepbareKaart) return;

        const kaart = document.createElement('div');
        kaart.classList.add('kaart');
        kaart.textContent = '🌱'; // of een echte iconenverwerking
        kaart.setAttribute('contenteditable', 'true');

        kaart.style.animation = 'fadeInPop 0.4s ease';
        cel.appendChild(kaart);

        versleepbareKaart = null;
    });
});
