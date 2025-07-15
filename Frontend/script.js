//const apiBaseUrl = "https://sudoku-solver-598q.onrender.com";
//const wsUrl = "wss://sudoku-solver-598q.onrender.com/ws/sudoku";
const apiBaseUrl = "http://localhost:8080";
const wsUrl = "ws://localhost:8080/ws/sudoku";
let socket;

let uniqueId;

function openWebSocket() {
    socket = new WebSocket(wsUrl);

    socket.onopen = function(event) {
        console.log("WebSocket is connected arf arf");
        markOpen();
    };

    socket.onmessage = function (event) {
        let str = event.data;
        if(str.startsWith("SessionId:")){
            uniqueId = str.split(":")[1];
        }
        else{
            processGrid(event);
        }
    };

        processGrid;

    socket.onerror = function(error) {
        console.log('WebSocket Error:', error);
    };

    socket.onclose = function(event) {
        console.log('WebSocket connection closed');
    };
}

function markOpen(){
    document.getElementById("status-circle").style.backgroundColor = "lightgreen";
    document.getElementById("status-label").textContent = "Ready :)";
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
    else if(doneString === "failed"){
        markRed();
    }

    if(doneString === "done" || doneString === "failed"){
        setTimeout(() => {
            enableMainButtons();
        }, 8100);
    }

}

function disableMainButtons(){
    const buttons = document.querySelectorAll('.mainButton');
    for(let button of buttons){
        button.disabled = true;
    }
}

function enableMainButtons(){
    const buttons = document.querySelectorAll('.mainButton');
    for(let button of buttons){
        button.disabled = false;
    }
}


function setupHoverInfo() {
    //info text for each hover over button, could perhaps change to make more detailed
    const buttonInfo = {
        'start-button': 'Click here for the program to start solving the sudoku',
        'clear-button': 'Click here to clear the grid',
        'random-button': 'Click here to generate a random solvable sudoku. There is a small chance that this process will be slow, so if that happens feel free to press it again to generate again faster.',
        'next-button': 'Click here to get the next part of the instructions',
        'sudokuGrid': 'Enter the sudoku values in this grid',
        'simple-widget': 'Find explanations in here',
        'status-container': "This will turn green once the website is ready to be used, until then it will be red",
        'instruction-container': "This box contains instructions"
    };
    const infoText = document.getElementById('infoText');

    //adding hover for every button
    Object.keys(buttonInfo).forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if(button){
            button.addEventListener('mouseenter', () => {
            infoText.textContent = buttonInfo[buttonId];
        });
        button.addEventListener('mouseleave', () => {
            infoText.textContent = 'Hover over anything to see information about it.';
        });
        }
    });
}

let instructions = ["Click here to get instructions", 
                    "This is a site that solves sudokus, enter the numbers into the grid as you would with a normal sudoku",
                    "Click solve to start the solving process, if the sudoku can be solved then it will solve it and light up green, if it cannot then it will light up red",
                    "Click clear to clear the grid of all the numbers",
                    "Click random to generate a random solvable sudoku",
                    "Have fun :)"];
let instructionNumber = 0;

function setInstructionInfo(){
    document.getElementById("instruction-text").textContent = instructions[instructionNumber];
    instructionNumber++;
    if(instructionNumber == instructions.length){
        instructionNumber = 0;
    }
    
}



function stringGridToGrid(stringGrid){
    let rows = stringGrid.split(" | ");

    let grid = [];

    rows.forEach(function(row) {
        let units = row.split(" ");

        grid.push(units);  // Use push to add rowArray to the grid
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
    const data = { 
        input: dataAsString,
        id: uniqueId
     };

    try {
        const response = await fetch(`${apiBaseUrl}/start-solving`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data), // Convert the payload to JSON
        });

        const result = await response.text(); // Extract result
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

    sentString = sentString.slice(0, sentString.length-3);
    sendToBackend(sentString);
    disableMainButtons();
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

    setupHoverInfo();

    setInstructionInfo();
}

window.onload = initialize;