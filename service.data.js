app.service('DataService', ['$rootScope', function ($rootScope) {
	var sheetId = '1HuDE0QUc1pechu7Q9aK0z4MdIEWPyIsTRE0KC57-T5c';
	var progress = 0;
	var characters = {};
	var characterData, itemIndex, skillIndex;
	
	this.getCharacters = function(){ return characters; };
	this.loadMapData = function(){ fetchCharacterData(); };
	
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
          majorDimension: "COLUMNS",
          range: 'Stats!B5:ZZ5',
        }).then(function(response) {
      	 var images = response.result.values;
      	 
      	 for(var i = 0; i < characterData; i++){
      		 characterData[i][4] = processImageURL(images[i]);
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
   			 'automatonPos' : c[9],
   			 'currHp': c[11],
   			 'maxHp' : c[12],
   			 'pStrBuff' : c[13],
  			 'pMagBuff' : c[14],
  			 'pSklBuff' : c[15],
  			 'pSpdBuff' : c[16],
  			 'pLckBuff' : c[17],
  			 'pDefBuff' : c[18],
  			 'pResBuff' : c[19],
  			 'pMovBuff' : c[20],
   			 'Str'   : c[22],
   			 'Mag'   : c[23],
   			 'Skl'   : c[24],
   			 'Spd'   : c[25],
   			 'Lck'   : c[26],
   			 'Def'   : c[27],
   			 'Res'   : c[28],
   			 'mov'   : c[29],
   			 'weaknesses' : c[30],
   			 'atk'  : c[31],
  			 'hit'  : c[32],
  			 'crit' : c[33],
  			 'avo'  : c[34],
  			 'equippedItem' : c[35],
   			 'inventory' : {},
   			 'pairUpPartner' : c[44],
   			 'stance'  : c[45],
   			 'shields' : c[46],
   			 'skills' : {},
   			 'hpBuff'  : c[58],
   			 'StrBuff' : c[59],
   			 'MagBuff' : c[60],
   			 'SklBuff' : c[61],
   			 'SpdBuff' : c[62],
   			 'LckBuff' : c[63],
   			 'DefBuff' : c[64],
   			 'ResBuff' : c[65],
   			 'movBuff' : c[66],
   			 'hitBuff'  : c[67],
   			 'critBuff' : c[68],
   			 'avoBuff'  : c[69],
   			 'weaponRanks' : {
   				 'w1' : {
   					'class' : c[76],
   					'rank'  : c[77],
   					'exp'   : c[78]
   				 },
   				 'w2' : {
   					'class' : c[79],
  					'rank'  : c[80],
  					'exp'   : c[81]
   				 },
   				 'w3' : {
   					'class' : c[82],
  					'rank'  : c[83],
  					'exp'   : c[84]
   				 }
   			 }
    		};
    		
    		sortWeapons(0,i);
    		
    		//Match weapons
    		for(var w = 38; w <= 42; w++)
    			currObj.inventory["wpn_" + (w-37)] = getItem(c[w]);
    		
    		//Match skills
    		for(var s = 49; s <= 56; s++)
    			currObj.skills["skl_" + (s-48)] = getSkill(c[s]);
    		
    		characters["char_" + i] = currObj;
    	};

		updateProgressBar();
    };
    
    //\\//\\//\\//\\//\\//
	// HELPER FUNCTIONS //
	//\\//\\//\\//\\//\\//
    
	function updateProgressBar(){
		if(progress < 100){
			progress = progress + 17; //6 calls
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
			'type' : wpn[1],
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
    	for(w = 38; w <= 42 && !found; w++){
    		if(char[w] == char[37])
    			found = true;
    	}
    	w--;
    	
    	if(w != 38){
    		char.splice(w, 1);
    		char.splice(38, 0, char[37]);
    	}
    };
    
    function findSkillInfo(skillName){
    	if(skillName.length == 0)
    		return ["-", "-", "-"];
    	
    	for(var i = 0; i < skillIndex.length; i++){
    		if(skillName == skillIndex[i][1])
    			return skillIndex[i];
    	}
    	return ["", skillName, "This skill could not be found."];
    };
}]);