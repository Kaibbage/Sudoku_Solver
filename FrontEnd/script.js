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
    let str = event.data;
    let twoPart = str.split("::");

    let stringGrid = twoPart[0];

    let grid = stringGridToGrid(stringGrid);

    updateUI(grid);

    let doneString = twoPart[1];
    if(doneString === "done"){
        markGreen();
    }
    if(doneString === "failed"){
        markRed();
    }
}

function stringGridToGrid(stringGrid){
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

    return grid;
}

function markGreen() {
    let delay = 0;
  
    for (let r = 8; r >= 0; r--) {
      for (let c = 8; c >= 0; c--) {
        setTimeout(() => {
          let cell = document.getElementById(`cell-${r}-${c}`);
  
          if (cell.style.backgroundColor !== "lightgrey") { // light grey in rgb
            cell.style.backgroundColor = "lightgreen";
          } else {
            cell.style.backgroundColor = "rgb(168, 187, 162)"; // Greyish Green
          }
        }, delay);
  
        delay += 100; // Delay for each cell
      }
    }
  
    // After all cells are set to light green, change to lighter green
    setTimeout(() => {
      for (let r = 8; r >= 0; r--) {
        for (let c = 8; c >= 0; c--) {
          let cell = document.getElementById(`cell-${r}-${c}`);
  
          if (cell.style.backgroundColor !== "rgb(168, 187, 162)") { // #A8BBA2 in rgb
            cell.style.backgroundColor = "#CCFFCC"; // Light green
          } else {
            cell.style.backgroundColor = "#C3D3BE"; // Lighter grey green
          }
        }
      }
    }, delay + 200); // Small extra delay to wait for the last cell
  
    // Show success message after everything
    setTimeout(() => {
      alert("Sudoku has been solved successfully");
    }, delay + 200);
  }
  

function markRed() {
    let delay = 0;
  
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        setTimeout(() => {
          let cell = document.getElementById(`cell-${r}-${c}`);
          cell.style.backgroundColor = 'rgb(255, 102, 102)';;
        }, delay);
  
        delay += 100; // Delay for each cell
      }
    }
  
    // After all cells are set to light green, change to lighter green
    setTimeout(() => {
      for (let r = 8; r >= 0; r--) {
            for (let c = 8; c >= 0; c--) {
                let cell = document.getElementById(`cell-${r}-${c}`);
                cell.style.backgroundColor ='rgb(255, 153, 153)'; // Lighter green
            }
        }
    }, delay + 200); // Small extra delay to wait for the last cell

    setTimeout(() => {
        alert("This sudoku cannot be solved");
      }, delay + 200);
}
  

function updateUI(grid){
    for(let r = 0; r < 9; r++){
        for(let c = 0; c < 9; c++){
            let cell = document.getElementById(`cell-${r}-${c}`);
            if(grid[r][c] !== "."){
                cell.value = grid[r][c];
            }
            else{
                cell.value = "";
            }
            
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

function setupInitialValues(){
    document.getElementById(`cell-${0}-${2}`).value = "3";
    document.getElementById(`cell-${0}-${3}`).value = "4";
    document.getElementById(`cell-${0}-${7}`).value = "5";
    document.getElementById(`cell-${1}-${0}`).value = "6";
    document.getElementById(`cell-${1}-${1}`).value = "5";
    document.getElementById(`cell-${1}-${7}`).value = "2";
    document.getElementById(`cell-${2}-${1}`).value = "9";
    document.getElementById(`cell-${2}-${4}`).value = "6";
    document.getElementById(`cell-${2}-${6}`).value = "3";
    document.getElementById(`cell-${2}-${8}`).value = "4";

    document.getElementById(`cell-${3}-${0}`).value = "5";
    document.getElementById(`cell-${3}-${3}`).value = "8";
    document.getElementById(`cell-${4}-${2}`).value = "7";
    document.getElementById(`cell-${4}-${6}`).value = "5";
    document.getElementById(`cell-${5}-${5}`).value = "1";
    document.getElementById(`cell-${5}-${8}`).value = "9";

    document.getElementById(`cell-${6}-${0}`).value = "1";
    document.getElementById(`cell-${6}-${2}`).value = "9";
    document.getElementById(`cell-${6}-${4}`).value = "7";
    document.getElementById(`cell-${6}-${7}`).value = "3";
    document.getElementById(`cell-${7}-${1}`).value = "6";
    document.getElementById(`cell-${7}-${7}`).value = "9";
    document.getElementById(`cell-${7}-${8}`).value = "7";
    document.getElementById(`cell-${8}-${1}`).value = "8";
    document.getElementById(`cell-${8}-${5}`).value = "3";
    document.getElementById(`cell-${8}-${6}`).value = "2";
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
                cell.style.backgroundColor = "lightgrey";
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
            cell.style.backgroundColor = "white";
        }
    }
}

async function randomize() {
    clearGrid();
    try {
        const response = await fetch(`${apiBaseUrl}/generate-random`, {
            method: "POST",
        });

        let stringGrid = await response.text(); // Extract result
        let grid = stringGridToGrid(stringGrid);
        updateUI(grid);

    } catch (error) {
        console.error("Error:", error);
        throw error; // Re-throw the error if needed
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
    
    setupInitialValues();

    document.addEventListener('keydown', (event) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
            handleArrowKeys(event);
        } else if (event.key === 'Backspace' || event.key === 'Delete') {
            handleDeleteBackspace(event);
        }
    });
}

window.onload = initialize;