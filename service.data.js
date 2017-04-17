app.service('DataService', ['$rootScope', function ($rootScope) {
	var sheetId = '1HuDE0QUc1pechu7Q9aK0z4MdIEWPyIsTRE0KC57-T5c';
	var progress = 0;
	var characters = null;
	var map, characterData, enemyData, itemIndex, skillIndex;
	
	this.getCharacters = function(){ return characters; };
	this.getMap = function(){ return map; };
	this.loadMapData = function(){ fetchMapUrl(); };
	
	//\\//\\//\\//\\//\\//
	// DATA AJAX CALLS  //
	//\\//\\//\\//\\//\\//
	
	function fetchMapUrl(){
      gapi.client.sheets.spreadsheets.values.get({
        spreadsheetId: sheetId,
        majorDimension: "ROWS",
		valueRenderOption: "FORMULA",
        range: 'Current Map!A1:A5',
      }).then(function(response) {
    	 map = processImageURL(response.result.values[4][0]);
    	 updateProgressBar();
    	 fetchCharacterData();
      });
	};

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
      	 
      	 for(var i = 0; i < images.length; i++){
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
      	 //var images = response.result.values[0];
      	 
      	 for(var i = 0; i < enemyData.length; i++){
      		 enemyData[i][3] = "IMG/kitsune.gif"; //processImageURL(images[i]);
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
            
            for(var i = 0; i < skillIndex.length; i++)
            	skillIndex[i][0] = processImageURL(images[i]);
            	
            updateProgressBar();
            processCharacters();
          });
    };
    
    function processCharacters(){
		characters = {};
    	for(var i = 0; i < characterData.length; i++){
    		var c = characterData[i];
    		var currObj = {
   			 'user'  : c[0],
   			 'name'  : c[1],
   			 'class' : c[2],
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
   					'class' : c[75],
   					'rank'  : c[76],
   					'exp'   : c[77]
   				 },
   				 'w2' : {
   					'class' : c[78],
  					'rank'  : c[79],
  					'exp'   : c[80]
   				 },
   				 'w3' : {
   					'class' : c[81],
  					'rank'  : c[82],
  					'exp'   : c[83]
   				 }
   			 }
    		};
    		
    		sortWeapons(0,i);
    		
    		//Match weapons
    		for(var w = 37; w < 42; w++)
    			currObj.inventory["wpn_" + (w-36)] = getItem(c[w]);
    		
    		//Match skills
    		for(var s = 48; s < 56; s++)
    			currObj.skills["skl_" + (s-47)] = getSkill(c[s]);
    		
    		characters["char_" + i] = currObj;
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
				'class' : c[1],
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
				'pairUpPartner' : c[58],
				'stance'  : c[59],
				'shields' : c[60],
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
				
				//sortWeapons(0,i);
				
				//Match weapons
				for(var w = 34; w < 39; w++)
					currObj.inventory["wpn_" + (w-33)] = getItem(c[w]);
				
				//Match skills
				for(var s = 46; s < 54; s++)
					currObj.skills["skl_" + (s-45)] = getSkill(c[s]);
				
				characters["enmy_" + i] = currObj;
			}
    	};

		updateProgressBar();
    };

    //\\//\\//\\//\\//\\//
	// HELPER FUNCTIONS //
	//\\//\\//\\//\\//\\//
    
	function updateProgressBar(){
		if(progress < 100){
			progress = progress + 10; //10 calls
    		$rootScope.$broadcast('loading-bar-updated', progress);
		}
    };

    function processImageURL(str){
    	return str.substring(8, str.length-4);
    };
    
	function getItem(name){
		var wpn = findItemInfo(name);
		return {
			'name' : wpn[0],
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

	//\\//\\//\\//\\//\\//
	// SEARCH FUNCTIONS //
	//\\//\\//\\//\\//\\//

    function findItemInfo(itemName){
    	if(itemName.length == 0)
    		return ["-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"];
    	
    	for(var i = 0; i < itemIndex.length; i++){
    		if(itemName == itemIndex[i][0])
    			return itemIndex[i];
    	}
    	return ["Unknown", "-",	"-", "-", "-", "-",	"-", "-", "-", "-",	"-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "Error: This item could not be located.", "http://i.imgur.com/otiB5n4.png"];
    };
    
    function sortWeapons(toggle, index){
    	var char;
    	if(toggle == 0) char = characterData[index];
    	
    	var found = false;
    	var w;
    	for(w = 37; w < 42 && !found; w++){
    		if(char[36] == char[w])
    			found = true;
    	}
    	w--;
    	
    	if(w != 37){
    		char.splice(w, 1);
    		char.splice(37, 0, char[36]);
    	}
    };
    
    function findSkillInfo(skillName){
    	if(skillName.length == 0)
    		return ["IMG/SKL/skl_blank.png", "-", "-"];
    	
    	for(var i = 0; i < skillIndex.length; i++){
    		if(skillName == skillIndex[i][1])
    			return skillIndex[i];
    	}
    	return ["IMG/SKL/skl_blank.png", skillName, "This skill could not be found."];
    };
}]);