var loginDiv = document.createElement("div");
var profileDiv = document.createElement("div");
var calcDiv = document.createElement("div");
profileDiv.style.visibility = "hidden";
profileDiv.style.display = "none";
calcDiv.style.visibility = "hidden";
calcDiv.style.display = "none";
loginDiv.id = 'loginPage';
profileDiv.id = 'profilePage';
calcDiv.id = 'calcPage';
loginDiv.innerHTML = "Username <input id ='userID'>" +  
					 " Password <input type = 'password' id ='passwordID'>"+
					 " <input type = 'submit' id ='button' value = 'login'>";

document.body.appendChild(loginDiv);
document.body.appendChild(profileDiv);
document.body.appendChild(calcDiv);
document.getElementById ("button").addEventListener("click", function() {
	if (document.getElementById('userID').value === 'admin' && document.getElementById('passwordID').value === 'admin') {
		document.getElementById('userID').value = '';
		document.getElementById('passwordID').value = '';
		loginDiv.style.visibility = "hidden";
    	loginDiv.style.display = "none";
    	profileDiv.style.visibility = "visible";
    	profileDiv.style.display = "block";

	}
	else {
		alert("wrong password");
	}
});
var quag = document.createElement("img");
quag.src = "http://i1168.photobucket.com/albums/r496/sbskater/Glenn_Quagmire_by_CartmanPT_zpsc6fa7719.jpg";
quag.id = 'myImage';
quag.addEventListener("mouseover", function(){
	if (quag.src === "http://i1168.photobucket.com/albums/r496/sbskater/Glenn_Quagmire_by_CartmanPT_zpsc6fa7719.jpg") {
		quag.src = "http://cdn.playbuzz.com/cdn/5d176468-b64e-4e21-93f2-0dd67ac7052f/aff0233a-d602-4872-9268-89455426c7f2.jpg";
	} else {
		quag.src = "http://i1168.photobucket.com/albums/r496/sbskater/Glenn_Quagmire_by_CartmanPT_zpsc6fa7719.jpg";
	}
})

profileDiv.innerHTML = "<p>My name is Yinnon Bratspiess.</p>" +
					   "<p>My hobbies are sports, mma and sleeping.</p>" +
					   "<p>funny quote, haha so funny </p>";
profileDiv.appendChild(quag);
var br = document.createElement("br");
profileDiv.appendChild(br);
var logoutBtn = document.createElement("button");
logoutBtn.id = "loutBtn";
logoutBtn.innerHTML = "logout";

logoutBtn.addEventListener("click", function() {
	alert("you've succesfully logged out.");
	profileDiv.style.visibility = "hidden";
    profileDiv.style.display = "none";
    loginDiv.style.visibility = "visible";
    loginDiv.style.display = "block";
})

var calcBtn = document.createElement("button");
calcBtn.id = "caBtn";
calcBtn.innerHTML ="calculator";
profileDiv.appendChild(calcBtn);
profileDiv.appendChild(logoutBtn);
calcBtn.addEventListener("click", function() {
	profileDiv.style.visibility = "hidden";
    profileDiv.style.display = "none";
    calcDiv.style.visibility = "visible";
    calcDiv.style.display = "block";
});

var createCalcBtn = document.createElement("button");
createCalcBtn.id = "createCalcBtnID";
createCalcBtn.innerHTML = "Create a calculator";
createCalcBtn.addEventListener("click", function() {
	Calc();});
calcDiv.appendChild(createCalcBtn);
var br2 = document.createElement("br");
calcDiv.appendChild(br2);
var logoutBtn2 = document.createElement("button");
logoutBtn2.id = "loutBtn2";
logoutBtn2.innerHTML = "logout";
calcDiv.appendChild(logoutBtn2);
logoutBtn2.addEventListener("click", function() {
	alert("you've succesfully logged out.");
	calcDiv.style.visibility = "hidden";
    calcDiv.style.display = "none";
    loginDiv.style.visibility = "visible";
    loginDiv.style.display = "block";
})

function Calc(){
	var calctable = document.createElement("table");
	var tr1 = document.createElement("tr");
	var outputLine = document.createElement("input");
	outputLine.value = "0";
	outputLine.style.width = "67";
	tr1.appendChild(outputLine);
	calctable.appendChild(tr1);
	var tr2 = document.createElement("tr");
	var zeroBtn = document.createElement("button");
	zeroBtn.innerHTML = "0";
	zeroBtn.addEventListener("click", function() {
		inputBtn.value += "0";
	})
	var oneBtn = document.createElement("button");
	oneBtn.innerHTML = "1";
	oneBtn.addEventListener("click", function() {
		inputBtn.value += "1";
	})
	var plusBtn = document.createElement("button");
	plusBtn.innerHTML = "+";
	plusBtn.style.width = "20";
	tr2.appendChild(zeroBtn);
	tr2.appendChild(oneBtn);
	tr2.appendChild(plusBtn);
	plusBtn.addEventListener("click", function(){
		if (inputBtn.value == "") {
			alert("pick a number first");
			outputLine.value = "0";
		}
		outputLine.value = parseInt(outputLine.value) + parseInt(inputBtn.value);
		inputBtn.value = "";
	})
	calctable.appendChild(tr2);

	var tr3 = document.createElement("tr");
	var twoBtn = document.createElement("button");
	twoBtn.innerHTML = "2";
	twoBtn.addEventListener("click", function() {
		inputBtn.value += "2";
	})
	var threeBtn = document.createElement("button");
	threeBtn.innerHTML = "3";
	threeBtn.addEventListener("click", function() {
		inputBtn.value += "3";
	})
	var minusBtn = document.createElement("button");
	minusBtn.innerHTML = "-";
	tr3.appendChild(twoBtn);
	tr3.appendChild(threeBtn);
	tr3.appendChild(minusBtn);
	minusBtn.addEventListener("click", function(){
				outputLine.value = parseInt(outputLine.value) - parseInt(inputBtn.value);
				inputBtn.value = "";
	})	
	calctable.appendChild(tr3);

	var tr4 = document.createElement("tr");
	var fourBtn = document.createElement("button");
	fourBtn.innerHTML = "4";
	fourBtn.addEventListener("click", function() {
		inputBtn.value += "4";
	})
	var fiveBtn = document.createElement("button");
	fiveBtn.innerHTML = "5";
	fiveBtn.addEventListener("click", function() {
		inputBtn.value += "5";
	})
	var multiplyBtn = document.createElement("button");
	multiplyBtn.innerHTML = "*";
	multiplyBtn.style.width = "20";
	tr4.appendChild(fourBtn);
	tr4.appendChild(fiveBtn);
	tr4.appendChild(multiplyBtn);
	multiplyBtn.addEventListener("click", function(){
		outputLine.value = parseInt(outputLine.value) * parseInt(inputBtn.value);
		inputBtn.value = "";
	})
	calctable.appendChild(tr4);


	var tr5 = document.createElement("tr");
	var sixBtn = document.createElement("button");
	sixBtn.innerHTML = "6";
	sixBtn.addEventListener("click", function() {
		inputBtn.value += "6";
	})
	var sevenBtn = document.createElement("button");
	sevenBtn.innerHTML = "7";
	sevenBtn.addEventListener("click", function() {
		inputBtn.value += "7";
	})
	var divideBtn = document.createElement("button");
	divideBtn.innerHTML = ":";
	tr5.appendChild(sixBtn);
	tr5.appendChild(sevenBtn);
	tr5.appendChild(divideBtn);
	divideBtn.addEventListener("click", function(){
		if (parseInt(inputBtn.value) == 0) {
			outputLine.value = parseInt("0");
			alert("dont divide by 0 !");
			inputBtn.value = "";	
		} else {
			outputLine.value = parseInt(parseInt(outputLine.value) / parseInt(inputBtn.value));	
			inputBtn.value = "";
		}
		
	})
	calctable.appendChild(tr5);

	var tr6 = document.createElement("tr");
	var eightBtn = document.createElement("button");
	eightBtn.innerHTML = "8";
	eightBtn.addEventListener("click", function() {
		inputBtn.value += "8";
	})
	var nineBtn = document.createElement("button");
	nineBtn.innerHTML = "9";
	nineBtn.addEventListener("click", function() {
		inputBtn.value += "9";
	})
	var clrBtn = document.createElement("button");
	clrBtn.innerHTML = "C";
	clrBtn.style.width = "20";
	clrBtn.addEventListener("click", function() {
		outputLine.value = "0";
		inputBtn.value = "";
	})
	
	tr6.appendChild(eightBtn);
	tr6.appendChild(nineBtn);
	tr6.appendChild(clrBtn);
	calctable.appendChild(tr6);

	var tr7 = document.createElement("tr");
	var inputBtn = document.createElement("input");
	inputBtn.style.width = "67";
	tr7.appendChild(inputBtn);
	calctable.appendChild(tr7);
	calcDiv.appendChild(calctable);
}

