const apiBaseUrl = "http://localhost:8080";
const wsUrl = "ws://localhost:8080/ws/sudoku";
let socket;

 function openWebSocket() {
     socket = new WebSocket(wsUrl);

     socket.onopen = function(event) {
         console.log("WebSocket is connected arf arf");
     };

     socket.onmessage = processGrid;

     socket.onerror = function(error) {
         console.log('WebSocket Error:', error);
     };

     socket.onclose = function(event) {
         console.log('WebSocket connection closed');
     };
 }

 function processGrid(event) {
    let stringGrid = event.data;

    let rows = stringGrid.split(" | ");

    let grid = [];

    rows.forEach(function(row) {
        let units = row.split(" ");
        
        let rowArray = [];  // Renaming to rowArray to avoid conflict with outer row variable
        units.forEach(function(unit) {
            rowArray.push(unit);  // Use push to add elements to the array
        });
        grid.push(rowArray);  // Use push to add rowArray to the grid
    });

    console.log(grid);
    updateUI(grid);
}

function updateUI(grid){
    for(let r = 0; r < 9; r++){
        for(let c = 0; c < 9; c++){
            let cell = document.getElementById(`cell-${r}-${c}`);
            cell.value = grid[r][c];
        }
    }
}


async function sendToBackend(dataAsString) {
    const data = { input: dataAsString };

    try {
        const response = await fetch(`${apiBaseUrl}/start-solving`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data), // Convert the payload to JSON
        });

        const result = await response.text(); // Extract result
        console.log(result);
        return result; // Return the result

    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error if needed
    }
}

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

function startSolve() {
    let sentString = "";
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let cell = document.getElementById(`cell-${row}-${col}`);
            let valAsString = cell.value;

            if (isNaN(valAsString) || valAsString.length === 0) {
                sentString += ". ";
            } else {
                sentString += valAsString + " ";
            }
        }
        sentString += "| ";
    }
    sentString += " ";
    console.log(sentString);
    sendToBackend(sentString);
}

function clearGrid() {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            let cell = document.getElementById(`cell-${row}-${col}`);
            cell.value = '';
        }
    }
}

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
                } else if (row > 0) {
                    nextCell = document.getElementById(`cell-${row - 1}-8`);
                }
                break;
            case 'ArrowRight':
                if (col < 8) {
                    nextCell = document.getElementById(`cell-${row}-${col + 1}`);
                } else if (row < 8) {
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

function handleDeleteBackspace(event) {
    const focusedElement = document.activeElement;
    const currentId = focusedElement.id;
    const match = currentId.match(/^cell-(\d)-(\d)$/);

    if (match) {
        let row = parseInt(match[1]);
        let col = parseInt(match[2]);
        let nextCell = null;

        if (event.key === 'Backspace') {
            focusedElement.value = '';
            if (col > 0) {
                nextCell = document.getElementById(`cell-${row}-${col - 1}`);
            } else if (row > 0) {
                nextCell = document.getElementById(`cell-${row - 1}-8`);
            }
        } else if (event.key === 'Delete') {
            focusedElement.value = '';
            if (row > 0) {
                nextCell = document.getElementById(`cell-${row - 1}-${col}`);
            }
        }

        if (nextCell) {
            nextCell.focus();
        }
    }
}

function initialize() {
    openWebSocket();

    createSudokuGrid();

    document.addEventListener('keydown', (event) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            handleArrowKeys(event);
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
            handleDeleteBackspace(event);
        }
    });
}

window.onload = initialize;