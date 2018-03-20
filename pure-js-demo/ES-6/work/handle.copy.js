var path = require('path')
var fs = require('fs')
const ROMAN_ARABIC_MAP = require('./const') // get map roman numerals to arabric 
const ROMAN_NUM_ENUM = Object.keys(ROMAN_ARABIC_MAP) //get all roman notation ['I', 'V', 'X', 'L', 'C', 'D', 'M']
var convertRomanNumToArabicNum = require('./utils/convert-roman-to-arabic')
var validateRomanNum  = require( './utils/validate-roman-num' )





var filePath = path.join(__dirname, 'test-input.txt')

function readFile(filePath, callback){
  fs.readFile(filePath, 'utf8', (err, content)=>{
    if(err) return console.error('读取文件出错')
    callback(content)
  })
}


readFile(filePath, (content)=>{
  // Contenxt.parse(content)
  var parser = new Parser(content);
  parser.prepareData()
  parser.analysize()
})

function formatLines (content) {
  return content.split(/\n/).filter(item=>{
    return !(item.replace(/\s/, '').length=== 0 || item.trim().charAt(0)=== '#')
  })
}

function Line (line) {
  this.text = line
  this.isValid = false
}


function Parser (content) {
    
    this.lines = formatLines(content)
    this.galacticNotationsToRoman = {} //{glob: I}
    this.allGalaticNotations = []//[glob, pish]
    this.goodsPrice = {} //{silver: 100}
    this.allGoods = [] //[silver]

    this.prepareData = ()=> {
      this.galacticNotationsToRoman = this._getGalacticNotationsToRoman() //{glob: I}
      this.allGalaticNotations = this._getAllGalacticNotations() //[glob, pish]
      this.goodsPrice = this._getGoodsPrice() //{silver: 100}
      this.allGoods = this._getAllGoods()
    }
    this.analysize = () => {
      this.lines.forEach(item=>{
        var line = new Line(item)
        this._handleLineObj(line)
        if(!line.isValid) {
          console.log(line.text +' --------> '+ 'I have no idea what you are talking about')
        }
      })
    }
    this._handleLineObj= (line)=> {
      this._handleNotationSwitch(line)
      this._handlePriceDeclare(line)
      this._handleTotalNumber(line)
      this._handleGoodsTotalPrice(line)
    }
    this._getAllGoods = () =>{
      return Object.keys(this.goodsPrice)
    }
    this._validateIsRomanNumeralNotation = (item) => {
      let romanNumNotation = splitByIs(item)[1].trim()
      // jacu is P appears, but p is not a standard roman numeral notation
      if(!ROMAN_NUM_ENUM.includes(romanNumNotation)) {
        return console.log(`${item} --------> \'${romanNumNotation}\' is not valid roman numeral notation `)
      }
    }
    this._getGalacticNotationsToRoman = ()=> {
      let regExp = RegExp(/^\s*[a-zA-Z]+\s+is\s+[A-Za-z]\s*$/)
      let galacticNotationsToRoman = {}
      this.lines.filter(item=>regExp.test(item)).forEach(item=>{
        let intergalacticNotation = splitByIs(item)[0].trim(),
        romanNumNotation = splitByIs(item)[1].trim()
        // // jacu is P appears, but p is not a standard roman numeral notation
        if(!ROMAN_NUM_ENUM.includes(romanNumNotation)) {
          // return console.log(`${item} --------> \'${romanNumNotation}\' is not valid roman numeral notation `)
          return 
        }
        galacticNotationsToRoman[intergalacticNotation] = romanNumNotation
      })
      return galacticNotationsToRoman
      // this.allGalaticNotations = Object.keys(galacticNotationsToRoman)
    }
    this._getAllGalacticNotations= ()=> {
      return Object.keys(this.galacticNotationsToRoman)
    }
    this._validateIsRomanNumeralNotation2 = (item)=> {
      let sArr = splitByIs(item) 
      let numberAndGoods = splitByRegExp(sArr[0].trim(), /\s+/)
      let good = numberAndGoods.pop(), //IRON
        romansArr = numberAndGoods.slice(0, numberAndGoods.length), //['pish pish']
        romanNumber = getRomanNum(romansArr, this.galacticNotationsToRoman) //convert ['glob', 'glob'] to II
      if(!validateRomanNum(romanNumber)) {
        return console.log(`${item} --------> ${romanNumber} which is result of converting ${romansArr.join(' ')} is not a valid roman numeral `)
      }
    }
    this._getGoodsPrice = ()=> {
      let regStr = `\^\\s*`  
      regStr += `((${this.allGalaticNotations.join('|')})\\s+)+` // intergalactic numer symbol
      regStr += `[a-zA-Z-_]+\\s+` // match good name
      regStr += `is\\s+`  // is 
      regStr += `[1-9]\\d*\\s+` // total 
      regStr += `Credits\\s*` // currency
      regStr += `\$`
  
      let goodsPrice = {}
      this.lines.filter(item=>new RegExp(regStr).test(item)).forEach(item=>{
        let sArr = splitByIs(item) 
        let numberAndGoods = splitByRegExp(sArr[0].trim(), /\s+/)
        let good = numberAndGoods.pop(), //IRON
          romansArr = numberAndGoods.slice(0, numberAndGoods.length), //['pish pish']
          romanNumber = getRomanNum(romansArr, this.galacticNotationsToRoman) //convert ['glob', 'glob'] to II
        if(!validateRomanNum(romanNumber)) {
          return
        }
        let decimals = convertRomanNumToArabicNum(romanNumber)  // conver II to 2
        let totalCredentials = splitByRegExp(sArr[1].trim(), /\s+/)[0] // get total number
        goodsPrice[good] = totalCredentials/decimals 
      })
      return goodsPrice
    }
    this._handleNotationSwitch = (line) => {
      let item = line.text
      let regExp = RegExp(/^\s*[a-zA-Z]+\s+is\s+[A-Za-z]\s*$/)
      if(regExp.test(item)) {
        line.isValid = true
        let romanNumNotation = splitByIs(item)[1].trim()
        // // jacu is P appears, but p is not a standard roman numeral notation
        if(!ROMAN_NUM_ENUM.includes(romanNumNotation)) {
          return console.log(`${item} --------> \'${romanNumNotation}\' is not valid roman numeral notation `)
        }
      }
    }
    this._handlePriceDeclare = (line) => {
      let item = line.text
      let regStr = `\^\\s*`  
      regStr += `((${this.allGalaticNotations.join('|')})\\s+)+` // glob glob glob
      regStr += `[a-zA-Z-_]+\\s+` // silver
      regStr += `is\\s+`  // is 
      regStr += `[1-9]\\d*\\s+` // 999 
      regStr += `Credits\\s*` // Credits
      regStr += `\$`
      if(new RegExp(regStr).test(item)) {
        line.isValid = true
        let sArr = splitByIs(item) 
        let numberAndGoods = splitByRegExp(sArr[0].trim(), /\s+/)
        let romansArr = numberAndGoods.slice(0, numberAndGoods.length-1) //['pish pish']
        let  romanNumber = getRomanNum(romansArr, this.galacticNotationsToRoman) //convert ['glob', 'glob'] to II
        if(!validateRomanNum(romanNumber)) {
          return console.log(`${item} --------> ${romanNumber} which is result of converting ${romansArr.join(' ')} is not a valid roman numeral `)
        }
      }
    }
    this._handleTotalNumber = (line)=> {
      let item = line.text      
      let regThird = `\^\\s*`  
      regThird += `how\\s+much\\s+is\\s+` // how much is 
      regThird += `((${this.allGalaticNotations.join('|')})\\s+)+\\2\\s*` // pish tegj glob glob
      regThird += `\\?\\s*`  
      regThird += `\$`
      if(new RegExp(regThird).test(item)) {
        line.isValid = true
        let romansStr = splitByIs(item)[1].trim(),
        romansArr = romansStr.replace(/\?|\？/g, '').trim().split(/\s+/),
        romanNumber = getRomanNum(romansArr, this.galacticNotationsToRoman)
        if(!validateRomanNum(romanNumber)) {
          return console.log(`${item} --------> ${romanNumber} which is result of converting ${romansArr.join(' ')} is not a valid roman numeral `)
        }
        let decimals = convertRomanNumToArabicNum(romanNumber),
          result = romansStr.replace(/\?|\？/g, '').trim() + ' is ' + decimals
        console.log(formatStrBlank(result))
      }
    }
    this._handleGoodsTotalPrice = (line)=> {
      let item = line.text
      let regFouth = `\^\\s*`  
      regFouth += `how\\s+many\\s+Credits\\s+is\\s+` // how many Credits is
      regFouth += `((${this.allGalaticNotations.join('|')})\\s+)+` // pish tegj glob glob
      regFouth += `(${this.allGoods.join('|')})\\s*\\?\\s*`  // Silver?
      regFouth += `\$` 
      if(new RegExp(regFouth).test(item)) {
        line.isValid = true
        let valueArr = splitByIs(item)[1].replace(/\?/, '') // get 'glob prok Silver '
        let romanStr = valueArr.replace(new RegExp(`\\s+(${this.allGoods.join('|')})\\s*`), '') //get 'glob prok'
        let romanArr = splitByRegExp(romanStr.trim(), /\s+/) // get ['glob', 'prok']
        let romanNumber = getRomanNum(romanArr, this.galacticNotationsToRoman)
        if(!validateRomanNum(romanNumber)) {
          return console.log(`${item} --------> ${romanNumber} which is result of converting ${romanArr.join(' ')} is not a valid roman numeral `)        
        }
        let decimals = convertRomanNumToArabicNum(romanNumber) //convert 'glob prok' to 4
        let good = valueArr.match(`\\s+(${this.allGoods.join('|')})\\s*`)[1]
        let result = valueArr.replace(/\s*\?\s*/, '') + ' is ' + decimals*this.goodsPrice[good] + ' Credits '
        return console.log(formatStrBlank(result))
      }
    }
}













/**
 * split str by /\s+is\s+/
 * @param {String} str str which will be splited by /\s+is\s+/
 * @return {Array} 
 */
function splitByIs(str) {
  return splitByRegExp(str, /\s+is\s+/)
}




/**
 * extract simply method to split str 
 * @param {String} str 
 * @param {String or RegRex obj} regExp 
 * @return {Array}
 */
function splitByRegExp(str, regExp) {
  if(!toString.call(str) === '[object String]') {
    console.warn(`warn: ${str} is not string`)
    return undefined
  }
  return str.split(regExp)
}


/**
 * todo 引入到utils 里面去
 * get roman number 'IV' by array ['glob','glob']
 * @param {arry} arry ['glob','glob']
 * @param {object} obj {glob: I, prok: V}
 * @return {String} example: "IV"
 */
function getRomanNum(arr, obj) {
  let res = ''
  arr.forEach( item => res+=obj[item] )
  return res
}

function formatStrBlank(str) {
  return str.replace(/\s{2,}/, ' ')
}

