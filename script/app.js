let graph, canvas ;
var exchangeRates, btnConvert, selectBase, selectConvert, btnSwap, swapSVG, resultBlock;
var currentConversionRate;
var test;
var USD, EUR, GBP, JPY, CAD;

const APIKEY = "bba635e74234b9000767e161";

const getAPIExchangerates = (baseCode, convertCode) => {
	fetch(`https://v6.exchangerate-api.com/v6/${APIKEY}/latest/${baseCode}`) 
		  .then(function(response) { 
			//antwoord van de server nakijken op het verzoek 
			if (!response.ok) { 
			  //antwoord is niet ok. error wordt geworpen 
			  throw Error(`Probleem bij de fetch(). Status Code: ${response.status}`); 
			} else { 
			  //antwoord is ok 
			  console.info('Er is een response teruggekomen van de server'); 
			  return response.json(); 
			} 
		  }) 
		  .then(function(jsonObject) { 
			//functie uitgevoerd en json maken 
			console.info('json object is aangemaakt');
			//functie showResult uitvoeren  
			showResult(jsonObject["conversion_rates"], baseCode, convertCode);
		  }) 
		  //als uitvoeren op een fout loopt 
		  .catch(function(error) { 
			console.error(`fout bij verwerken json ${error}`); 
		  }); 
}

const getJSONExchangeRates = (baseCode, convertCode) => {
	//ophalen interne JSON file 
	fetch('./data/exchangeRates.json') 
		  .then(function(response) { 
			//antwoord van de server nakijken op het verzoek 
			if (!response.ok) { 
			  //antwoord is niet ok. error wordt geworpen 
			  throw Error(`Probleem bij de fetch(). Status Code: ${response.status}`); 
			} else { 
			  //antwoord is ok 
			  console.info('Er is een response teruggekomen van de server'); 
			  return response.json(); 
			} 
		  }) 
		  .then(function(jsonObject) { 
			//functie uitgevoerd en json maken 
			console.info('json object is aangemaakt'); 
			//functie getdata uitvoeren 
			getData(jsonObject, baseCode, convertCode)
		  }) 
		  //als uitvoeren op een fout loopt 
		  .catch(function(error) { 
			console.error(`fout bij verwerken json ${error}`); 
		  }); 
	
}

const drawChart = (labels,data) => {
	// console.log('draw chart');
	let ctx = graph.getContext('2d');
	var myChart = new Chart(ctx, {
		type: 'bar',
		data: {
			labels: labels,
			datasets: [{
				label: 'Conversion Rate',
				data: data,
				backgroundColor: '#048321',
				borderColor: '#024D13',
				borderWidth: 1
			}]
		},
		options: {
			scales: {
				yAxes: [{
					display: true,
				}]
			}
		}
	});
};

const getData = (json, baseCode, convertCode) => {
	let dates = [];
	let rates = [];
	let index = 0;
	for(var object in json){
		if (json[object]['base_code']==baseCode) {
			if (json[object]['exchange_code']==convertCode) {
				index = object;
				break;
			} 
		}
	}
	exchangeRates = json[index]['rates'];
	for (var key in exchangeRates) {
		if (exchangeRates.hasOwnProperty(key)) {
			dates.push(key);
			rates.push(exchangeRates[key]);
		}
	}
	document.querySelector('.js-graphBaseCode').innerHTML = baseCode;
	document.querySelector('.js-graphConvertCode').innerHTML = convertCode;
	drawChart(dates,rates);
};


const init = () => {
	graph = document.querySelector('.js-graph');
	getJSONExchangeRates("USD","EUR");
	canvas = document.querySelector('.js-graph');
	
};

const swapCurrency = (e) => {
	// console.log('swap clicked');
	const baseCurrency = selectBase.value;
	const otherCurrency = selectConvert.value;
	selectBase.value = otherCurrency;
	selectConvert.value = baseCurrency;
	swapSVG.classList.toggle("down");
	resultBlock.classList.add("is-hidden");
	selectChange()
}

const showResult = (json, baseCode, convertCode) => {
	var amount = document.getElementById('amount').value;
	if (!amount) {
		amount = document.getElementById('amount').placeholder;
	}
	currentConversionRate = json[convertCode]
	const amountEntered = document.querySelector('.js-amount-entered');
	const amountResult = document.querySelector('.js-amount-result');
	// console.log('currentConversionRate: ' + currentConversionRate);
	const result = amount * currentConversionRate;
	// console.log(result);
	amountEntered.innerHTML = `${parseFloat(amount).toFixed(2)} ${baseCode} =`;
	amountResult.innerHTML = `${parseFloat(result).toFixed(8)} ${convertCode}`;
	resultBlock.classList.remove("is-hidden");
	USD.innerHTML = json["USD"]
	EUR.innerHTML = json["EUR"]
	GBP.innerHTML = json["GBP"]
	JPY.innerHTML = json["JPY"]
	CAD.innerHTML = json["CAD"]
}

const convert = (e) => {
	// console.log('convert clicked');
	const baseCurrency = selectBase.value;
	const otherCurrency = selectConvert.value;
	getAPIExchangerates(baseCurrency,otherCurrency)
}

const selectChange = (e) => {
	// console.log('value changed');
	resultBlock.classList.add("is-hidden");
	const baseCurrency = selectBase.value;
	const otherCurrency = selectConvert.value;
	for (const option of selectConvert) {
		if (option.value == baseCurrency) {
			option.setAttribute('disabled','disabled');
		}
		else{
			option.removeAttribute('disabled');
		}
	}
	for (const option of selectBase) {
		if (option.value == otherCurrency) {
			option.setAttribute('disabled','disabled');
		}
		else{
			option.removeAttribute('disabled');
		}
	}
	graph = document.querySelector('.js-graph');
	getJSONExchangeRates(baseCurrency,otherCurrency);
}

document.addEventListener('DOMContentLoaded', function () {
	selectBase = document.getElementById('baseCurrency');
	selectConvert = document.getElementById('otherCurrency');
	btnConvert = document.getElementById('btn-convert');
	btnSwap = document.querySelector('.js-swap');
	swapSVG = document.querySelector('.js-swap-svg');
	resultBlock = document.querySelector('.js-result');
	USD = document.querySelector('.js-usd');
	EUR = document.querySelector('.js-eur');
	GBP = document.querySelector('.js-gbp');
	JPY = document.querySelector('.js-jpy');
	CAD = document.querySelector('.js-cad');
	init();
	btnConvert.addEventListener('click', convert);
	btnSwap.addEventListener('click', swapCurrency);
	selectBase.addEventListener('change', selectChange)
	selectConvert.addEventListener('change', selectChange)
});

