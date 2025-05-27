
let WIDH = 800;
let HEIGHT = 800;
let gWIDH;
let gHEIGHT;
let PTOMM = 0.352778;
let SSIZE = 1;

let paths;
let fullBox = [];
let letters = [];
let kx; 
let ky;

function getPoints(src){
  
  let ret = [];
  let retP = 0;
  let buffer = [];
  
  let bp = 0;
 
  for(let i = 0; i < src.length; i++){
    if(src[i] == ' '){
      let x_s = buffer.join("");
      ret[retP] = {};
      ret[retP].x = parseFloat(x_s);
      buffer = [];
      bp = 0;
    } else if((src[i] == "L") || (i == src.length -1)){
      let y_s = buffer.join("");
      ret[retP].y = parseFloat(y_s);
      retP += 1;
      buffer = [];
      bp = 0;
    }else{
      buffer[bp] = src[i];
      bp += 1;
    }
  }
  return ret;
}

function translateZero(){
  let ox = fullBox[0].x;
  let oy = fullBox[0].y;
  for(let i = 0; i < paths.length; i++){
    for(let j = 0; j < paths[i].points.length; j++){
      paths[i].points[j].x -= ox;
      paths[i].points[j].y -= oy;
    }
  }

  for(let i = 0; i < 4; i++){
    fullBox[i].x -= ox;
    fullBox[i].y -= oy;
  }
}



function getFullBox(){
  let maX = paths[0].points[0].x;
  let maY = paths[0].points[0].y;
  let miX = maX;
  let miY = maY;
  for(let i = 0; i < paths.length; i++){
    for(let j = 0; j < paths[i].points.length; j++){
      let point = paths[i].points[j];
      if(maX < point.x){
        maX = point.x;
      }
      if(miX > point.x){
        miX = point.x;
      }
      if(maY < point.y){
        maY = point.y;
      }
      if(miY > point.y){
        miY = point.y;
      }
    }
  }
  fullBox = [{x: miX, y: miY}, {x: maX, y: miY}, {x: maX, y: maY}, {x: miX, y: maY}];
  gWIDH = maX - miX;
  gHEIGHT = maY - miY;

  HEIGHT = (WIDH*gHEIGHT)/gWIDH;

  resizeCanvas(WIDH, HEIGHT);
  
}

function getBoxes(){
  for(let i = 0; i < paths.length; i++){
    let maX = paths[i].points[0].x;
    let maY = paths[i].points[0].y;
    let miX = maX;
    let miY = maY;
    for(let j = 0; j < paths[i].points.length; j++){
      let point = paths[i].points[j];
      if(maX < point.x){
        maX = point.x;
      }
      if(miX > point.x){
        miX = point.x;
      }
      if(maY < point.y){
        maY = point.y;
      }
      if(miY > point.y){
        miY = point.y;
      }
    }
    paths[i].oBox = [{x: miX, y: miY}, {x: maX, y: miY}, {x: maX, y: maY}, {x: miX, y: maY}];
  }
}

function checkBoxes(){
  for(let i = 0; i < paths.length; i++){
    paths[i].isOl = true;
    let s = paths[i].oBox[0];
    
    for(let j = 0; j < paths.length; j++){
      if(i != j){
        if((s.x > paths[j].oBox[0].x) && (s.x < paths[j].oBox[2].x) && (s.y > paths[j].oBox[0].y) && (s.y < paths[j].oBox[2].y)){
          paths[i].isOl = false;
          paths[i].parIdx = j;
        }
      }
    }
  }
}

function getLetters(){
  letters = [];

  for(let i = 0; i < paths.length; i++){
    let path = paths[i];
    if(path.isOl){
      let nLetter = {};
      nLetter.oBox = path.oBox;
      nLetter.points = path.points;
      nLetter.children = [];
      nLetter.lines = [];
      for(let j = 0; j < paths.length; j++){
        if(i != j){
          if((paths[j].isOl != true) && (paths[j].parIdx == i)){
            let nChild = {};
            nChild.oBox = paths[j].oBox;
            nChild.points = paths[j].points;
            nLetter.children.push(nChild);
          }
        }
      }
      letters.push(nLetter);
    }
  }

}

function getOlParts(letter, xVal){
  let ret = [];
  for(let i = 0; i < letter.points.length - 1; i++){
    let a = letter.points[i];
    let b = letter.points[i + 1];
    if(((xVal > a.x) && (xVal < b.x)) || ((xVal > b.x) && (xVal < a.x))){
      nPart = {},
      nPart.s = a;
      nPart.e = b;
      ret.push(nPart);
    }
  }

  for(let i = 0; i < letter.children.length; i++){
    for(let j = 0; j < letter.children[i].points.length - 1; j++){
      let a = letter.children[i].points[j];
      let b = letter.children[i].points[j + 1];
      if(((xVal > a.x) && (xVal < b.x)) || ((xVal > b.x) && (xVal < a.x))){
      nPart = {},
      nPart.s = a;
      nPart.e = b;
      ret.push(nPart);
    }
    }

  }

  ret.sort((a, b) => {
    return a.s.y - b.s.y;
  } )
  return ret;
}



function getCrossPointY(ax, ay, ex, ey, x){
  let a = (ey-ay)/(ex-ax);
  let b = x - ax
  return (a*b) + ay;
}

function generateLines(){
  for(let i = 0; i < letters.length; i++){
    let letter = letters[i];
    let dx = SSIZE * 0.7;
    let nSegs = ((letter.oBox[1].x - letter.oBox[0].x) / dx) - 1;
    for(let j = 0; j < nSegs; j++){
      let x = letter.oBox[0].x + ((j + 1) * dx);
      let parts = getOlParts(letter, x);
      
      for(let k = 0; k < parts.length - 1; k+=2){
        let nLine = {s: {}, e: {}};
        nLine.s.x = x
        nLine.e.x = x

        nLine.s.y = getCrossPointY(parts[k].s.x, parts[k].s.y, parts[k].e.x, parts[k].e.y, x) + dx/2;
        nLine.e.y = getCrossPointY(parts[k+1].s.x, parts[k+1].s.y, parts[k+1].e.x, parts[k+1].e.y, x) - dx/2;
        letters[i].lines.push(nLine);
      }
    }
  }

  saveButton.removeAttribute("hidden");

}



function makeDxf(){
  let dxf = "  0\nSECTION\n  2\nENTITIES\n";
  for(let i = 0; i < letters.length; i++){
    dxf = dxf.concat("  0\nPOLYLINE\n  8\n0\n  66\n1\n  70\n1\n  62\n7\n");
    for(let j = 0; j < letters[i].points.length; j++){
      dxf = dxf.concat("  0\nVERTEX\n  8\n0\n  10\n", letters[i].points[j].x.toString(), "\n  20\n", letters[i].points[j].y.toString(), "\n");
    }
    dxf = dxf.concat("  0\nSEQEND\n");
    //children
    for(let j = 0; j < letters[i].children.length; j++){
      dxf = dxf.concat("  0\nPOLYLINE\n  8\n0\n  66\n1\n  70\n1\n  62\n7\n");
      for(let k = 0; k < letters[i].children[j].points.length; k++){
        dxf = dxf.concat("  0\nVERTEX\n  8\n0\n  10\n", letters[i].children[j].points[k].x.toString(), "\n  20\n", letters[i].children[j].points[k].y.toString(), "\n");
      }
      dxf = dxf.concat("  0\nSEQEND\n");
    }
    //lines
    for(let j = 0; j < letters[i].lines.length; j++){
      dxf = dxf.concat("  0\nLINE\n  8\n0\n  10\n", letters[i].lines[j].s.x.toString(), "\n  20\n", letters[i].lines[j].s.y.toString(), "\n  11\n", letters[i].lines[j].e.x.toString(), "\n  21\n", letters[i].lines[j].e.y.toString(), "\n");
    }
  }
  dxf = dxf.concat("  0\nENDSEC\n  0\nEOF\n");
  download(dxf, "out.dxf", "text/plain");

}

let dxfFile;


function parseDfx(data){
  let lines = data;
  let currentEntity = null;
  let entityType = "";
  let contents = [];

  for(let i = 0; i < lines.length; i++){
    let currentLine = lines[i].trim();
    if(
      currentLine === "VERTEX" ||
      currentLine === "SEQEND"
    ){
      currentEntity = {};
      entityType = currentLine;
    }else if(currentEntity !== null){
      
      switch(currentLine){
        case "8":
          i++;
          break;
        case "10":
          
          currentEntity.x = parseFloat(lines[++i].trim());
          break;
          
        case "20":
          currentEntity.y = parseFloat(lines[++i].trim());
          break;

        case "0":
          if(
            entityType === "VERTEX" &&
            currentEntity.x != undefined &&
            currentEntity.y != undefined
          ){
            contents.push({
              type: entityType,
              x: currentEntity.x,
              y: currentEntity.y
            });
          }else if(entityType === "SEQEND"){
            contents.push({type: entityType});
          }
          currentEntity = null;
          entityType = "";
          break;

        default:
          break;
      }
    }
  }
  paths = [];
  letters = [];
  let p = []
  for(let i = 0; i < contents.length; i++){
    
    if(contents[i].type === "VERTEX"){
      p.push({x: contents[i].x, y: contents[i].y});
    }else if ( contents[i].type === "SEQEND"){
      paths.push({points: p});
      p = [];
    }
  }
  
  getFullBox();
  translateZero();
  getBoxes();
  checkBoxes();
  getLetters();
  paths = [];
  contents = [];
  ssizeInputLabel.removeAttribute("hidden");
  ssizeInput.removeAttribute("hidden");
  startButton.removeAttribute("hidden");
  
}


function handleInputFile(){
  const fileList = this.files;
  const file = fileList[0];
  var reader = new FileReader();
  let ending = [];
  for(let i = 0; i < 4; i++){
    ending[i] = file.name.at(file.name.length - (3 - i));
  }
  let type = ending[0].concat(ending[1], ending[2]);
 
  
  let gotFile = false;
  reader.onload = function(e){
    if(type == 'dxf'){
      const link = document.createElement("a");
      const f = new Blob([e.target.result], {type : 'test/plain'});
      link.href = URL.createObjectURL(f);
      dxfFile = loadStrings(link.href, parseDfx);
      
    } else {
      alert("Keine dxf Datei");
    }
  }

  reader.readAsText(file);


}

function startButtonCb(){
  generateLines();
}

function ssizeInputCb(){
  SSIZE = this.value;
}

function saveButtonCb(){
  makeDxf();
}

let fileInput;
let ssizeInput;
let startButton;
let ssizeInputLabel;
let saveButton;

function setup() {
  createCanvas(WIDH, HEIGHT);
  

  fileInput = document.getElementById("file-input");
  fileInput.addEventListener("change", handleInputFile, false);

  ssizeInputLabel = document.getElementById("ssize-input-label");


  ssizeInput = document.getElementById("ssize-input");

  ssizeInput.addEventListener("change", ssizeInputCb, false);

  startButton = document.getElementById("start-button");
  
  startButton.addEventListener("click", startButtonCb, false);

  saveButton = document.getElementById("save-button");
  saveButton.addEventListener("click", saveButtonCb, false);

  
  


}

function drawOl(points){
  
  strokeWeight(1);
  for(let j = 0; j < points.length - 1; j++){
      let b = points[j];
      let e = points[j + 1];
      line(b.x*kx, abs(b.y*ky - HEIGHT), e.x*kx, abs(e.y*ky - HEIGHT));
    }
}




function drawLetters(){
  
  strokeWeight(1);
  noFill();
  for(let i = 0; i < letters.length; i++){
    let letter = letters[i];
    //draw Outline
    stroke("black");
    drawOl(letter.points);
    
    //draw Children
    for(let j = 0; j < letter.children.length; j++){
      //draw ol
      stroke("black");
      drawOl(letter.children[j].points);
      
    }
    //draw lines
    stroke("green");
    for(let j = 0; j < letter.lines.length; j++){
      let l = letter.lines[j];
      line(l.s.x * kx, abs(l.s.y * ky - HEIGHT), l.e.x * kx, abs(l.e.y * ky - HEIGHT));
    }
  }
}





function draw() {
  kx = WIDH/gWIDH;
  ky = HEIGHT/gHEIGHT;
  background(220);

  if(letters.length == 0){
    stroke("black");
    textSize(40);
    text("Noch keine Datei Hochgeladen", 20, 400 );
  }

  drawLetters()
}
