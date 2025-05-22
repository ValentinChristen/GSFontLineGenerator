
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
    let dx = SSIZE/PTOMM * 0.8;
    let nSegs = ((letter.oBox[1].x - letter.oBox[0].x) / dx) - 1;
    for(let j = 0; j < nSegs; j++){
      let x = letter.oBox[0].x + ((j + 1) * dx);
      let parts = getOlParts(letter, x);
      
      for(let k = 0; k < parts.length - 1; k+=2){
        let nLine = {s: {}, e: {}};
        nLine.s.x = x
        nLine.e.x = x

        nLine.s.y = getCrossPointY(parts[k].s.x, parts[k].s.y, parts[k].e.x, parts[k].e.y, x);
        nLine.e.y = getCrossPointY(parts[k+1].s.x, parts[k+1].s.y, parts[k+1].e.x, parts[k+1].e.y, x);
        letters[i].lines.push(nLine);
      }
    }
  }

  saveButton.removeAttribute("hidden");

}

let outString = "";

function makeSvg(){
  let csvg = new p5.XML();
  csvg.setName("svg");
  csvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  csvg.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  csvg.setAttribute("width", gWIDH.toString());
  csvg.setAttribute("height", gHEIGHT.toString());
  let viewBox = "0 0 " + (gWIDH * 2).toString() + (gWIDH * 2).toString();
  csvg.setAttribute("viewBox", viewBox );
  csvg.setAttribute("fill-rule","evenodd" );
  let cg = new p5.XML();
  cg.setName("g");

  let pathDs = [];

  for(let i = 0; i< letters.length; i++){
    //outline
    let ol = "M "
    for(let j = 0; j < letters[i].points.length; j++){
      let p = letters[i].points[j].x.toString() + " " + letters[i].points[j].y.toString();
      if(j != letters[i].points.length){
        p += "L ";
      } 
      ol += p;
    }

    pathDs.push(ol);

    //children
    for(let j = 0; j < letters[i].children.length; j++){
      let ol = "M "
      for(let k = 0; k < letters[i].children[j].points.length; k++){
        let p = letters[i].children[j].points[k].x.toString() + " " + letters[i].children[j].points[k].y.toString();
        if(k != letters[i].children[j].points.length){
          p += "L ";
        } 
        ol += p;
      }
      pathDs.push(ol);
    }

    //lines
    for(let j = 0; j < letters[i].lines.length; j++){
      let line = "M " + letters[i].lines[j].s.x.toString() + " " + letters[i].lines[j].s.y.toString() + "L " + letters[i].lines[j].e.x.toString() + " " + letters[i].lines[j].e.y.toString();
      pathDs.push(line);
    }

  }

  for(let i = 0; i < pathDs.length; i++){
    let nPath = new p5.XML();
    nPath.setName("path");
    nPath.setAttribute("style", "stroke:#000000; stroke-width:0.72; fill:none");
    nPath.setAttribute("d", pathDs[i]);
    cg.addChild(nPath);
  }

  csvg.addChild(cg);

  outString = "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"yes\"?>\n" + csvg.serialize();

  download(outString, "out.svg", "text/plain");
}
let inFile;
function loadSvg(){
  //console.log(inFile.listChildren());
    let x_paths = inFile.getChildren('path');
    paths = [];
    letters = [];
    for(let i = 0; i < x_paths.length; i++){
      paths[i] = {};
      paths[i].src = x_paths[i].getString('d');
      paths[i].points = getPoints(paths[i].src);
    }
    getFullBox();
    translateZero();
    getBoxes();
    checkBoxes();
    getLetters();
    paths = [];
    ssizeInputLabel.removeAttribute("hidden");
    ssizeInput.removeAttribute("hidden");
    startButton.removeAttribute("hidden");
}

function handleInputFile(){
  const fileList = this.files;
  const file = fileList[0];
  var reader = new FileReader();
  
  let gotFile = false;
  reader.onload = function(e){
    if(file.type == 'image/svg+xml'){
      //console.log(file);
      const link = document.createElement("a");
      const f = new Blob([e.target.result], {type : 'test/plain'});
      link.href = URL.createObjectURL(f);
      
      inFile = loadXML(link.href, loadSvg);
      //console.log(inFile);
      
    } else {
      alert("Keine svg Datei");
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
  makeSvg();
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
  for(let j = 0; j < points.length - 1; j++){
      let b = points[j];
      let e = points[j + 1];
      line(b.x*kx, b.y*ky, e.x*kx, e.y*ky);
    }
}

function drawBox(oBox){
  //strokeWeight(1)
  let x = oBox[0].x;
  let y = oBox[0].y;
  let w = oBox[2].x - x;
  let h = oBox[2].y - y;
  rect(x*kx, y*ky, w*kx, h*ky);
  //strokeWeight(SSIZE/PTOMM * kx);
}


function drawLetters(){
  
  strokeWeight(1);
  //strokeWeight(SSIZE/PTOMM * kx);
  noFill();
  for(let i = 0; i < letters.length; i++){
    let letter = letters[i];
    //draw Outline
    stroke("black");
    drawOl(letter.points);
    //draw Box
    stroke("magenta");
    //drawBox(letter.oBox);
    //draw Children
    for(let j = 0; j < letter.children.length; j++){
      //draw ol
      stroke("black");
      drawOl(letter.children[j].points);
      //draw box
      stroke("yellow");
      //drawBox(letter.children[j].oBox);
    }
    //draw lines
    stroke("green");
    for(let j = 0; j < letter.lines.length; j++){
      let l = letter.lines[j];
      line(l.s.x * kx, l.s.y * ky, l.e.x * kx, l.e.y * ky);
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