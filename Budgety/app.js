var budgetController = (function() {

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0 ) {
			this.percentage = Math.floor((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var data = {
		allItems : {
			inc: [],
			exp: []
		},
		totals: {
			inc: 0,
			exp: 0
		},
		budgetLabel: 0,
		percentage: -1
	};

	var calculateTotal = function(type) {
		var sum;
		sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		data.totals[type] = sum;
	};

	return {
		addItem: function(type, description, value) {
			var newItem, ID;
			
			data.allItems[type].length > 0 ? ID = data.allItems[type][data.allItems[type].length - 1].id + 1 : ID = 0;

			type === "inc" ? newItem = new Income(ID, description, value): newItem = new Expense(ID, description, value);

			data.allItems[type].push(newItem);

			return newItem;
		},
		deleteItem: function(type, id) {
			var ids, index;
			ids = data.allItems[type].map(function(current) {
				return current.id;
			});
			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},
		calculateBudget: function() {

			calculateTotal("exp");
			calculateTotal("inc");

			data.budget = data.totals.inc - data.totals.exp;

			if (data.totals.inc > 0 ) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},
		calculatePercentages: function() {
			data.allItems.exp.forEach(function(current) {
				current.calcPercentage(data.totals.inc);
			})
		},
		getPercentages: function() {
			var allPerc;
			allPerc = data.allItems.exp.map(function(current) {
				return current.getPercentage();
			});
			return allPerc;
		},
		getBudget: function() {
			return {
				budget: data.budget,
				percentage: data.percentage,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp
			}
		},
		testingMethod: function() {
			console.log(data);
		}
	}
})();


var UIController = (function() {
	var DOMStrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputBtn: ".add__btn",
		incomeContainer: ".income__list",
		expensesContainer: ".expenses__list",
		budgetLabel: ".budget__value",
		incomeLabel: ".budget__income--value",
		expenseLabel: ".budget__expenses--value",
		percentageLabel: ".budget__expenses--percentage",
		container: ".container",
		expensesPercLabel: ".item__percentage",
		dateLabel: ".budget__title--month"
	};

	var formatNumber = function(number, type) {
		var numSplit, int, decimal, sign;

		number = Math.abs(number);
		number = number.toFixed(2);
		numSplit = number.split(".");
		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, int.length);
		}
		decimal = numSplit[1];

		return (type === "exp" ? sign = "-" : sign = "+") + int + "." + decimal;
	};

	var nodeListForEach = function(nodeList, callback) {
		for (var i = 0; i < nodeList.length; i++) {
			callback(nodeList[i], i);
		}
	};

	return {
		getInput: function() {
			return {
				type: document.querySelector(DOMStrings.inputType).value,// will be either inc or exp
				inputDescription: document.querySelector(DOMStrings.inputDescription).value,
				inputValue: parseFloat(document.querySelector(DOMStrings.inputValue).value)
			};
		},
		addListItem: function(obj, type) {
			var html, newHtml, element;

			if (type === "inc") {
				element = DOMStrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%d%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
			} else if (type === "exp") {
				element = DOMStrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%d%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
			}

			newHtml = html.replace("%d%", obj.id);
			newHtml = newHtml.replace("%description%", obj.description);
			newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

			document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
		},
		removeListItem: function(selectorID) {
			var html, newHtml, element;
			element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},
		clearFields: function() {
			var fields, fieldsArray;
			fields = document.querySelectorAll(DOMStrings.inputDescription + ", " +  DOMStrings.inputValue);

			fieldsArray = Array.prototype.slice.call(fields);
			fieldsArray.forEach(function(current, index, array) {
				current.value = "";
			});
			fieldsArray[0].focus();
		},
		getDOMStrings : function() {
			return DOMStrings;
		},
		updateBudgetUI: function(budgetObj) {
			var type;
			budgetObj.budget > 0 ? type = "inc" : type = "else";
			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(budgetObj.budget, type);
			document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(budgetObj.totalExp, "exp");
			document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(budgetObj.totalInc, "inc");
			console.log("budget Obj: ", budgetObj);
			if (budgetObj.percentage > 0 ){
				document.querySelector(DOMStrings.percentageLabel).textContent = budgetObj.percentage + "%";
			} else {
				document.querySelector(DOMStrings.percentageLabel).textContent = "---"
			}
		},
		displayPercentages: function(percentagesArray) {
			var fields;
			fields = document.querySelectorAll(DOMStrings.expensesPercLabel);


			nodeListForEach(fields, function(current, index) {
				if (percentagesArray[index] > 0 ) {
					current.textContent = percentagesArray[index] + "%";
				} else {
					current.textContent = "---";
				}
			})
		},
		displayMonth: function() {
			var now, year, month, months, day;
			now = new Date();
			year = now.getFullYear();
			months = ["January", "February", "March", "April", "June", "July",
				"August", "September", "October", "November", "December"];
			month = now.getMonth();
			document.querySelector(DOMStrings.dateLabel).textContent = months[month - 1] + ", " +  year;
		},
		changedType: function() {
			var fields;
			fields = document.querySelectorAll(DOMStrings.inputType + "," +
				DOMStrings.inputDescription + "," + DOMStrings.inputValue);
			nodeListForEach(fields, function(current) {
				current.classList.toggle("red-focus");
			});
			document.querySelector(DOMStrings.inputBtn).classList.toggle("red");
		}
	}
})();



var controller = (function(budgetCtrl, UICtrl ) {
	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMStrings();
		document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);
		document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem);

		document.addEventListener("keypress", function(event) {
			if (event.keyCode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});
		document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType);
	};
	var calculateBudget = function() {
		var budget, DOM;
		DOM = UICtrl.getDOMStrings();

		budgetCtrl.calculateBudget();

		budget = budgetCtrl.getBudget();

		UICtrl.updateBudgetUI(budget);

	};

	var updatePercentages =  function() {
		var percentages;

		budgetCtrl.calculatePercentages();

		percentages = budgetCtrl.getPercentages();

		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function() {
		var input, newItem;

		input = UICtrl.getInput();
		if (input.inputDescription !== "" && !isNaN(input.inputValue) && input.inputValue > 0) {

			newItem = budgetCtrl.addItem(input.type, input.inputDescription, input.inputValue);

			UICtrl.addListItem(newItem, input.type);

			UICtrl.clearFields();

			calculateBudget();

			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;
		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
		console.log(itemID);
		if (itemID) {
			splitID = itemID.split("-");
			type = splitID[0];
			ID = Math.floor(splitID[1]);

			budgetCtrl.deleteItem(type, ID);

			UICtrl.removeListItem(itemID);

			calculateBudget();
			updatePercentages();
		}
	};

	return {
		init : function() {
			console.log("Application has started!");
			UICtrl.updateBudgetUI({budget: 0, percentage: 0,
				totalInc: 0, totalExp: 0});
			setupEventListeners();
			UICtrl.displayMonth();
		}
	}

})(budgetController, UIController);

controller.init();