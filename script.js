function createSudokuGrid() {
    const grid = document.getElementById("sudokuGrid");
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            const cell = document.createElement("input");
            cell.type = "text";
            cell.classList.add("cell");
            cell.id = `cell-${row}-${col}`;
            cell.maxLength = 1;
            grid.appendChild(cell);
        }
    }
}

function startSolve(){
    let sentString = "";
    for(let row = 0; row < 9; row++){
        for(let col = 0; col < 9; col++){
            let cell = document.getElementById(`cell-${row}-${col}`);
            let valAsString = cell.value;

            if(isNaN(valAsString) || valAsString.length === 0){
                sentString += ". "
            }
            else{
                sentString += valAsString + " ";
            }
        }
        sentString += "| "
    }
    sentString += " ";
    console.log(sentString);
}

// Handle arrow key movement between cells
function handleArrowKeys(event) {
    const focusedElement = document.activeElement;
    const currentId = focusedElement.id;
    const match = currentId.match(/^cell-(\d)-(\d)$/);
            
    if (match) {
        let row = parseInt(match[1]);
        let col = parseInt(match[2]);
        let nextCell = null;

        switch (event.key) {
            case 'ArrowLeft':
                if (col > 0) {
                    nextCell = document.getElementById(`cell-${row}-${col - 1}`);
                }
                else if (row > 0) {
                    nextCell = document.getElementById(`cell-${row - 1}-8`);
                }
                break;
            case 'ArrowRight':
                if (col < 8) {
                    nextCell = document.getElementById(`cell-${row}-${col + 1}`);
                }
                else if (row < 8) {
                    nextCell = document.getElementById(`cell-${row + 1}-0`);
                }
                break;
            case 'ArrowUp':
                if (row > 0) {
                    nextCell = document.getElementById(`cell-${row - 1}-${col}`);
                }
                break;
            case 'ArrowDown':
                if (row < 8) {
                    nextCell = document.getElementById(`cell-${row + 1}-${col}`);
                }
                break;
            }

        if (nextCell) {
            nextCell.focus();
        }
    }
}

// Handle Backspace and Delete behavior
function handleDeleteBackspace(event) {
    const focusedElement = document.activeElement;
    const currentId = focusedElement.id;
    const match = currentId.match(/^cell-(\d)-(\d)$/);

    if (match) {
        let row = parseInt(match[1]);
        let col = parseInt(match[2]);
        let nextCell = null;

        // If Backspace is pressed
        if (event.key === 'Backspace') {
            focusedElement.value = ''; // Clear the current cell
            if (col > 0) {
                nextCell = document.getElementById(`cell-${row}-${col - 1}`);
            }
            else if (row > 0) {
                nextCell = document.getElementById(`cell-${row - 1}-8`);
            }
        }
        // If Delete is pressed
        else if (event.key === 'Delete') {
            focusedElement.value = ''; // Clear the current cell
            if (row > 0) {
                nextCell = document.getElementById(`cell-${row - 1}-${col}`);
            }
        }

        // Move to the previous cell if valid
        if (nextCell) {
            nextCell.focus();
        }
    }
}

function initialize() {
     createSudokuGrid();

    // Add event listeners for arrow keys and Backspace/Delete
    document.addEventListener('keydown', (event) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            handleArrowKeys(event);
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
                    handleDeleteBackspace(event);
        }
    });
}


window.onload = initialize;
