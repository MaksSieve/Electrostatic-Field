function Vector(x, y) {
//Класс Вектор 
	this.x = x;
	this.y = y;
	this.abs = function () {
		//возращает модуль данного вектора
		return (Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2)));
	};
	this.sum = function (v) {
		//возвращает вектор суммы вектора v и данного вектора
		this.x += v.x;
		this.y += v.y;
		return this;
	};
}

function Charge(x, y, q) {
//Класс Заряд
	this.x = x;//координаты
	this.y = y;
	this.q = q;//заряд
	this.surroundRaius = 20;
	this.aroundRadius = 50;
	this.tension = function S(ax, ay) {
	//возвращает вектор напряженности в данной точке поля
        var vx = this.x - ax;
        var vy = this.y - ay;
        var r2 = (Math.pow(vx, 2) + Math.pow(vy, 2)) * Math.pow(Math.pow(10, distanceFactor), 2);
        var r = Math.sqrt(r2);
        var t = k * this.q / r2;
        var tx = t * vx / r;
        var ty = t * vy / r;
        return new Vector(tx, ty);
    };
};

/*
Future class Field
function Field(){
    this.qArray = [];
    this.field = [];
    this.fieldInit = function() {
        this.field = [];
        for (var i = 0; i <= cw; i++) {
            field[i] = [];
            for (var j = 0; j <= ch - 50; j++) {
                field[i][j] = new Vector(0,0);
            }
        }
    }
    this.addCharge(){
    }
}
*/

function AddChargeInTable(q, x, y) {
	var id = '' + mass.length;
	var bt_tag = '<button id= "DelBut' + id + '" class="btn btn-primary btn-sm">';
	$('#chrg').append($('<tr id="q' + id + '" class="trq">')
		.append($('<td>').text(x-300+''))
      .append($('<td>').text(300-y+''))
      .append($('<td>' + q.toExponential(2)+'</td>'))
      .append($('<td>').append($(bt_tag).text('Удалить').bind('click',{charge: id},Del))));
	// .append($('<input id="inq'+id+'" size="5" readonly>')
};

function AddByForm(e) { 
// добавляет новый "заряд"
	var q = +$("#q").val() * Math.pow(10,chargeFactor);
	if (q == 0){
		alert("Введите заряд отличный от 0!");
		return;
	}else{
       for (var i=0;i<mass.length;i++){
		      var dx = Math.round(mass[i].x-cw/2);
		      var dy = Math.round((ch-50)/2-mass[i].y);
		      if (Math.pow(x-dx,2)+Math.pow(y-dy,2)<=Math.pow(mass[i].aroundRadius,2)){
                f=false;
                alert('Добавление заряда в данной точке невозможно! Слишком близко к другим зарядам!');
                return;
		      }
	    }
       var x = Math.round(cw / 2 + (+$("#xCrd").val()));
       var y = Math.round((ch - 50) / 2 - (+$("#yCrd").val())) ;
       Q = new Charge(x,y,q);
       mass.push(Q);
       AddChargeInTable(q,x,y)
       reCountMatrixQ(Q);
       reDrawing();
	}
};

function AddByClick(e) {
	var q = +$("#newQ").val() * Math.pow(10,chargeFactor);
	if (q == 0){
		alert("Введите заряд отличный от 0!");
		return;
	}else{
		$('#myModal').modal('hide');
		var x = Math.round(+$("#newCx").text() + cw / 2) - 1;
		var y = Math.round((ch - 49) / 2 - (+$("#newCy").text())) - 1;
		
		Q = new Charge(x,y,q);
      mass.push(Q);
		AddChargeInTable(q,x,y)
		reCountMatrixQ(Q);
		reDrawing();
	}
};

function Del(event) {
	var id = event.data.charge;
	mass.splice(id-1,1);
	$(event.target).parent().parent().remove();
	reCountMatrix();
	reDrawing();
};  
 
function SuperPosition(Ar, x, y) {
	s = new Vector(0,0);
	/*for (var i=0; i<Ar.length; i++){
   	s = s.sum(Ar[i].tension(x,y));
	}
	*/
	Ar.forEach(function(t){
		s = s.sum(t.tension(x,y))
	});
	return s;
};

function reCountMatrix() {
//пересчитывает матрицу
   var t, ta;
	rEmax = -Infinity;
	rEmin = Infinity;
	for (var i = 0; i <= cw; i++){
		for (var j = 0; j <= ch-50; j++){
			t = SuperPosition(mass,i,j);
        	ta = t.abs();
			if (ta < rEmin /*&& ta!=-Infinity*/){
				rEmin = ta;
			};
			if (ta > rEmax){
				rEmax = ta;
			};
			eTbl[i][j] = t;
		};
	};
Emin = Math.log(rEmin) / Math.log(10);
Emax = Math.log(rEmax) / Math.log(10);	
};

function reCountMatrixQ(q) {
    var t, ta;
    rEmax = -Infinity;
    rEmin = Infinity;
	 for (var i = 0; i <= cw; i++){
        for (var j = 0; j <= ch-50; j++){
        t = eTbl[i][j].sum(q.tension(i,j));
        ta = t.abs();
        if (ta < rEmin /*&& ta!=-Infinity*/){
            rEmin = ta;
        };
        if (ta > rEmax){
            rEmax = ta;
        };
        eTbl[i][j] = t;
    };
};
Emin = Math.log(rEmin) / Math.log(10);
Emax = Math.log(rEmax) / Math.log(10);	
}

function clearAll() {
    ctx.clearRect(0, 0, can.width, can.height);
}

function drawModulo() {
	//отрисовка модуля напряженности
	var L=0;
	ctx.strokeStyle = "#fff";
	var a=Lmax/(Emax-Emin);
   var b=Emin*a;	
   for(var i = 0; i <= cw - 0.5; i +=1){
       for(var j = 0; j <= ch - 50.5; j += 1){
            var v = eTbl[i][j];
            var E = Math.log(v.abs())/Math.log(10)
            L = Math.round(a*E-b);					
            L=Lmax-L;
            var s = "hsl("+ L +",100%,50%)";
            ctx.strokeStyle = s;
            ctx.strokeRect(i+0.5,j+0.5,0.5,0.5);
        }
    }
};

function drawVectors(scale, step) {
	//отрисовка силовых линий
	//TODO убрать отрисовку линий в точках с максимальной и минимальной напряженностью
	var dx, dy, v, cscale;
    ctx.strokeStyle = "#fff";
    ctx.lineWidth=1;
    ctx.beginPath();
    for(var i=step; i<cw-1.5; i+=step){
        for(var j=step; j<ch-50.5; j+=step){
            v = eTbl[i][j];
            cscale = scale / -v.abs();
            dx = v.x * cscale;
            dy = v.y * cscale;
            ctx.strokeRect(i-1+0.5,j-1+0.5,2,2);
			  	if (v.abs()!=Emin&&v.abs()!=Emax){
            	ctx.moveTo(i+0.5,j+0.5);
            	ctx.lineTo(i+dx+0.5,j+dy+0.5);
				}
        }
    }
    ctx.stroke();
};

function CrdSys() {
	ctx.beginPath();
	for (var x = 0.5; x <= cw; x += 50) {
		ctx.moveTo(x, 0.5);
		ctx.lineTo(x, cw-0.5);
	};
	for (var y = 0.5; y <= ch-49.5; y += 50) {
		ctx.moveTo(0.5, y);
		ctx.lineTo(ch-50.5, y);
	};
	ctx.strokeStyle = "#2F2F2F";
	ctx.lineWidth = 1;
	ctx.stroke();
					
	ctx.beginPath();
	ctx.moveTo(0,ch/2-24.5);
	ctx.lineTo(cw,ch/2-24.5);
	ctx.moveTo(cw/2-0.5,0);
	ctx.lineTo(cw/2-0.5,ch-50);
	ctx.lineWidth = 2;
	ctx.strokeStyle = "#D0D"
	ctx.stroke();
};

function reDrawing() {
//перерисовывает картинку
   clearAll();
   drawModulo();
	if($("#needCrd").prop("checked")){
		CrdSys();
	}
	if($("#needLines").prop("checked")){
		drawVectors(10, 25);
	}
	if(mass.length>0){
		TensionScale();
	}

};

function TensionDetector(e) {
	if (mass.length != 0){
		var x = e.offsetX == undefined?e.layerX:e.offsetX;
		var y = e.offsetY == undefined?e.layerY:e.offsetY;
		if (x < cw && y < ch-50){
			var E = (isNaN(eTbl[x][y].abs()))?'Infinity':(eTbl[x][y]).abs().toExponential(2);
			$("#E").val(E);
			$("#ex").text(''+x-cw/2-0.5);
			$("#ey").text(''-y+(ch-50)/2);
		}
	}
};

function TensionScale() {
	var L=0;
	var grd= ctx.createLinearGradient(0,620,cw,620);
	grd.addColorStop(1,"hsl("+ 0 +",100%,50%)");
	grd.addColorStop(0.75,"hsl("+ 60 +",100%,50%)");
	grd.addColorStop(0.5,"hsl("+ 120 +",100%,50%)");
	grd.addColorStop(0.25,"hsl("+ 180 +",100%,50%)");
	grd.addColorStop(0,"hsl("+ Lmax +",100%,50%)");
	ctx.fillStyle = grd;
	ctx.fillRect(0,630,cw,640);
	
	var max = Math.round(Emax);
	var max10 = Emax.toFixed(1);
	var a = cw / rEmax;
	ctx.fillStyle = "#000";

	for (var i=max; i>max-3;i--){
		var y = a * Math.pow(10,i);
		if (i==max){
			var t = '10   В/м'
		}else{
			var t = '10'
		}
		var st = ''+i-4;
		ctx.font = "8pt Arial";
		ctx.fillText(st,y+10,612);
		ctx.font = "10pt Arial";
		ctx.fillText(t,y-5,622);
		ctx.beginPath();
		ctx.moveTo(y,630);
		ctx.lineTo(y,625);
		ctx.strokeStyle = "#000";
		ctx.lineWidth=1;
		ctx.stroke();
	}
	ctx.beginPath();
	for (i=max10; i>=max; i-=0.1){
		var y = a * Math.pow(10,i);
		ctx.moveTo(y,630);
		ctx.lineTo(y,650);
	}
	for (i=max; i>max-1; i-=0.2){
		var y = a * Math.pow(10,i);
		ctx.moveTo(y,630);
		ctx.lineTo(y,650);
	}
	for (i=max-1; i>=max-2; i-=0.5){
		var y = a * Math.pow(10,i);
		ctx.moveTo(y,630);
		ctx.lineTo(y,650);
	}
	ctx.strokeStyle = "#000";
	ctx.lineWidth=1;
	ctx.stroke();
};

/*
for future
function factorCount(flist) {
	var factor = +(flist[flist.selectedIndex].value);
	return factor;
};
*/

function CanvasListener(e) {
	var x = e.offsetX==undefined?e.layerX:e.offsetX;
	var y = e.offsetY==undefined?e.layerY:e.offsetY;
	x = Math.round(x-cw/2);
	y = Math.round((ch-50)/2-y);

	var f = true;
	for (var i=0;i<mass.length;i++){
		var dx = Math.round(mass[i].x-cw/2);
		var dy = Math.round((ch-50)/2-mass[i].y);

		if (Math.pow(x-dx,2)+Math.pow(y-dy,2)<=Math.pow(mass[i].aroundRadius,2)){
			f=false;
			alert('Добавление заряда в данной точке невозможно! Слишком близко к другим зарядам!');
			break;
		}
	}
	if (f){
		$("#myModal").modal('show');
		$("#newCx").text(''+x);
		$("#newCy").text(''+y);
		$('#newQ').focusin();
	}		
};

function deleteAll() {
    clearAll();
    CrdSys();
    matrixInit();
    $("#needCrd").prop = "checked";
    $("#needLines").prop = "";
    for (var i = 1; i <= mass.length; i++) {
        id='#q'+i;
        $(id).remove();
    }
    mass=[];
}

function matrixInit() {
    for (var i = 0; i <= cw; i++) {
        eTbl[i] = [];
        for (var j = 0; j <= ch - 50; j++) {
            eTbl[i][j] = new Vector(0,0);
        }
    }
}

/*main function*/
$(function main() {
//привязка "канвы" к скрипту
can = document.getElementById("can");
ctx = can.getContext("2d");
	
//глобальные константы
Lmax=240;
k=1/(4*Math.Pi*8,854187817*Math.pow(10,-12));
rmin = Math.pow(10,-10);
cw = can.width;
ch = can.height;
//future features for changing factors
//chargeFL = $("#chargeFactorList");
//distanceFL = $("#distanceFactorList");
//gCheck = $("#globalChqckbox");

//переменные
mass = [];
eTbl = [];
matrixInit();
    
Emax=0;
Emin=0;
rEmax=0;
rEmin=0;
L=0;
distanceFactor=1;
chargeFactor=0;

CrdSys();
// for future
/*
distanceFL.change(
	function(){
			distanceFactor = factorCount(this);
		});
*/
/*chargeFL.change(
	function(){
		chargeFactor = factorCount(this);
	});
*/

});	 