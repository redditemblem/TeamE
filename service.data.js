app.service('DataService', ['$rootScope', function ($rootScope) {
	const rowNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "BB", "CC", "DD", "EE", "FF", "GG", "HH", "II", "JJ", "KK", "LL", "MM", "NN", "OO", "PP", "QQ", "RR", "SS", "TT", "UU", "VV", "WW", "XX", "YY", "ZZ"];
	const sheetId = '1HuDE0QUc1pechu7Q9aK0z4MdIEWPyIsTRE0KC57-T5c';
	var progress = 0;
	var characters = null;
	var rows = [];
	var cols = [];
	var map, characterData, enemyData, itemIndex, skillIndex, classIndex, terrainIndex, terrainLocs, coordMapping;
	
	this.getCharacters = function(){ return characters; };
	this.getMap = function(){ return map; };
	this.getRows = function(){ return rows; };
	this.getColumns = function(){ return cols; };
	this.getTerrainTypes = function(){ return terrainIndex; };
	this.getTerrainMappings = function(){ return terrainLocs; };
	
	this.loadMapData = function(){ fetchCharacterData(); };
	this.calculateRanges = function(){ getMapDimensions(); };

	//\\//\\//\\//\\//\\//
	// DATA AJAX CALLS  //
	//\\//\\//\\//\\//\\//

    function fetchCharacterData() {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        majorDimension: "COLUMNS",
        range: 'Stats!B:ZZ',
      }).then(function(response) {
    	 characterData = response.result.values;
    	 updateProgressBar();
    	 fetchCharacterImages();
      });
    };
    
	
    function fetchCharacterImages() {
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          majorDimension: "ROWS",
		  valueRenderOption: "FORMULA",
          range: 'Stats!B5:ZZ5',
        }).then(function(response) {
      	 var images = response.result.values[0];
      	 
      	 for(var i = 0; i < images.length && i < characterData.length; i++){
      		 characterData[i][4] = processImageURL(images[i]);
      	 }
      	 
      	 updateProgressBar();
      	 fetchEnemyData();
        });
      };

	   function fetchEnemyData() {
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        majorDimension: "COLUMNS",
        range: 'Enemy Stats!B:ZZ',
      }).then(function(response) {
    	 enemyData = response.result.values;
    	 updateProgressBar();
    	 fetchEnemyImages();
      });
    };
    
	
    function fetchEnemyImages() {
        gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          majorDimension: "ROWS",
		  valueRenderOption: "FORMULA",
          range: 'Enemy Stats!B4:ZZ4',
        }).then(function(response) {
      	 var images = response.result.values[0];
      	 
      	 for(var i = 0; i < images.length && i < enemyData.length; i++){
      		 enemyData[i][3] = processImageURL(images[i]);
      	 }
      	 
      	 updateProgressBar();
      	 fetchItemData();
        });
      };
    
    function fetchItemData(){
      gapi.client.sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          majorDimension: "ROWS",
          range: 'Item List!B:AO',
        }).then(function(response) {
          itemIndex = response.result.values;
          itemIndex.splice(0,1); //remove header row
          updateProgressBar();
          fetchSkillData();
        });
    };
    
    function fetchSkillData(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Skill List!A2:C',
          }).then(function(response) {
            skillIndex = response.result.values;
            updateProgressBar();
            fetchSkillImages();
          });
    };
    
    function fetchSkillImages(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "COLUMNS",
            range: 'Skill List!A2:A200',
            valueRenderOption: "FORMULA",
          }).then(function(response) {
            var images = response.result.values[0];
            
            for(var i = 0; i < images.length && i < skillIndex.length; i++)
            	skillIndex[i][0] = processImageURL(images[i]);
            	
            updateProgressBar();
            fetchClassIndex();
          });
	};
	
	function fetchClassIndex(){
    	gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId: sheetId,
            majorDimension: "ROWS",
            range: 'Class Info!A2:AQ',
          }).then(function(response) {
            classIndex = response.result.values;
            
            updateProgressBar();
            fetchTerrainIndex();
          });
	};

	function fetchTerrainIndex(){
		gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "ROWS",
			range: 'Terrain List!A2:L',
		}).then(function(response) {
			var rw = response.result.values;
			terrainIndex = {};

			for(var i = 0; i < rw.length; i++){
				var r = rw[i];
				terrainIndex[r[0]] = {
					'avo' : r[1] != "-" ? parseInt(r[1]) : 0,
					'def' : r[2] != "-" ? parseInt(r[2]) : 0,
					'heal' : r[3] != "-" ? parseInt(r[3]) : 0,
					'Foot' :  r[4],
					'Beast' : r[5],
					'Mage' : r[6],
					'Mount (T1)' :  r[7],
					'Mount (T2)' :  r[8],
					'Flier' : r[9],
					'attack' : r[10],
					'desc' : r[11]
				}
			}

			updateProgressBar();
			fetchTerrainChart();
		});
	};

	function fetchTerrainChart(){
	    gapi.client.sheets.spreadsheets.values.get({
			spreadsheetId: sheetId,
			majorDimension: "ROWS",
			range: 'Terrain Coordinates!A:ZZ',
	    }).then(function(response) {
			coordMapping = response.result.values;

			updateProgressBar();
			processCharacters();
		});
	};
    
    function processCharacters(){
		characters = {};
    	for(var i = 0; i < characterData.length; i++){
    		var c = characterData[i];
			if(c[1] != ""){
				var currObj = {
				'user'  : c[0],
				'name'  : c[1],
				'class' : getClass(c[2]),
				'unitType' : c[3],
				'spriteUrl' : c[4],
				'level' : c[5],
				'exp'   : c[6],
				'gold'  : c[7],
				'position' : c[8],
				'currHp': c[10],
				'maxHp' : c[11],
				'pStrBuff' : c[12],
				'pMagBuff' : c[13],
				'pSklBuff' : c[14],
				'pSpdBuff' : c[15],
				'pLckBuff' : c[16],
				'pDefBuff' : c[17],
				'pResBuff' : c[18],
				'pMovBuff' : c[19],
				'Str'   : c[21],
				'Mag'   : c[22],
				'Skl'   : c[23],
				'Spd'   : c[24],
				'Lck'   : c[25],
				'Def'   : c[26],
				'Res'   : c[27],
				'mov'   : c[28],
				'weaknesses' : c[29],
				'atk'  : c[30],
				'hit'  : c[31],
				'crit' : c[32],
				'avo'  : c[33],
				'equippedItem' : c[36],
				'inventory' : {},
				'pairUpPartner' : c[43],
				'stance'  : c[44],
				'shields' : c[45],
				'skills' : {},
				'hpBuff'  : c[57],
				'StrBuff' : c[58],
				'MagBuff' : c[59],
				'SklBuff' : c[60],
				'SpdBuff' : c[61],
				'LckBuff' : c[62],
				'DefBuff' : c[63],
				'ResBuff' : c[64],
				'movBuff' : c[65],
				'hitBuff'  : c[66],
				'critBuff' : c[67],
				'avoBuff'  : c[68],
				'weaponRanks' : {
					'w1' : {
						'class' : c[84],
						'rank'  : c[85],
						'exp'   : c[86]
					},
					'w2' : {
						'class' : c[87],
						'rank'  : c[88],
						'exp'   : c[89]
					},
					'w3' : {
						'class' : c[90],
						'rank'  : c[91],
						'exp'   : c[92]
					}
				}
				};
				
				sortWeapons(0,i);
				
				//Match weapons
				for(var w = 37; w < 42; w++)
					currObj.inventory["wpn_" + (w-36)] = getItem(c[w], (w-36), c[36]);
				
				//Match skills
				for(var s = 48; s < 56; s++)
					currObj.skills["skl_" + (s-47)] = getSkill(c[s]);
				
				characters["char_" + i] = currObj;
			}
    	};

		updateProgressBar();
		processEnemies();
    };

	 function processEnemies(){
    	for(var i = 0; i < enemyData.length; i++){
    		var c = enemyData[i];
			if(c[0] != ""){
				var currObj = {
				'name'  : c[0],
				'class' : getClass(c[1]),
				'unitType' : c[2],
				'spriteUrl' : c[3],
				'currHp': c[5],
				'maxHp' : c[6],
				'pStrBuff' : c[7],
				'pMagBuff' : c[8],
				'pSklBuff' : c[9],
				'pSpdBuff' : c[10],
				'pLckBuff' : c[11],
				'pDefBuff' : c[12],
				'pResBuff' : c[13],
				'pMovBuff' : c[14],
				'Str'   : c[16],
				'Mag'   : c[17],
				'Skl'   : c[18],
				'Spd'   : c[19],
				'Lck'   : c[20],
				'Def'   : c[21],
				'Res'   : c[22],
				'mov'   : c[23],
				'level' : c[24],
				'position' : c[25],
				'atk'  : c[26],
				'hit'  : c[27],
				'crit' : c[28],
				'avo'  : c[29],
				'weaknesses' : c[32],
				'equippedItem' : c[33],
				'inventory' : {},
				'pairUpPartner' : c[58] != undefined ? c[58] : "",
				'stance'  : c[59] != undefined ? c[59] : "",
				'shields' : c[60] != undefined ? c[60] : "",
				'skills' : {},
				'hpBuff'  : c[62],
				'StrBuff' : c[63],
				'MagBuff' : c[64],
				'SklBuff' : c[65],
				'SpdBuff' : c[66],
				'LckBuff' : c[67],
				'DefBuff' : c[68],
				'ResBuff' : c[69],
				'movBuff' : c[70],
				'hitBuff'  : c[71],
				'critBuff' : c[72],
				'avoBuff'  : c[73],
				'weaponRanks' : {
					'w1' : {
						'class' : c[40],
						'rank'  : c[41]
					},
					'w2' : {
						'class' : c[42],
						'rank'  : c[43]
					},
					'w3' : {
						'class' : c[44],
						'rank'  : c[45]
					}
				}
				};
				
				sortWeapons(1,i);
				
				//Match weapons
				for(var w = 34; w < 39; w++)
					currObj.inventory["wpn_" + (w-33)] = getItem(c[w], (w-33), c[33]);
				
				//Match skills
				for(var s = 46; s < 54; s++)
					currObj.skills["skl_" + (s-45)] = getSkill(c[s]);
				
				characters["enmy_" + i] = currObj;
			}
    	};

		updateProgressBar();
		fetchMapUrl();
	};
	
	//Fetch map last so all data is finished when it comes time to calc ranges
	function fetchMapUrl(){
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        majorDimension: "ROWS",
		valueRenderOption: "FORMULA",
        range: 'Current Map!A1:A6',
      }).then(function(response) {
		 map = processImageURL(response.result.values[5][0]);
    	 updateProgressBar();
    	 fetchCharacterData();
      });
	};

    //\\//\\//\\//\\//\\//
	// HELPER FUNCTIONS //
	//\\//\\//\\//\\//\\//
    
	function updateProgressBar(){
		if(progress < 100){
			progress = progress + 7.2; //14 calls
    		$rootScope.$broadcast('loading-bar-updated', progress, map);
		}
    };

    function processImageURL(str){
    	return str.substring(8, str.length-4);
    };
    
	function getItem(name, num, equipped){
		var wpn = findItemInfo(name);
		if(num == 1 && name == equipped){ name += " (E)"; }
		return {
			'name' : name,
			'class' : wpn[1],
			'atkStat' : wpn[2],
			'rank' : wpn[3],
			'might' : wpn[4],
			'hit'   : wpn[5],
			'crit'  : wpn[6],
			'crit%Mod'   : wpn[7],
			'critDmgMod' : wpn[8], 
			'avo'   : wpn[9],
			'range' : wpn[11],
			'effective' : wpn[12],
			'StrBuff' : wpn[13],
			'MagBuff' : wpn[14],
			'SklBuff' : wpn[15],
			'SpdBuff' : wpn[16],
			'LckBuff' : wpn[17],
			'DefBuff' : wpn[18],
			'ResBuff' : wpn[19],
			'wpnSlots' : wpn[22],
			'effect' : wpn[28],
			'invHpBuff' : wpn[29],
			'invStrBuff' : wpn[30],
			'invMagBuff' : wpn[31],
			'invSklBuff' : wpn[32],
			'invSpdBuff' : wpn[33],
			'invLckBuff' : wpn[34],
			'invDefBuff' : wpn[35],
			'invResBuff' : wpn[36],
			'invMovBuff' : wpn[37],
			'desc' : wpn[38],
			'spriteUrl' : wpn[39]
		};
	};

	function getSkill(name){
		var skl = findSkillInfo(name);
		return {
			'spriteUrl' : skl[0],
			'name' : skl[1],
			'desc' : skl[2]
		};
	};

	function getClass(name){
		var c = findClassInfo(name);
		return{
			'name' : c[0],
			'movType' : c[1]
		}
	};

	//\\//\\//\\//\\//\\//
	// SEARCH FUNCTIONS //
	//\\//\\//\\//\\//\\//

    function findItemInfo(itemName){
    	if(itemName == undefined || itemName.length == 0)
    		return ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];

		if(itemName.indexOf("(") != -1){ 
			itemName = itemName.substring(0, itemName.indexOf("(")); 
			itemName = itemName.trim(); 
		}
			
    	for(var i = 0; i < itemIndex.length; i++){
    		if(itemName == itemIndex[i][0])
				return itemIndex[i];
    	}

    	return [itemName, "Unknown", "", "", "", "", "", "-", "-", "-",	"-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "", "", "Error: This item could not be located.", "http://i.imgur.com/otiB5n4.png"];
    };
    
    function sortWeapons(toggle, index){
    	var char;
    	if(toggle == 0) char = characterData[index];
		else char = enemyData[index];
    	
    	var found = false;
    	var w, e, s;
		if(toggle == 0){ s = 36; w = 37; e = 42; }
		else{ s= 33; w = 34; e = 39; }

    	for(w; w < e && !found; w++){
    		if(char[s] == char[w])
    			found = true;
    	}
    	w--;
    	
    	if(w != (s+1)){
    		char.splice(w, 1);
    		char.splice((s+1), 0, char[s]);
    	}
    };
    
    function findSkillInfo(skillName){
    	if(skillName == undefined || skillName.length == 0)
    		return ["IMG/skl_blank.png", "-", "-"];
    	
    	for(var i = 0; i < skillIndex.length; i++){
    		if(skillName == skillIndex[i][1])
    			return skillIndex[i];
    	}
    	return ["IMG/skl_blank.png", skillName, "This skill could not be found."];
	};
	
	function findClassInfo(name){
		if(name == undefined || name.length == 0)
    		return ["-", "Foot"];
    	
    	for(var i = 0; i < classIndex.length; i++){
    		if(name == classIndex[i][0])
    			return [classIndex[i][0], classIndex[i][42]];
    	}
    	return [name + "(M)", "Foot"];
	};
		
		
	//******************\\
	// CHARACTER RANGES \\
	//******************\\

	const boxWidth = 31;
	const gridWidth = 1;

	function getMapDimensions(){
    	var map = document.getElementById('mapImg');
		var height = map.naturalHeight; //calculate the height of the map
        	
		height -= (boxWidth * 2);
		height = height / (boxWidth + gridWidth);
		rows = rowNames.slice(0, height);
			
		var width = map.naturalWidth; //calculate the width of the map
		width -= (boxWidth * 3);
		width = width / (boxWidth + gridWidth);
		
		for(var i = 0; i < width; i++)
			cols.push(i+1);

		initializeTerrain();
	};

	function initializeTerrain(){
		terrainLocs = {};

		for(var y = 0; y < cols.length; y++)
				for(var x = 0; x < rows.length; x++)
					terrainLocs[rows[x]+cols[y]] = getDefaultTerrainObj();
			
		//Update terrain types from input list
		for(var r = 0; r < coordMapping.length; r++){
			var row = coordMapping[r];
			for(var c = 0; c < cols.length; c++){
				terrainLocs[rows[r]+cols[c]].type = row[c];
			}
		}

		for(var c in characters)
			if(terrainLocs[characters[c].position] != undefined)
				terrainLocs[characters[c].position].occupiedAffiliation = c.indexOf("char_") > -1 ? "char" : "enemy";

		calculateCharacterRanges();
	};

	function getDefaultTerrainObj(){
		return {
			'type' : "Plain",
			'movCount' : 0,
			'atkCount' : 0,
			'healCount' : 0,
			'occupiedAffiliation' : ''
		}
	};

	function calculateCharacterRanges(){
		for(var c in characters){
			var char = characters[c];
			var list = [];
			var atkList = [];
			var healList = [];
			
			if(char.position.length > 0){
				var horz = rows.indexOf(char.position.match(/[a-zA-Z]+/g)[0]);
				var vert = cols.indexOf(parseInt(char.position.match(/[0-9]+/g)[0]));
				var range = parseInt(char.mov);

				var maxAtkRange = 0;
				var maxHealRange = 0;

				for(var i in char.inventory){
					var item = char.inventory[i];
					var r = formatItemRange(item.range);
					if(isAttackingItem(item.class) && r > maxAtkRange) maxAtkRange = r;
					else if(r > maxHealRange) maxHealRange = r;
				}

				//Deal with Bifrost
				if(maxHealRange > rows.length && maxHealRange > cols.length) maxHealRange = 0;

				var affliliation = c.indexOf("char_") > -1 ? "char" : "enemy";

				recurseRange(horz, vert, range, maxAtkRange, maxHealRange, char.class.movType, affliliation, list, atkList, healList, "_");
				char.range = list;
				char.atkRange = atkList;
				char.healRange = healList;
			}else{			
				char.range = [];
				char.atkRange = [];
				char.healRange = [];
			}
		}

		//Finish load
		updateProgressBar();
	};

	function recurseRange(horzPos, vertPos, range, atkRange, healRange, terrainType, affiliation, list, atkList, healList, trace){
		var coord = rows[horzPos] + cols[vertPos];
		
		//Don't calculate cost for starting tile
		if(trace.length > 1){
			var cost = 1;

			var occupiedAff = terrainLocs[coord].occupiedAffiliation;
			var classCost = terrainIndex[terrainLocs[coord].type][terrainType];

			//Unit cannot traverse tile if it has no cost or it is occupied by an enemy unit
			if(   classCost == undefined
			   || classCost == "-"
			   || (occupiedAff.length > 0 && occupiedAff != affiliation)
			){
				//recurseItemRange(horzPos, vertPos, atkRange, list, atkList, "_", true);
				//recurseItemRange(horzPos, vertPos, healRange, list, healList, "_", true);
				return;
			}
			else cost = parseFloat(classCost);
			
			range -= cost;
		}
		
		if(list.indexOf(coord) == -1) list.push(coord);
		trace += coord + "_";

		if(range <= 0){ //base case
			//recurseItemRange(horzPos, vertPos, atkRange, list, atkList, "_", false);
			//recurseItemRange(horzPos, vertPos, healRange, list, healList, "_", false);
			return;
		} 

		if(horzPos > 0 && trace.indexOf("_" + rows[horzPos-1] + cols[vertPos] + "_") == -1)
			recurseRange(horzPos-1, vertPos, range, atkRange, healRange, terrainType, affiliation, list, atkList, healList, trace);
		if(horzPos < rows.length-1 && trace.indexOf("_" + rows[horzPos+1] + cols[vertPos] + "_") == -1)
			recurseRange(horzPos+1, vertPos, range, atkRange, healRange, terrainType, affiliation, list, atkList, healList, trace);

		if(vertPos > 0 && trace.indexOf("_" + rows[horzPos] + cols[vertPos-1] + "_") == -1)
			recurseRange(horzPos, vertPos-1, range, atkRange, healRange, terrainType, affiliation, list, atkList, healList, trace);
		if(vertPos < cols.length-1 && trace.indexOf("_" + rows[horzPos] + cols[vertPos+1] + "_") == -1)
			recurseRange(horzPos, vertPos+1, range, atkRange, healRange, terrainType, affiliation, list, atkList, healList, trace);
	};

	function recurseItemRange(horzPos, vertPos, range, list, itemList, trace, countSelf){
		if(range <= 0) return; //base case
		var coord = rows[horzPos] + cols[vertPos];

		if(countSelf || trace.length > 1){
			//Make sure tile can be traversed by some unit
			var classCost = terrainIndex[terrainLocs[coord].type].attack;
			if(classCost == undefined || classCost == "-") return;
			range -= parseFloat(classCost);

			if(list.indexOf(coord) == -1 && itemList.indexOf(coord) == -1) 
				itemList.push(coord);
		}

		trace += coord + "_";

		if(horzPos > 0 && trace.indexOf("_" + rows[horzPos-1] + cols[vertPos] + "_") == -1)
			recurseItemRange(horzPos-1, vertPos, range, list, itemList, trace, countSelf);
		if(horzPos < rows.length-1 && trace.indexOf("_" + rows[horzPos+1] + cols[vertPos] + "_") == -1)
			recurseItemRange(horzPos+1, vertPos, range, list, itemList, trace, countSelf);
		
		if(vertPos > 0 && trace.indexOf("_" + rows[horzPos] + cols[vertPos-1] + "_") == -1)
			recurseItemRange(horzPos, vertPos-1, range, list, itemList, trace, countSelf);
		if(vertPos < cols.length-1 && trace.indexOf("_" + rows[horzPos] + cols[vertPos+1] + "_") == -1)
			recurseItemRange(horzPos, vertPos+1, range, list, itemList, trace, countSelf);
	};

	function formatItemRange(range){
		if(range.indexOf("~") != -1 && range.length > 1)
			range = range.substring(range.indexOf("~")+1, range.length);
		range = range.trim();
		return range.match(/^[0-9]+$/) != null ? parseInt(range) : 0;
	};

	function isAttackingItem(wpnClass){
		return wpnClass != "Staff";
	};
}]);