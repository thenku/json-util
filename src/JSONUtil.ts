// import chalk from "chalk";
import lodashMerge from "lodash.merge";

export type myFilterType = RegExp|string|number|((a:any)=>boolean);
export type ISortedStringHierarchy = Array<string | ISortedStringHierarchy>;
export type ISortedHierarchy = Array<any | ISortedHierarchy>;


class JSONUtilClass{
    getValueUsingKeyArray(obj: any, keypathArray:(string|number)[] = []){
		if(!obj){
			return null;
		}
		let result = obj;
		for (let i = 0; i < keypathArray.length; i++) {
			const key = keypathArray[i];
			const value = result[key];
			if(value || value === ""){
				result = value;
			}else{
				result = null;
				break;
			}
		}
		return result;
	}
    setValueAt(obj: any, keypathArray:(string|number)[], val:any){
		let result = obj;
		if(!keypathArray || keypathArray.length == 0){
			return result;
		}else{
			const key = keypathArray[0];
			if(keypathArray.length == 1){
				result[key] = val;
			}else{
				if(!result[key]){
					result[key] = {}
				}
				result[key] = this.setValueAt(result[key], keypathArray.slice(1), val)
			}
		}
		return result;
	}
	deleteOnKeyPathsRef(obj:any, keypaths:string[][] = []){
		if (!obj) {
            return null;
        }
       
        let len1 = keypaths.length;
        while (len1--) {
            const keypath = keypaths[len1];
            const len2 = keypath.length;
            let i = 0;
            while (i < len2) {
                //loop to see if node exists if it does then delete it
                let key = keypath[i];
                if (i == len2 - 1) {
                    delete obj[key];
                    break;
                }
                if (!obj[key]) {
                    break;  //if node does not exist then break
                }
                obj = obj[key];
                i++;
            }
        }
	}
    keyPath2Array(keypath = "", sep = "/"){
		return keypath.split(sep).filter((isEmpty)=>isEmpty);
	}
	array2Keypath(array:string[] = [], sep = "/"){
		return array.join(sep);
	}
    
	searchColsGetRow1(obj:any, query:Record<string,string|number>, arrayKeyPath:string[]=[]){
		const table = this.getValueUsingKeyArray(obj, arrayKeyPath);
		if(!table)return null;

		const colNames = Object.keys(query);
		for (const key in table) {
			const row = table[key];
			let matchedNr = 0;
			for (const key2 in query) {
				const value = query[key2];
				if(value === row[key2]){
					matchedNr++;
				}
			}
			if(matchedNr == colNames.length){
				return row;
			}
		}
		return null;
	}
	searchArrayRowIndex(array:any[], query:Record<string,string|number>){
		const colNames = Object.keys(query);
		for (let index = 0; index < array.length; index++) {
			const row = array[index];
			let matchedNr = 0;
			for (const key2 in query) {
				const value = query[key2];
				if(value === row[key2]){
					matchedNr++;
				}
			}
			if(matchedNr == colNames.length){
				return index;
			}
		}
		return -1;
	}
	searchColsGetRow1Regex(obj:any, query:Record<string,RegExp>, arrayKeyPath:string[]=[]){
		const table = this.getValueUsingKeyArray(obj, arrayKeyPath);
		if(!table)return null;

		const colNames = Object.keys(query);
		for (const key in table) {
			const row = table[key];
			let matchedNr = 0;
			for (const key2 in query) {
				const re:RegExp = query[key2];
				if(re.test(`${row[key2]}`)){
					matchedNr++;
				}
			}
			if(matchedNr == colNames.length){
				return row;
			}
		}
		return null;
	}
	searchArrayColsGetList(obj:any, query:Record<string,string|number>, keyPath:string[]=[]){
		const table:Record<string,any>[] = this.getValueUsingKeyArray(obj, keyPath);
		if(!table)return [];
		
		const table2: any[] = [];

		const colNames = Object.keys(query);
		for (const key in table) {
			const row = table[key];
			let matched = true;
			for (const key2 in query) {
				const value = query[key2];
				if(value != row[key2]){
					matched = false;
					break;
				}
			}
			if(matched){
				table2.push(row);
			}
		}
		return table2;
	}
	
	filterArrayRows(table:any[] | Record<string, any>, query:Record<string,myFilterType>){
		const table2: any[] = [];

		for (const key in table) {
			const row = table[key];
			let matched = true;
			for (const key2 in query) {
				const tester:myFilterType = query[key2];
				if(typeof tester == "string" || typeof tester == "number"){
					if(tester != row[key2]){
						matched = false;
						break;
					}
				}else if(typeof tester == "object"){
					if(!tester.test(`${row[key2]}`)){
						matched = false;
						break;
					}
				}else if(typeof tester == "function"){
					if(!tester(`${row[key2]}`)){
						matched = false;
						break;
					}
				}
			}
			if(matched){
				table2.push(row);
			}
		}
		return table2;
	}
	addToArrayTypeValue(rowSource:Record<string,any>, rowDest:Record<string,any>, arrayColumns: string[]=[]){
        if(arrayColumns.length > 0){
            for (let k = 0; k < arrayColumns.length; k++) {
                const column = arrayColumns[k];
                const value = rowSource[column];
                const existingArray:any[] = rowDest[column];

                if(!existingArray){
                    rowDest[column] = [value];
                }else{
                    if(value && existingArray && !existingArray.includes(value)){
                        rowDest[column].push(value);
                    }
                }
            }
        }
        return rowDest;
    }
	convertStringTypeToValues(str:string, type: "object"|"array"){
        const level1 = str.replace(/ /g,'').split(';').filter(e=>e);
        if(type== "array"){
            return level1;
        }
        const level2 = {}
        for (let i = 0; i < level1.length; i++) {
            const combo = level1[i].split(':');
            const key = combo[0];
            const value = combo[1];
            if(key && value){
                level2[key] = value;
            }
        }
        return level2;
    }
	convert2StringType(data:any){
		if(Array.isArray(data)){
			return data.join(';');
		}else if(typeof data == 'object'){
			return Object.keys(data).map(key=>`${key}:${data[key]}`).join(';');
		}else if(typeof data == "string"){
			return data;
		}
		else{
			return JSON.stringify(data);
		}
	}
	convertArrayRowsToIDRows(array:any[], idCols2Use:string[]){
		const obj = {}
		if(idCols2Use.length > 0){
			for (let i = 0; i < array.length; i++) {
				const row = array[i];
				let id = idCols2Use.map(col=>row[col]).join('-');
				obj[id] = row;
			}
		}
		return obj;
	}
	
	getStrippedRow(row:object, allowKeys:string[]){
		let outputState = {};
		if(allowKeys){
			outputState = {};
			for (let i = 0; i < allowKeys.length; i++) {
				const key = allowKeys[i];
				if(typeof row[key] != "undefined" || row[key] == false || row[key] == 0){//boolean false and 0 also allowed
					outputState[key] = row[key];
				}
			}
		}
		return outputState;
	}
	
	modifyKeysWithValueMatchRegex(obj, regex = new RegExp(''), execute = (obj, keyPath) => { console.log( keyPath) }){
		const listOfPaths = [];
	}
	modifyObjectOnKeypaths(obj: any, keypaths:string[] = []){
		const deepCopy = JSON.parse(JSON.stringify(obj));
		// console.log(keypaths.length)
		keypaths.forEach((keypath)=>{
			// console.log(this.keyPathRef(deepCopy, keypath));
			// delete this.keyPathRef(deepCopy, keypath);
			// console.log(this.keyPathRef(deepCopy, keypath));
		})
		return deepCopy;
	}
	
	deleteOnKeyPathsCopy(obj, keypaths:string[][] = []){
		let deepCopy = JSON.parse(JSON.stringify(obj));
		keypaths.forEach((keypath)=>{
			keypath.reduce((acc, key, index) => {
					if (index === keypath.length - 1) {
							delete acc[key];
							return true;
					}
					return acc[key];
			}, deepCopy);
		});
		return deepCopy;
	}
	
	deleteOnOrderedHierarchyRefMatchKey(arrayObj:ISortedStringHierarchy, testFunc:(o:any)=>boolean, removeUndefined: boolean = true){
		const arrayCopy = this.deepCopy(arrayObj) as ISortedStringHierarchy;
		for (let i = 0; i < arrayObj.length; i++) {
			const element = arrayObj[i];
			if(Array.isArray(element)){
				const innerArr = this.deleteOnOrderedHierarchyRefMatchKey(element, testFunc, removeUndefined);
				if(innerArr.length == 0){
					arrayCopy.splice(i, 1);
				}else{
					arrayCopy[i] == innerArr;
				}
			}
			else if(typeof element == "string"){
				if(testFunc(element)){
					arrayCopy.splice(i, 1);
				}
			}else if(removeUndefined && typeof element == "undefined"){
				arrayCopy.splice(i, 1);
			}
		}
		return arrayCopy;
	}
	getTrueString(array:any = []){
		return array.reduce((prev:any,cur:any)=>prev?prev:cur);
	}
	
	mergeIntoAt(objInto:any, useCopy:boolean, objOverrider: any, atKeyPathArray?: (string|number)[]){//not done yet
		//lodash merge -- uses ref
		// lodashMerge()
		let result = {};
		if(atKeyPathArray){
			if(!this.hasKeyPath(objInto, atKeyPathArray)){
				this.createKeyPathInObject(objInto, atKeyPathArray);
			}
		}else{
			if(useCopy){
				result = lodashMerge(result, objInto, objOverrider);
			}else{
				result = lodashMerge(objInto, objOverrider);
			}
		}
		return result;
	}
	deepCopy(obj:any){
		if(typeof obj == "string"){
			return obj;
		}
		return JSON.parse(JSON.stringify(obj))
	}
	tryParse(text:any){
		let json = null;
		try{
			json = JSON.parse(text)
		}catch(e){
			console.log(e);
		}
		return json;
	}
	getRoughSizeOfObject(object:any){
		let objectList:any[] = [];
		let stack = [ object ];
		let bytes = 0;
	
		while ( stack.length ) {
			var value:any = stack.pop();
			if ( typeof value === 'boolean' ) {
				bytes += 4;
			}
			else if ( typeof value === 'string' ) {
				bytes += value.length * 2;
			}
			else if ( typeof value === 'number' ) {
				bytes += 8;
			}
			else if(typeof value === 'object' && objectList.indexOf( value ) === -1)
			{
				objectList.push( value );
	
				for( var i in value ) {
					stack.push( value[ i ] );
				}
			}
		}
		return bytes;
	}
	hasKeyPath(obj:any, keypathArray:(string|number)[]){
		let ans: boolean = true;
		if(!obj){
			return false;
		}
		let placeholder:Object = obj;
		for (let i = 0; i < keypathArray.length; i++) {
			const key = keypathArray[i];
			if(!placeholder.hasOwnProperty(key)){
				ans = false;
				break;
			}
			placeholder = placeholder[key]
		}
		return ans;
	}
	
	createKeyPathInObject(obj:any, keypathArray:(string|number)[]){//overwrites existing keys
		const result = (obj) ? obj : {};
		let placeholder = result;
		for (let i = 0; i < keypathArray.length; i++) {
			const key = keypathArray[i];
			if(!placeholder[key]){
				placeholder[key] = {}
			}
			placeholder = placeholder[key]
		}
		return result;
	}
	getKeyOfValue(obj:any, value:string){
		let key = ``;
		for (const k in obj) {
			if(obj[k]==value){
				key = k;
				break;
			}
		}
		return key;
	}
	createKeySet(objects:Record<string,any>[]):any | null{
		let result:any = {}
		for (let i = 0; i < objects.length; i++) {
			const obj = objects[i];
			for (const key in obj) {
				if (!result.hasOwnProperty(key)) {
					result[key] = obj[key];
				}else{
					result = null;
					console.log(`key ${key} already exists!`)
					break;
				}
			}
		}
		return result;
	}
	getKeysMatchingValue(obj, testFunc = (val) => false, curPath = '', keyFilter = (key) => true){
		const listOfPaths: string[] = [];
		const keys:string[] = Object.keys(obj);
		keys.forEach((key)=>{
			if(keyFilter(key) && testFunc(obj[key])){
				listOfPaths.push(`${curPath}${key}`);
			}
			else if(typeof obj[key] === 'object'){
				const deeper = this.getKeysMatchingValue(obj[key] , testFunc, `${curPath}${key}/`, keyFilter);
				if(deeper.length > 0){
					listOfPaths.push(...deeper);
				}
			}
		});
		if(curPath.length == 0){
			return listOfPaths.sort();
		}else{
			return listOfPaths;
		}
	}
	sortObjectKeys(obj:any){
		const sortedObj = {};
        Object.keys(obj).sort().forEach(key=>{
			if(typeof obj[key] === "object"){
				obj[key] = this.sortObjectKeys(obj[key]);
			}
            sortedObj[key] = obj[key];
		});
		return sortedObj;
	}

	tryAlignSortArrayOfObjects(array1, array2:string[], keyLinks = {}){//makes copies
		const keyLinksKeys = Object.keys(keyLinks);
		const matches: boolean[] = [];
		const sortInlineWith1: string[] = [];
		const notMatched: string[] = [];

		const array2Set: string[] = [];
		array2.forEach((item, i)=>{
			if(array2Set.indexOf(item) == -1){
				array2Set.push(item)
			}
		});

		for (let i = 0; i < array2.length; i++) {
			const a2 = array2[i];
			let match = false;
			let trueJ = 0;

			for (let j = 0; j < array1.length; j++) {
				const a1 = array1[j];
				for (let k = 0; k < keyLinksKeys.length; k++) {
					const key1 = keyLinksKeys[k];
					const key2 = keyLinks[key1];
					if(a2[key2] == a1[key1]){
						match = true;
						trueJ = j;
						break;
					}
				}
				if(match){
					break;
				}
			}
			if(match){
				console.log('match'+trueJ)
				sortInlineWith1[trueJ] = a2;
			}else{
				notMatched.push(a2);
			}
			matches[i] = match;
		}
		
		
		const trues = matches.filter((val)=>val).length;
		const falses = matches.length - trues;
		const array2Length = array2.length;
		const array2SetLength = array2Set.length;
		const merged = sortInlineWith1.concat(notMatched);

		return {
			trues,
			falses,
			array2Length,
			array2SetLength,
			sortInlineWith1Length: sortInlineWith1.length,
			array1Length: array1.length,
			mergedLength: merged.length,
			array1PlusFalsesLength: array1.length + falses,
			sortInlineWith1,
			// notMatched,
			// merged,
		};
	}
	getClosestMatch(arr = []){

	}
	getDifferenceIfFieldChanged(){//

	}
	getAllUniqueKeysInCollection(){
		
	}
	
	log(json:any, color:"yellow"|"normal"|"red"|"gray"|"blue"|"green"|"purple" = "normal"){
		let str = json;
		if(typeof json == "object"){
			str = JSON.stringify(json,null,"\t");
		}
		switch (color) {
			case "normal":
				console.log(str);
				break;
			case "yellow":
				console.log(`\x1b[33m${str}\x1b[0m`);
				break;
			case "blue":
				console.log(`\x1b[34m${str}\x1b[0m`);
				break;
			case "red":
				console.log(`\x1b[31m${str}\x1b[0m`);
				break;
			case "green":
				console.log(`\x1b[32m${str}\x1b[0m`);
				break;
			case "purple":
				console.log(`\x1b[35m${str}\x1b[0m`);
				break;
			case "gray":
				console.log(`\x1b[66m${str}\x1b[0m`);
				break;
		}
		
	}
	
	getRandomSortArray(array, limit = 0){
		const randArray = [...array];
		const length = randArray.length;
		for (let i = 0; i < length; i++) {
			const randomIndex = Math.floor(Math.random() * length);
			[randArray[i], randArray[randomIndex]] = [randArray[randomIndex], randArray[i]];
		}
		if(limit > 0){
			return randArray.slice(0, limit);
		}else{
			return randArray;
		}
	}
}
const JSONUtil = new JSONUtilClass();
export default JSONUtil;