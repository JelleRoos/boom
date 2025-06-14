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
