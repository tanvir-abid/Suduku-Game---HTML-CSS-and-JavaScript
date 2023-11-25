function setInitialSelection() {
  const levelButtons = document.querySelectorAll('.level');
  let selectedLevel = '50'; // Default to 'Low' on page load

  // Set active class for 'Low' button and log its data-level value
  levelButtons.forEach(button => {
    if (button.dataset.level === selectedLevel) {
      button.classList.add('active');
      let difficultyLevelValue = selectedLevel/100;
      generateSudoku(difficultyLevelValue);
    }

    button.addEventListener('click', function() {
      // Remove active class from all buttons
      levelButtons.forEach(btn => btn.classList.remove('active'));

      // Add active class to the clicked button
      this.classList.add('active');

      // Get and log data-level value
      selectedLevel = this.getAttribute('data-level');
      let difficultyLevelValue = selectedLevel/100;
      generateSudoku(difficultyLevelValue);
    });
  });
}

document.addEventListener("DOMContentLoaded", setInitialSelection);
//-----------------------------------------------------------------//
// Generate suduku board//
//-----------------------------------------------------------------//
function generateSudoku(dLevel) {
    const grid = document.getElementById('sudokuGrid');
    grid.innerHTML = "";
    const sudoku = [];
    
    for (let i = 0; i < 9; i++) {
      const row = [];
      for (let j = 0; j < 9; j++) {
        row.push(0);
      }
      sudoku.push(row);
    }

    fillSudoku(sudoku);

    for (let block = 0; block < 9; block++) {
      const cellContainer = document.createElement('div');
      cellContainer.classList.add('cell-container');
      // Calculate the column number
      const column = block % 3 + 1;
      cellContainer.setAttribute('title', `Column ${column}`);

      for (let i = Math.floor(block / 3) * 3; i < Math.floor(block / 3) * 3 + 3; i++) {
        for (let j = (block % 3) * 3; j < (block % 3) * 3 + 3; j++) {
          const cell = document.createElement('div');
          cell.classList.add('sudoku-cell');
          cell.setAttribute("data-Number",block+1);
          
          if (Math.random() < dLevel) {
            cell.classList.add('empty-cell');
            const input = document.createElement('input');
            input.setAttribute('type', 'number');
            input.setAttribute('maxlength', '1'); // Limit input to one character
            input.classList.add('numeric-input');
            cell.appendChild(input);
          } else {
            cell.textContent = sudoku[i][j];
          }

          cellContainer.appendChild(cell);
        }
      }

      grid.appendChild(cellContainer);
    }

    // Event listener for contenteditable cells to accept only numbers
    const numericInputs = document.querySelectorAll('.numeric-input');
    numericInputs.forEach(input => {
      input.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, ''); 
        const inputValue = event.target.value;
        if (inputValue.length > 1) {
          event.target.value = inputValue.slice(0, 1); // Limit input to one character
        }
      });
    });
  }

  function fillSudoku(sudoku) {
    fillRecursive(sudoku);
  }

  function fillRecursive(sudoku) {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (sudoku[i][j] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValid(sudoku, i, j, num)) {
              sudoku[i][j] = num;
              if (fillRecursive(sudoku)) {
                return true;
              }
              sudoku[i][j] = 0;
            }
          }
          return false;
        }
      }
    }
    return true;
  }

  function isValid(sudoku, row, col, num) {
    for (let i = 0; i < 9; i++) {
      if (sudoku[row][i] === num || sudoku[i][col] === num) {
        return false;
      }
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (sudoku[startRow + i][startCol + j] === num) {
          return false;
        }
      }
    }
    return true;
  }

//------------------------------------------------------------//
// Generate results //
//------------------------------------------------------------//
function checkSudokuResult() {
const sudokuCells = document.querySelectorAll('.sudoku-cell');
const sudoku = [];
let hasEmptyCell = false; // Flag to check for empty cells

// Extract values from the grid
let row = [];
for (let i = 0; i < sudokuCells.length; i++) {
  if (i > 0 && i % 9 === 0) {
    sudoku.push(row);
    row = [];
  }
  const cell = sudokuCells[i];
  const input = cell.querySelector('input');
  const value = input ? input.value.trim() : cell.textContent.trim();
  if (!value) {
    hasEmptyCell = true;
    break; // Stop processing if an empty cell is found
  }
  row.push(parseInt(value) || 0);
}
sudoku.push(row); // Push the last row

// Check if there are any empty cells
if (hasEmptyCell) {
  setModalText("Warning", "Please fill all cells before checking.")
  return;
}

// Check rows, columns, and blocks for validity
let errorMessage = '';
for (let i = 0; i < 9; i++) {
  if (!isValidSet(sudoku[i])) {
    errorMessage = `The row ${i + 1} is incorrect. There are duplicate values or missing numbers.`;
    break;
  }
  if (!isValidSet(getColumn(sudoku, i))) {
    errorMessage = `The column ${i + 1} is incorrect. There are duplicate values or missing numbers.`;
    break;
  }
  if (!isValidBlock(sudoku, i)) {
    const blockRow = Math.floor(i / 3) * 3;
    const blockCol = (i % 3) * 3;
    errorMessage = `The block starting at row ${blockRow + 1} and column ${blockCol + 1} is incorrect. There are duplicate values or missing numbers.`;
    break;
  }
}

if (errorMessage) {
  setModalText("Oops!", errorMessage);
} else {
  setModalText("Congratulations!", "You solved the Sudoku puzzle correctly!");
}
}

// Rest of the code remains unchanged...


function isValidSet(arr) {
return new Set(arr.filter(num => num !== 0)).size === arr.filter(num => num !== 0).length;
}

function getColumn(matrix, col) {
return matrix.map(row => row[col]);
}

function isValidBlock(sudoku, block) {
const startRow = Math.floor(block / 3) * 3;
const startCol = (block % 3) * 3;
const blockValues = [];

for (let i = startRow; i < startRow + 3; i++) {
  for (let j = startCol; j < startCol + 3; j++) {
    blockValues.push(sudoku[i][j]);
  }
}

return isValidSet(blockValues);
}

document.getElementById("generateScore").addEventListener("click", checkSudokuResult);
//--------------------------------------------------------------------------------------//
// handle Modal //
//--------------------------------------------------------------------------------------//
// Get the modal element
const modal = document.getElementById('myModal');
const closeButton = document.getElementsByClassName('close')[0];

// Function to open the modal with animation
function openModal() {
  modal.style.display = 'block';
  setTimeout(() => {
    modal.style.opacity = '1';
    modal.getElementsByClassName('modal-content')[0].style.opacity = '1';
    modal.getElementsByClassName('modal-content')[0].style.transform = 'scale(1)';
  }, 50);
}

// Function to close the modal
function closeModal() {
  modal.style.opacity = '0';
  modal.getElementsByClassName('modal-content')[0].style.opacity = '0';
  modal.getElementsByClassName('modal-content')[0].style.transform = 'scale(0.7)';
  setTimeout(() => {
    modal.style.display = 'none';
  }, 300);
}

// Event listeners
closeButton.addEventListener('click', closeModal);
window.addEventListener('click', function(event) {
  if (event.target === modal) {
    closeModal();
  }
});

function setModalText(title,content){
  let header = document.querySelector(".modal-header h2");
  let body = document.querySelector(".modal-body");

  header.innerHTML = "";
  body.innerHTML = "";

  header.innerHTML = title;
  body.innerHTML = content;

  openModal();
}

//--------------------------------------------------------------------------------------//
// handle year of footer //
//--------------------------------------------------------------------------------------//
// Get current year and set it in the footer
const currentYear = new Date().getFullYear();
document.getElementById('currentYear').textContent = currentYear;
