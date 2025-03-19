"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import chalk from "chalk";
const lodash_merge_1 = __importDefault(require("lodash.merge"));
class JSONUtilClass {
    getValueUsingKeyArray(obj, keypathArray = []) {
        if (!obj) {
            return null;
        }
        let result = obj;
        for (let i = 0; i < keypathArray.length; i++) {
            const key = keypathArray[i];
            const value = result[key];
            if (value || value === "") {
                result = value;
            }
            else {
                result = null;
                break;
            }
        }
        return result;
    }
    setValueAt(obj, keypathArray, val) {
        let result = obj;
        if (!keypathArray || keypathArray.length == 0) {
            return result;
        }
        else {
            const key = keypathArray[0];
            if (keypathArray.length == 1) {
                result[key] = val;
            }
            else {
                if (!result[key]) {
                    result[key] = {};
                }
                result[key] = this.setValueAt(result[key], keypathArray.slice(1), val);
            }
        }
        return result;
    }
    keyPath2Array(keypath = "", sep = "/") {
        return keypath.split(sep).filter((isEmpty) => isEmpty);
    }
    array2Keypath(array = [], sep = "/") {
        return array.join(sep);
    }
    deleteOnKeyPathsRef(obj, keypaths = []) {
        keypaths.forEach((keypath) => {
            keypath.reduce((acc, key, index) => {
                if (index === keypath.length - 1) {
                    delete acc[key];
                    return true;
                }
                return acc[key];
            }, obj);
        });
        return obj;
    }
    searchColsGetRow1(obj, query, arrayKeyPath = []) {
        const table = this.getValueUsingKeyArray(obj, arrayKeyPath);
        if (!table)
            return null;
        const colNames = Object.keys(query);
        for (const key in table) {
            const row = table[key];
            let matchedNr = 0;
            for (const key2 in query) {
                const value = query[key2];
                if (value === row[key2]) {
                    matchedNr++;
                }
            }
            if (matchedNr == colNames.length) {
                return row;
            }
        }
        return null;
    }
    searchArrayRowIndex(array, query) {
        const colNames = Object.keys(query);
        for (let index = 0; index < array.length; index++) {
            const row = array[index];
            let matchedNr = 0;
            for (const key2 in query) {
                const value = query[key2];
                if (value === row[key2]) {
                    matchedNr++;
                }
            }
            if (matchedNr == colNames.length) {
                return index;
            }
        }
        return -1;
    }
    searchColsGetRow1Regex(obj, query, arrayKeyPath = []) {
        const table = this.getValueUsingKeyArray(obj, arrayKeyPath);
        if (!table)
            return null;
        const colNames = Object.keys(query);
        for (const key in table) {
            const row = table[key];
            let matchedNr = 0;
            for (const key2 in query) {
                const re = query[key2];
                if (re.test(`${row[key2]}`)) {
                    matchedNr++;
                }
            }
            if (matchedNr == colNames.length) {
                return row;
            }
        }
        return null;
    }
    searchArrayColsGetList(obj, query, keyPath = []) {
        const table = this.getValueUsingKeyArray(obj, keyPath);
        if (!table)
            return [];
        const table2 = [];
        const colNames = Object.keys(query);
        for (const key in table) {
            const row = table[key];
            let matched = true;
            for (const key2 in query) {
                const value = query[key2];
                if (value != row[key2]) {
                    matched = false;
                    break;
                }
            }
            if (matched) {
                table2.push(row);
            }
        }
        return table2;
    }
    filterArrayRows(table, query) {
        const table2 = [];
        for (const key in table) {
            const row = table[key];
            let matched = true;
            for (const key2 in query) {
                const tester = query[key2];
                if (typeof tester == "string" || typeof tester == "number") {
                    if (tester != row[key2]) {
                        matched = false;
                        break;
                    }
                }
                else if (typeof tester == "object") {
                    if (!tester.test(`${row[key2]}`)) {
                        matched = false;
                        break;
                    }
                }
                else if (typeof tester == "function") {
                    if (!tester(`${row[key2]}`)) {
                        matched = false;
                        break;
                    }
                }
            }
            if (matched) {
                table2.push(row);
            }
        }
        return table2;
    }
    addToArrayTypeValue(rowSource, rowDest, arrayColumns = []) {
        if (arrayColumns.length > 0) {
            for (let k = 0; k < arrayColumns.length; k++) {
                const column = arrayColumns[k];
                const value = rowSource[column];
                const existingArray = rowDest[column];
                if (!existingArray) {
                    rowDest[column] = [value];
                }
                else {
                    if (value && existingArray && !existingArray.includes(value)) {
                        rowDest[column].push(value);
                    }
                }
            }
        }
        return rowDest;
    }
    convertStringTypeToValues(str, type) {
        const level1 = str.replace(/ /g, '').split(';').filter(e => e);
        if (type == "array") {
            return level1;
        }
        const level2 = {};
        for (let i = 0; i < level1.length; i++) {
            const combo = level1[i].split(':');
            const key = combo[0];
            const value = combo[1];
            if (key && value) {
                level2[key] = value;
            }
        }
        return level2;
    }
    convert2StringType(data) {
        if (Array.isArray(data)) {
            return data.join(';');
        }
        else if (typeof data == 'object') {
            return Object.keys(data).map(key => `${key}:${data[key]}`).join(';');
        }
        else if (typeof data == "string") {
            return data;
        }
        else {
            return JSON.stringify(data);
        }
    }
    convertArrayRowsToIDRows(array, idCols2Use) {
        const obj = {};
        if (idCols2Use.length > 0) {
            for (let i = 0; i < array.length; i++) {
                const row = array[i];
                let id = idCols2Use.map(col => row[col]).join('-');
                obj[id] = row;
            }
        }
        return obj;
    }
    getStrippedRow(row, allowKeys) {
        let outputState = {};
        if (allowKeys) {
            outputState = {};
            for (let i = 0; i < allowKeys.length; i++) {
                const key = allowKeys[i];
                if (typeof row[key] != "undefined" || row[key] == false || row[key] == 0) { //boolean false and 0 also allowed
                    outputState[key] = row[key];
                }
            }
        }
        return outputState;
    }
    modifyKeysWithValueMatchRegex(obj, regex = new RegExp(''), execute = (obj, keyPath) => { console.log(keyPath); }) {
        const listOfPaths = [];
    }
    modifyObjectOnKeypaths(obj, keypaths = []) {
        const deepCopy = JSON.parse(JSON.stringify(obj));
        // console.log(keypaths.length)
        keypaths.forEach((keypath) => {
            // console.log(this.keyPathRef(deepCopy, keypath));
            // delete this.keyPathRef(deepCopy, keypath);
            // console.log(this.keyPathRef(deepCopy, keypath));
        });
        return deepCopy;
    }
    deleteOnKeyPathsCopy(obj, keypaths = []) {
        let deepCopy = JSON.parse(JSON.stringify(obj));
        keypaths.forEach((keypath) => {
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
    deleteOnOrderedHierarchyRefMatchKey(arrayObj, testFunc, removeUndefined = true) {
        const arrayCopy = this.deepCopy(arrayObj);
        for (let i = 0; i < arrayObj.length; i++) {
            const element = arrayObj[i];
            if (Array.isArray(element)) {
                const innerArr = this.deleteOnOrderedHierarchyRefMatchKey(element, testFunc, removeUndefined);
                if (innerArr.length == 0) {
                    arrayCopy.splice(i, 1);
                }
                else {
                    arrayCopy[i] == innerArr;
                }
            }
            else if (typeof element == "string") {
                if (testFunc(element)) {
                    arrayCopy.splice(i, 1);
                }
            }
            else if (removeUndefined && typeof element == "undefined") {
                arrayCopy.splice(i, 1);
            }
        }
        return arrayCopy;
    }
    getTrueString(array = []) {
        return array.reduce((prev, cur) => prev ? prev : cur);
    }
    mergeIntoAt(objInto, useCopy, objOverrider, atKeyPathArray) {
        //lodash merge -- uses ref
        // lodashMerge()
        let result = {};
        if (atKeyPathArray) {
            if (!this.hasKeyPath(objInto, atKeyPathArray)) {
                this.createKeyPathInObject(objInto, atKeyPathArray);
            }
        }
        else {
            if (useCopy) {
                result = (0, lodash_merge_1.default)(result, objInto, objOverrider);
            }
            else {
                result = (0, lodash_merge_1.default)(objInto, objOverrider);
            }
        }
        return result;
    }
    deepCopy(obj) {
        if (typeof obj == "string") {
            return obj;
        }
        return JSON.parse(JSON.stringify(obj));
    }
    tryParse(text) {
        let json = null;
        try {
            json = JSON.parse(text);
        }
        catch (e) {
            console.log(e);
        }
        return json;
    }
    getRoughSizeOfObject(object) {
        let objectList = [];
        let stack = [object];
        let bytes = 0;
        while (stack.length) {
            var value = stack.pop();
            if (typeof value === 'boolean') {
                bytes += 4;
            }
            else if (typeof value === 'string') {
                bytes += value.length * 2;
            }
            else if (typeof value === 'number') {
                bytes += 8;
            }
            else if (typeof value === 'object' && objectList.indexOf(value) === -1) {
                objectList.push(value);
                for (var i in value) {
                    stack.push(value[i]);
                }
            }
        }
        return bytes;
    }
    hasKeyPath(obj, keypathArray) {
        let ans = true;
        if (!obj) {
            return false;
        }
        let placeholder = obj;
        for (let i = 0; i < keypathArray.length; i++) {
            const key = keypathArray[i];
            if (!placeholder.hasOwnProperty(key)) {
                ans = false;
                break;
            }
            placeholder = placeholder[key];
        }
        return ans;
    }
    createKeyPathInObject(obj, keypathArray) {
        const result = (obj) ? obj : {};
        let placeholder = result;
        for (let i = 0; i < keypathArray.length; i++) {
            const key = keypathArray[i];
            if (!placeholder[key]) {
                placeholder[key] = {};
            }
            placeholder = placeholder[key];
        }
        return result;
    }
    getKeyOfValue(obj, value) {
        let key = ``;
        for (const k in obj) {
            if (obj[k] == value) {
                key = k;
                break;
            }
        }
        return key;
    }
    createKeySet(objects) {
        let result = {};
        for (let i = 0; i < objects.length; i++) {
            const obj = objects[i];
            for (const key in obj) {
                if (!result.hasOwnProperty(key)) {
                    result[key] = obj[key];
                }
                else {
                    result = null;
                    console.log(`key ${key} already exists!`);
                    break;
                }
            }
        }
        return result;
    }
    getKeysMatchingValue(obj, testFunc = (val) => false, curPath = '', keyFilter = (key) => true) {
        const listOfPaths = [];
        const keys = Object.keys(obj);
        keys.forEach((key) => {
            if (keyFilter(key) && testFunc(obj[key])) {
                listOfPaths.push(`${curPath}${key}`);
            }
            else if (typeof obj[key] === 'object') {
                const deeper = this.getKeysMatchingValue(obj[key], testFunc, `${curPath}${key}/`, keyFilter);
                if (deeper.length > 0) {
                    listOfPaths.push(...deeper);
                }
            }
        });
        if (curPath.length == 0) {
            return listOfPaths.sort();
        }
        else {
            return listOfPaths;
        }
    }
    sortObjectKeys(obj) {
        const sortedObj = {};
        Object.keys(obj).sort().forEach(key => {
            if (typeof obj[key] === "object") {
                obj[key] = this.sortObjectKeys(obj[key]);
            }
            sortedObj[key] = obj[key];
        });
        return sortedObj;
    }
    tryAlignSortArrayOfObjects(array1, array2, keyLinks = {}) {
        const keyLinksKeys = Object.keys(keyLinks);
        const matches = [];
        const sortInlineWith1 = [];
        const notMatched = [];
        const array2Set = [];
        array2.forEach((item, i) => {
            if (array2Set.indexOf(item) == -1) {
                array2Set.push(item);
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
                    if (a2[key2] == a1[key1]) {
                        match = true;
                        trueJ = j;
                        break;
                    }
                }
                if (match) {
                    break;
                }
            }
            if (match) {
                console.log('match' + trueJ);
                sortInlineWith1[trueJ] = a2;
            }
            else {
                notMatched.push(a2);
            }
            matches[i] = match;
        }
        const trues = matches.filter((val) => val).length;
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
    getClosestMatch(arr = []) {
    }
    getDifferenceIfFieldChanged() {
    }
    getAllUniqueKeysInCollection() {
    }
    log(json, color = "normal") {
        let str = json;
        if (typeof json == "object") {
            str = JSON.stringify(json, null, "\t");
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
    getRandomSortArray(array, limit = 0) {
        const randArray = [...array];
        const length = randArray.length;
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * length);
            [randArray[i], randArray[randomIndex]] = [randArray[randomIndex], randArray[i]];
        }
        if (limit > 0) {
            return randArray.slice(0, limit);
        }
        else {
            return randArray;
        }
    }
}
const JSONUtil = new JSONUtilClass();
exports.default = JSONUtil;
