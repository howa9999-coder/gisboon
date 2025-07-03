//==========================================================asideContent = active Content

const analyseBtn = document.querySelector("#analyse-btn")
const dataBtn = document.querySelector("#data-btn")
const helpBtn = document.querySelector("#help-btn")
const helpContent = document.querySelector(".help-content")
const dataContent = document.querySelector(".data-content")
const analyseContent = document.querySelector(".analyse-content")
const headerBtns = document.querySelectorAll('.header-btn')

function asideContent(block, none1, none2){
      block.style.display = 'block';
      none1.style.display = 'none';
      none2.style.display = 'none';
}

analyseBtn.addEventListener('click', ()=>{asideContent(analyseContent, dataContent, helpContent)})
dataBtn.addEventListener('click', ()=>{asideContent(dataContent, helpContent, analyseContent)})
helpBtn.addEventListener('click', ()=>{asideContent(helpContent, dataContent, analyseContent)})
headerBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const currentActive = document.querySelector('.header-btn.active');
    if (currentActive) {
      currentActive.classList.remove('active');
    }
    btn.classList.add('active');
  });
});
//=============================================================Toggle function

function toggleContent(contentID) {
    const container = document.getElementById(contentID);
    container.classList.toggle("hidden");
}
//=============================================================Full screen
const full = document.querySelector(".full")
const windowed = document.querySelector(".windowed")
const screenState = document.querySelector('.screen-state')
screenState.addEventListener('click', () => togglebtn(full, windowed));
//todo use toggleContent function instead
function togglebtn(svg1, svg2){
    if (svg1.style.display === 'none') {
        svg1.style.display = 'inline';
        svg2.style.display = 'none';
    } else {
        svg1.style.display = 'none';
        svg2.style.display = 'inline';
    }
}
const body = document.querySelector('body')
function toggleFullScreen() {
  if (!document.fullscreenElement) {
    // If not in fullscreen, enter fullscreen
    document.body.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    });
  } else {
    // If already in fullscreen, exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
//=============================Popup functions

function addColumn() {
    const headerRow = document.querySelector('#headerRow');
    if (!headerRow) return;
    const colIndex = headerRow.cells.length - 1;
    const newHeader = document.createElement('th');
    newHeader.innerHTML = `<input type="text" placeholder="Column ${colIndex + 1}" oninput="renameHeader(this, ${colIndex})">`;
    headerRow.insertBefore(newHeader, headerRow.lastElementChild);
    const rows = document.querySelectorAll('#popupTable tbody tr');
    rows.forEach(row => {
      const newCell = document.createElement('td');
      newCell.contentEditable = "true";
      row.insertBefore(newCell, row.lastElementChild);
    });
  }

   function renameHeader(input, index) {
    input.placeholder = input.value || `Column ${index + 1}`;
  }

