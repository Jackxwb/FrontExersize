"use strict";
import utilMethods = require('../../utils/string-utils')
// import ROMAN_ARABIC_MAP = require('../../const/roman-numeral-arabic') // get map roman numerals to arabric
// const ROMAN_NUM_ENUM = Object.keys(ROMAN_ARABIC_MAP) //get all roman notation ['I', 'V', 'X', 'L', 'C', 'D', 'M']
import Good from '../../class/js/Good'
import GoodItem = require('../../class/js/GoodItem')
import NotationNumber = require('../../class/js/NotationNumber')
import Price = require('../../class/js/Price')



let { formatStrBlank, splitByRegExp, splitByIs, formatConent, isQuestion } = utilMethods

export default class Parser {
  // content: string //解析的字符串
  lines: string[]
  statements: string[]
  questions: string[]
  galacticNotationRomanMap: object //{glob : L, pish: X}
  allUnits: string[] //记录合法的单位
  goodsInStock: GoodItem[] //模拟货架
  regExpMachines: any[]
  constructor (content){
    // this.content = content
    this.lines = formatConent(content)
    this.statements = this.lines
    //this.lines format todo 引入帮助方法
  }
  parse () {
    this._prepareData()
    this._handleLines()
  }
  _handleLines () {
    this.lines.forEach(line=>{
      let index = this.regExpMachines.findIndex(item=>item.regExp.test(line)) 
      if(index === -1) {
        console.log('I have no idea what you are talking about')
      }else{
        this.regExpMachines[index].type!=='statement' && this.regExpMachines[index].handleMethod(line)
      }
    })
  }
  _prepareData () {
    this._getGalacticNotationRomanMap()
    this._getGoodsInfo()
    this._addDefaultRegExpHandles()
  }
  _getGalacticNotationRomanMap () {
    let galacticNotationRomanMap = {}
    this.lines.filter(item=>!isQuestion(item)).forEach(item => {
      let line = item.trim();
      // first glob is L
      let regExp = new RegExp(/^\s*[a-zA-Z_-]+\s+is\s+[IVXLCDM]\s*$/)
      this.regExpMachines.push({regExp: regExp, type: 'statement'})
      if (regExp.test(line)) {
        let notation = splitByIs(line)[0]; // get notation represent roman numeral
        galacticNotationRomanMap[notation] = splitByIs(line)[1];
      }
    })
    this.galacticNotationRomanMap = galacticNotationRomanMap
  }
  _getGoodsInfo () {
    let allUnits = [],
      goodsInStock= []
    this.lines.filter(item=>!isQuestion(item)).forEach(item => {
      let line = item.trim();
      let regStr = `\^\\s*`;
      regStr += `((${Object.keys(this.galacticNotationRomanMap).join('|')})\\s+)+`; // glob glob glob
      regStr += `[a-zA-Z-_]+\\s+`; // silver
      regStr += `is\\s+`; // is 
      regStr += `[1-9]\\d*\\s+`; // 999 
      regStr += `[a-zA-Z-_]+\\s*`; // Credits
      regStr += `\$`;
      this.regExpMachines.push({ regExp: new RegExp(regStr), type: 'statement' })
      if (new RegExp(regStr).test(line)) {
        let arrItem = splitByIs(line)
        // glob glob Silver
        let numberNotationsAndGoodName = splitByRegExp(arrItem[0], /\s+/) // [glob glob Silver]
        let goodName = numberNotationsAndGoodName.pop(),
          notationNumber = new NotationNumber(numberNotationsAndGoodName, this.galacticNotationRomanMap)
        if (!notationNumber.isValidNotationNumber()) return //不是合法的数字
        let totalPriceAndCurrency = splitByRegExp(arrItem[1], /\s+/)
        let totalPrice = totalPriceAndCurrency[0], currencyUnit = totalPriceAndCurrency[1]
        if(!allUnits.includes(currencyUnit)) allUnits.push(currencyUnit)
        let good = new Good(goodName)
        good.setPrice(totalPrice, notationNumber, currencyUnit)
        goodsInStock.push(good)
      }
    })
    this.allUnits = allUnits
    this.goodsInStock = goodsInStock
  }
  _addDefaultRegExpHandles () {
    let regExpMachines = {
      regExpOfNotationToArabic: /^\s*how\s+much\s+is\s+([a-zA-Z_-]+\s*)+\?\s*$/,
      regExpOfGetTotalPrice: /^\s*how\s+many\s+([a-zA-Z-_]+\s+)is\s+([a-zA-Z_-]+\s*)+\?\s*$/
    }
    for(let key in regExpMachines) {
      this.regExpMachines.push({
        regExp: key,
        type: 'question',
        handleMethod: this[`_${key}Handle`]
      })
    }
  }
  _regExpOfNotationToArabicHandle (line) {
    let notationStr = splitByIs(line)[1] // glob abc ?
    let notationArr = notationStr.split(/\s*\?\s*/)[0].trim().split(/\s+/)
    let notationNumber = new NotationNumber(notationArr, this.galacticNotationRomanMap)
    if (notationNumber.isValidNotationNumber()) {
      console.log(notationArr.join(' ') + ' is ' + notationNumber.getArabicNumber())
    }
    else {
      console.log('I have no idea what you are talking about')
    }
  }
  _regExpOfGetTotalPriceHandle(line) {
    let strArr = splitByIs(line);
    let currencyUnit = strArr[0].replace('how many', '').trim(),
      notationsAndGoodName = splitByRegExp(strArr[1].replace('?', '').trim(), /\s+/),
      goodName = notationsAndGoodName.pop(),
      notaionArr = notationsAndGoodName,
      notationNumber = new NotationNumber(notaionArr, this.galacticNotationRomanMap)
    let goodAvailible = this.goodsInStock.find(item=>item.getName() === goodName)
    let priceNum = goodAvailible ? goodAvailible.getPrice().getNum(): 0,
      good = new Good(goodName, new Price(currencyUnit, priceNum)),
      goodItem = new GoodItem(good, notationNumber)
    if (goodItem.isValidGoodItem(this.allUnits, this.goodsInStock)) {
      console.log(notaionArr.join(' ') + ' '+ goodName + ' is ' + goodItem.getTotalPrice() + ' ' + currencyUnit)
    }else {
      console.log('I have no idea what you are talking about')        
    } 
  }
}