app.controller('HomeCtrl', ['$scope', '$location', '$interval', 'DataService', function ($scope, $location, $interval, DataService) {
	const rowNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "BB", "CC", "DD", "EE", "FF", "GG", "HH", "II", "JJ", "KK", "LL", "MM", "NN", "OO", "PP", "QQ", "RR", "SS", "TT", "UU", "VV", "WW", "XX", "YY", "ZZ"];
	var onLoad = checkData();
	$scope.rows = ["A"];
    $scope.columns = ["1"];
	$scope.statsList = [
	                ["Str", "Strength. Affects damage the unit deals with physical attacks.", "5px", "5px"],
	                ["Mag", "Magic. Affects damage the unit deals with magical attacks.", "29px", "14px"],
	                ["Skl", "Skill. Affects hit rate and the frequency of critical hits.", "53px", "38px"],
	                ["Spd", "Speed. Affects Avo. Unit strikes twice if 5 higher than opponent.", "72px", "45px"],
	                ["Lck", "Luck. Has various effects. Lowers risk of enemy criticals.", "96px", "60px"],
	                ["Def", "Defense. Reduces damage from physical attacks.", "106px", "76px"],
	                ["Res", "Resistance. Reduces damage from physical attacks.", "109px", "94px"]
	               ];
	
	//Interval timers
    var rowTimer = $interval(calcNumRows, 250, 20); //attempt to get rows 20 times at 250 ms intervals (total run: 5 sec)
    var colTimer = $interval(calcNumColumns, 250, 20);
    var dragNDrop = $interval(initializeListeners, 250, 20);
    
	//Positioning constants
    const eSkillHorzPos = ["14px", "41px", "68px", "95px", "122px", "149px", "176px", "203px"];
    const eStatVerticalPos = ["172px", "195px", "218px", "172px", "195px", "218px", "172px"];
    const eWeaponVerticalPos = ["5px", "35px", "65px", "95px", "125px"];
    const eWpnRankHorzPos = ["15px", "105px", "195px"];
    const eSklDescHorzPos = ["4px", "31px", "58px", "85px", "112px", "139px", "166px", "193px"];
    const eWpnDescVerticalPos = ["5px", "20px", "40px", "55px", "65px"];
    
    //Constants
    const STAT_DEFAULT_COLOR = "#E5C68D";
    const STAT_BUFF_COLOR = "#42adf4";
    const STAT_DEBUFF_COLOR = "#960000";
    
    //Reroutes the user if they haven't logged into the app
    //Loads data from the DataService if they have
    function checkData(){
    	if(DataService.getCharacters() == null)
    		$location.path('/');
    	else{
    		$scope.charaData = DataService.getCharacters();
			$scope.mapUrl = DataService.getMap();
    	}
    };
    
    //*************************\\
    // FUNCTIONS FOR MAP TILE  \\
    // GLOW BOXES              \\
    //*************************\\
    
    const boxWidth = 31;
	const gridWidth = 1;

    /* Using the height of the map image, calculates the number of tiles tall
     * the map is and returns a subsection of the rowNames array of that size.
     * Called every 250 ms for the first 5 seconds the app is open.
     */
    function calcNumRows(){
    	var map = document.getElementById('map');
    	if(map != null){
    		var height = map.naturalHeight; //calculate the height of the map
        	
        	height -= (boxWidth * 2);
        	height = height / (boxWidth + gridWidth);
        	var temp = rowNames.slice(0, height);
        	
        	if(temp.length != 0){
        		$interval.cancel(rowTimer); //cancel $interval timer
        		$scope.rows = temp;
        	}
    	}
    };
    
   /* Using the width of the map image, calculates the number of tiles wide
    * the map is and returns an array of that size.
    * Called every 250 ms for the first 5 seconds the app is open.
    */
   function calcNumColumns(){
    	var map = document.getElementById('map');
    	if(map != null){
    		var width = map.naturalWidth; //calculate the height of the map
        	
        	width -= (boxWidth * 3);
        	width = width / (boxWidth + gridWidth);
        	var temp = [];
        	
			for(var i = 0; i < width; i++)
                temp.push(i+1);

        	if(temp.length != 0){
        		$interval.cancel(colTimer); //cancel $interval timer
        		$scope.columns = temp;
        	}
    	}
    };
    
    //Returns the vertical position of a glowBox element
    $scope.determineGlowY = function(index){
    	return (index * (boxWidth + gridWidth)) + (boxWidth + (gridWidth * 2)) + "px";
    };
    
    //Returns the horizontal position of a glowBox element
    $scope.determineGlowX = function(index){
    	return (index * (boxWidth + gridWidth)) + "px";
    };
    
    //*************************\\
    // FUNCTIONS FOR MAP       \\
    // CHARACTERS/SPRITES      \\
    //*************************\\
    
    //Toggles character/enemy information box
    $scope.displayData = function(char){
    	var bool = $scope[char + "_displayBox"];
    	if(bool == undefined || bool == false){
    		positionCharBox(char);
    		$scope[char + "_displayBox"] = true;
    	}else{
    		$scope[char + "_displayBox"] = false;
    	}
    };
    
    $scope.removeData = function(index){
    	$scope[index + "_displayBox"] = false;
    };
    
    $scope.checkCharToggle = function(index){
    	return $scope[index + "_displayBox"] == true;
    };

	$scope.isChar = function(objName){
		return objName.indexOf("char_") != -1;
	};
    
	$scope.isPaired = function(partner, stance){
		return partner != "" && stance != "Attack";
    };

    $scope.isPairedFront = function(partner, stance){
		return partner != "" && stance == "Guard";
    };
    
    //Returns the image URL for the unit in the back of a pairup
    //0 = charaData, 1 = enemyData
    $scope.getPairUnitIcon = function(pair){
    	var pairedUnit = locatePairedUnit(pair).unit;
    	return pairedUnit.spriteUrl;
    };
    
    //Switches char info box to show the stats of the paired unit
    //Triggered when char info box "Switch to Paired Unit" button is clicked
    $scope.findPairUpChar = function(char){
    	var clickedChar = $scope.charaData[char];
    	var pairedUnit = locatePairedUnit(clickedChar.pairUpPartner);
    	
    	//Toggle visibility
    	$scope[char + "_displayBox"] = false;
    	$scope[pairedUnit.unitLoc + "_displayBox"] = true;

    	var currBox = document.getElementById(char + '_box');
    	var pairBox = document.getElementById(pairedUnit.unitLoc + '_box');
    
		pairBox.style.top = currBox.offsetTop + 'px';
    	pairBox.style.left = currBox.offsetLeft + 'px';
    };
    
    function locatePairedUnit(unitName){
		var unit = null;

    	//Find paired unit
    	for(var char in $scope.charaData){
    		if($scope.charaData[char].name == unitName){
    			unit = char; break;
    		}
    	}
    	
    	return {'unit' : $scope.charaData[unit], 'unitLoc' : unit };
    };
	
	$scope.isNotEnemy = function(cIndex){
		return cIndex.indexOf("enmy") == -1;
	};
    
    //Parses an enemy's name to see if it contains a number at the end.
    //If it does, it returns that number
    $scope.getEnemyNum = function(name){
    	if(name.lastIndexOf(" ") == -1 || name == undefined)
    		return "";
    	name = name.substring(name.lastIndexOf(" ")+1, name.length);
    	
    	if(name.match(/^[0-9]+$/) != null) return "IMG/NUM/" + name + ".png";
    	else return "";
    };

	$scope.isBoss = function(unitType){ unitType = unitType.toLowerCase(); return unitType.indexOf('boss') != -1; };
	$scope.canTalk = function(unitType){ unitType = unitType.toLowerCase(); return unitType.indexOf('talk') != -1; };

	$scope.textTooLong = function(textA, textB){
		return (textA.length + textB.length) > 150;
	};
    
    $scope.validPosition = function(pos, stance){
    	return pos != "" && stance != "Backpack";
    };
    
    //Using a character's coordinates, calculates their horizontal
    //position on the map
    $scope.determineCharX = function(pos){
        pos = pos.match(/[0-9]+/g)[0];
        pos = parseInt(pos);
        return (pos * (boxWidth + gridWidth)) + "px";
    };

    //Using a character's coordinates, calculates their vertical
    //position on the map
    $scope.determineCharY = function(pos){
		pos = pos.match(/[a-zA-Z]+/g)[0];
    	pos = parseInt(getPosLetterEquivalent(pos));
    	return (pos * (boxWidth + gridWidth)) + gridWidth + "px";
    };
    
    function getPosLetterEquivalent(letter){
    	if(letter.length == 1) 
    		return letter.charCodeAt(0) - 64; //single letter
    	else
			return letter.charCodeAt(0) - 38; //double letter
    };
    
    //***********************\\
    // POSITION CALCULATIONS \\
    //***********************\\
    
    //Relocate the information box relative to the clicked char
    function positionCharBox(char){
    	var sprite = document.getElementById(char);
    	var box = document.getElementById(char + '_box');
    	
		var x = sprite.style.left;
    	var y = sprite.style.top;
    	x = parseInt(x.substring(0, x.length-2));
    	y = parseInt(y.substring(0, y.length-2));
    	
    	if(x < 671) x += 40;	
    	else x -= 671;
    	
    	if(y < 77) y += 40;
    	else y -= 77;
    	
    	box.style.left = x + 'px';
    	box.style.top = y + 'px';
    };

    $scope.fetchESklHorzPos = function(index){ return eSkillHorzPos[index]; };
    $scope.fetchEStatVerticalPos = function(index){ return eStatVerticalPos[index]; };
	$scope.fetchEStatHorzPos = function(index){ var i = parseInt(index); var val; i <= 2 ? val = "241px" : (i <= 5 ? val ="321px" : val = "401px"); return val;}
    $scope.fetchEWeaponVerticalPos = function(index){ return eWeaponVerticalPos[index]; };
    $scope.fetchEWpnRankHorzPos = function(index){ return eWpnRankHorzPos[index]; };
    $scope.fetchESklDescHorzPos = function(index){ return eSklDescHorzPos[index]; };
    $scope.fetchEWpnDescVerticalPos = function(index){ return eWpnDescVerticalPos[index]; };
    
    //***********************\\
    // FUNCTIONS FOR STAT    \\
    // PROCESSING/FORMATTING \\
    //***********************\\
    
    //Returns true if the value in the passed attribute is >= 0
    $scope.checkRate = function(stat){ return parseInt(stat) >= 0; };
    
    /* Calculates total buff/debuffs for each stat (str/mag/skl/etc) and
     * returns the appropriate text color as a hex value
     * red <- total<0
     * blue <- total>0
     * tan <- total=0
     * 
     * toggle = 0 for char, 1 for enemy
     */
    $scope.determineStatColor = function(character, index, stat){
    	var char = $scope.charaData[character];
    	
    	//Determine appropriate indicies for stat being evaluated (passed string)
    	var debuff = char[stat + "Buff"];
    	var weaponBuff = char["w" + stat + "Buff"];
    	var pairUp = char["p" + stat + "Buff"];
    	
    	if(debuff == "") debuff = 0;
    	else debuff = parseInt(debuff);
    	
    	weaponBuff = parseInt(weaponBuff);
    	
    	if(pairUp == "") pairUp = 0;
    	else pairUp = parseInt(pairUp);
    	
    	var totalBuffs = debuff + weaponBuff + pairUp;
    	if(totalBuffs > 0)
    		return STAT_BUFF_COLOR; //blue buff
    	else if(totalBuffs < 0)
    		return STAT_DEBUFF_COLOR //red debuff
    	return STAT_DEFAULT_COLOR;
    };
    
    $scope.calcBaseStat = function(char, stat){
    	var char = $scope.charaData[char];
    	
    	//Determine appropriate indicies for stat being evaluated (passed string)
    	var total = char[stat];
    	var debuff = char[stat + "Buff"];
    	var weaponBuff = char["w" + stat + "Buff"];
    	var pairUp = char["p" + stat + "Buff"];
    
    	total = parseInt(total);
    	debuff = parseInt(debuff);
    	weaponBuff = parseInt(weaponBuff);
    	if(pairUp == "") pairUp = 0;
    	else pairUp = parseInt(pairUp);
    	
    	return total - (debuff + weaponBuff + pairUp);
    };
    
    $scope.validSkill = function(skill){
    	return skill != "-";
    };

    //Returns the image for a character's skill, if they're at the minimum
    //level to obtain it. Otherwise, returns the blank skill image.
    $scope.fetchSkillImage = function(skillName, charLvl, index){
    	var minLvl = (index - 1) * 5;
    	if(minLvl == 0) minLvl = 1;
    	
    	if(skillName == "-" || minLvl > parseInt(charLvl))
    		return "IMG/blank_skill.png";

    	skillName = skillName.toLowerCase();
    	skillName = skillName.replace(/ /g,"_");
    	return "IMG/SKL/skl_" + skillName + ".png";
    };
    
    $scope.checkShields = function(num, shields){
    	num = parseInt(num);
    	shields = parseInt(shields);
    	
    	if(shields == 10) return "IMG/blueshield.png";
    	else if(shields >= num) return "IMG/filledshield.png";
    	else return "IMG/emptyshield.png";
    };
    
    $scope.validSkill = function(skill){
    	return skill != "-";
    };
    
    //*************************\\
    // FUNCTIONS FOR INVENTORY \\
    // & WEAPONS PROFICIENCY   \\
    //*************************\\
    
    //Checks to see if the weapon name in the passed slot is null
    //Version for characters
    $scope.validWeapon = function(weaponName){
    	if(weaponName != "") return true;
    	else return false;
    };
    
    //Returns the icon for the class of the weapon at the index
    //Version for characters
    $scope.getWeaponClassIcon = function(type){
		if(type == undefined) return "";
    	type = type.toLowerCase();
    	return "IMG/type_" + type + ".png";
    };
    
    //Checks if the passed "type" is listed in the effectiveness column of a character's weapon
    //(Ex. Flier, Monster, Beast, Dragon, Armor)
    $scope.weaponEffective = function(types, goal){
    	types = types.toLowerCase();
    	return types.indexOf(goal) != -1;
    };
    
    $scope.existsWeapon = function(weaponName){
    	return weaponName != "-";
    };
    
    //Returns the weapon rank icon relevant to the passed weapon type
    $scope.weaponIcon = function(weaponName){    	
    	var c = weaponName.toLowerCase();
    	return "IMG/rank_" + c + ".png";
    };
    
    //Calculates the percentage of weapon proficicency for a specific weapon,
    //then returns the width of the progress bar in pixels
    $scope.calcWeaponExp = function(exp){
    	var slash = exp.indexOf("/");
    	var progress = parseInt(exp.substring(0,slash));
    	var total = parseInt(exp.substring(slash+1,exp.length));
    	
    	return (progress/total) * 30; //30 is the max number of pixels
    };
    
    //Checks if there is a value in the index
    $scope.validDebuff = function(value){
    	return value != "" && value != "0" && value != "-";
    };
    
    $scope.formatWeaponName = function(name){
    	if(name.indexOf("(") == -1) return name;
    	else return name.substring(0, name.indexOf("(")-1);
    };
    
    $scope.hasWeaponRank = function(rank){
    	return rank != "";
    };
    
    //Returns true if the weapon at the index is not an item
    $scope.notItem = function(type){
    	return type != "Item" && type != "Forge Stone" && type != "Unknown";
    };
    
    $scope.setDescriptionLoc = function(type){
    	if(type != "Item" && type != "Forge Stone" && type != "Unknown") return "60px";
    	else return "25px";
    };

	$scope.setItemDescHeight = function(type){
		if(type != "Item" && type != "Forge Stone" && type != "Unknown") return "80px";
    	else return "118px";
	};
    
    //***************************\\
    // MOUSEOVER/MOUSEOUT EVENTS \\
    //***************************\\
    
    $scope.weaponHoverIn = function(char, index){ $scope[char + "wpn_" + index] = true; };
    $scope.weaponHoverOut = function(char, index){ $scope[char + "wpn_" + index] = false; };
    $scope.weaponHoverOn = function(char, index){ return $scope[char + "wpn_" + index] == true; };
    
    $scope.skillHoverIn = function(char, index){ $scope[char + "skl_" + index] = true; };
    $scope.skillHoverOut = function(char, index){ $scope[char + "skl_" + index] = false; };
    $scope.skillHoverOn = function(char, index){ return $scope[char + "skl_" + index] == true; };
    
    $scope.statHoverIn = function(char, stat){ $scope[char + "hov_" + stat] = true; };
    $scope.statHoverOut = function(char, stat){ $scope[char + "hov_" + stat] = false; };
    $scope.statHoverOn = function(char, stat){ return $scope[char + "hov_" + stat] == true; };
    
    $scope.pairUpHoverIn = function(char){ $scope[char + "pair"] = true; };
    $scope.pairUpHoverOut = function(char){ $scope[char + "pair"] = false; };
    $scope.pairUpHoverOn = function(char){ return $scope[char + "pair"] == true; };
    
    //*************************\\
    // SUPPORT FOR DRAGABILITY \\
    // OF CHAR INFO BOX        \\
    //*************************\\
    var currDrag = "";
    
    function dragStart(event){
    	var style = window.getComputedStyle(event.target, null);
    	currDrag = event.target.id;
        event.dataTransfer.setData("text",(parseInt(style.getPropertyValue("left"),10) - event.clientX) + ',' + (parseInt(style.getPropertyValue("top"),10) - event.clientY));
    };
    
    function dragOver(event){
    	event.preventDefault();
    	return false;
    };
    
    function dragEnter(event){
    	event.preventDefault();
    };
    
    function dropDiv(event){
    	event.preventDefault();
    	var data = event.dataTransfer.getData("text").split(',');

    	var drag = document.getElementById(currDrag);
    	drag.style.left = (event.clientX + parseInt(data[0],10)) + 'px';
    	drag.style.top = (event.clientY + parseInt(data[1],10)) + 'px';
    	currDrag = "";
    };
    
    function initializeListeners(){;
    	var test = document.getElementById('char_0_box');
    	if($scope.charaData != undefined && test != null){
    		
    		//Set event listeners to be activated when the div is dragged
    	    for(var char in $scope.charaData){
    	    	var box = document.getElementById(char + '_box');
    	    	box.addEventListener('dragstart',dragStart,false);
    	    }
    	    
    	    //Set event listeners
    	    var drop = document.getElementById('dropArea');
    	    drop.addEventListener('dragenter',dragEnter,false);
    	    drop.addEventListener('dragover',dragOver,false);
    	    drop.addEventListener('drop',dropDiv,false);
    	    
    	    $interval.cancel(dragNDrop); //cancel $interval timer
    	}
    };
}]);