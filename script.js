/* =====================================
   CALCULATOR STATE
===================================== */

const resultDisplay = document.getElementById("result");
const expressionDisplay = document.getElementById("expression");

const themeBtn = document.getElementById("themeBtn");
const copyBtn = document.getElementById("copyBtn");

const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistory");

const toast = document.getElementById("toast");

let currentInput = "0";
let previousInput = "";
let operator = null;

let waitingForNewInput = false;

let calculationHistory = [];


/* =====================================
   DISPLAY
===================================== */

function updateDisplay() {

    resultDisplay.textContent = currentInput;

    if (operator && previousInput !== "") {

        expressionDisplay.textContent =
            `${formatNumber(previousInput)} ${getOperatorSymbol(operator)}`;

    } else {

        expressionDisplay.textContent = "Ready";
    }
}


/* =====================================
   NUMBER FORMAT
===================================== */

function formatNumber(value) {

    if (value === "Error") {
        return value;
    }

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return value;
    }

    return number.toLocaleString("en-US", {
        maximumFractionDigits: 10
    });
}


/* =====================================
   OPERATOR SYMBOL
===================================== */

function getOperatorSymbol(operator) {

    const symbols = {
        "+": "+",
        "-": "−",
        "*": "×",
        "/": "÷",
        "%": "%"
    };

    return symbols[operator];
}


/* =====================================
   ADD NUMBER
===================================== */

function appendNumber(number) {

    if (currentInput === "Error") {
        clearCalculator();
    }

    if (waitingForNewInput) {

        currentInput = "";

        waitingForNewInput = false;
    }


    if (number === "." &&
        currentInput.includes(".")) {

        return;
    }


    if (currentInput === "0" &&
        number !== ".") {

        currentInput = number;

    } else {

        currentInput += number;
    }


    updateDisplay();
}


/* =====================================
   CHOOSE OPERATOR
===================================== */

function chooseOperator(selectedOperator) {

    if (currentInput === "Error") {
        return;
    }


    if (operator !== null &&
        !waitingForNewInput) {

        calculate();
    }


    previousInput = currentInput;

    operator = selectedOperator;

    waitingForNewInput = true;

    updateDisplay();
}


/* =====================================
   CALCULATE
===================================== */

function calculate() {

    if (operator === null ||
        previousInput === "") {

        return;
    }


    const firstNumber =
        parseFloat(previousInput);

    const secondNumber =
        parseFloat(currentInput);


    if (
        Number.isNaN(firstNumber) ||
        Number.isNaN(secondNumber)
    ) {

        currentInput = "Error";

        resetState();

        updateDisplay();

        return;
    }


    let calculationResult;


    switch (operator) {

        case "+":

            calculationResult =
                firstNumber + secondNumber;

            break;


        case "-":

            calculationResult =
                firstNumber - secondNumber;

            break;


        case "*":

            calculationResult =
                firstNumber * secondNumber;

            break;


        case "/":

            if (secondNumber === 0) {

                currentInput = "Error";

                resetState();

                updateDisplay();

                return;
            }

            calculationResult =
                firstNumber / secondNumber;

            break;


        case "%":

            calculationResult =
                firstNumber % secondNumber;

            break;


        default:

            return;
    }


    calculationResult =
        Number(calculationResult.toFixed(10));


    const expression =
        `${formatNumber(firstNumber)}
        ${getOperatorSymbol(operator)}
        ${formatNumber(secondNumber)}`;


    currentInput =
        calculationResult.toString();


    addToHistory(
        expression,
        formatNumber(currentInput)
    );


    previousInput = "";

    operator = null;

    waitingForNewInput = true;


    expressionDisplay.textContent =
        expression;


    resultDisplay.textContent =
        formatNumber(currentInput);
}


/* =====================================
   RESET STATE
===================================== */

function resetState() {

    previousInput = "";

    operator = null;

    waitingForNewInput = true;
}


/* =====================================
   CLEAR
===================================== */

function clearCalculator() {

    currentInput = "0";

    previousInput = "";

    operator = null;

    waitingForNewInput = false;

    updateDisplay();
}


/* =====================================
   DELETE
===================================== */

function deleteNumber() {

    if (
        currentInput === "Error" ||
        waitingForNewInput
    ) {

        currentInput = "0";

        waitingForNewInput = false;

        updateDisplay();

        return;
    }


    if (currentInput.length <= 1) {

        currentInput = "0";

    } else {

        currentInput =
            currentInput.slice(0, -1);
    }


    updateDisplay();
}


/* =====================================
   HISTORY
===================================== */

function addToHistory(expression, result) {

    calculationHistory.unshift({
        expression,
        result
    });


    if (calculationHistory.length > 15) {

        calculationHistory.pop();
    }


    renderHistory();
}


/* =====================================
   RENDER HISTORY
===================================== */

function renderHistory() {

    if (calculationHistory.length === 0) {

        historyList.innerHTML = `
            <div class="empty-history">
                <div>🧮</div>
                <p>No calculations yet</p>
                <span>Your results will appear here</span>
            </div>
        `;

        return;
    }


    historyList.innerHTML = "";


    calculationHistory.forEach(item => {

        const historyItem =
            document.createElement("div");

        historyItem.className =
            "history-item";


        historyItem.innerHTML = `
            <div class="history-expression">
                ${item.expression}
            </div>

            <div class="history-result">
                = ${item.result}
            </div>
        `;


        historyList.appendChild(historyItem);
    });
}


/* =====================================
   CLEAR HISTORY
===================================== */

clearHistoryBtn.addEventListener(
    "click",
    () => {

        calculationHistory = [];

        renderHistory();
    }
);


/* =====================================
   BUTTON EVENTS
===================================== */

document
    .querySelectorAll("[data-number]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                appendNumber(
                    button.dataset.number
                );
            }
        );
    });


document
    .querySelectorAll("[data-operator]")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                chooseOperator(
                    button.dataset.operator
                );
            }
        );
    });


document
    .querySelector("[data-action='calculate']")
    .addEventListener(
        "click",
        calculate
    );


document
    .querySelector("[data-action='clear']")
    .addEventListener(
        "click",
        clearCalculator
    );


document
    .querySelector("[data-action='delete']")
    .addEventListener(
        "click",
        deleteNumber
    );


/* =====================================
   KEYBOARD SUPPORT
===================================== */

document.addEventListener(
    "keydown",
    event => {

        const key = event.key;


        if (/^[0-9.]$/.test(key)) {

            appendNumber(key);
        }


        if (
            ["+", "-", "*", "/", "%"]
                .includes(key)
        ) {

            chooseOperator(key);
        }


        if (
            key === "Enter" ||
            key === "="
        ) {

            event.preventDefault();

            calculate();
        }


        if (key === "Backspace") {

            deleteNumber();
        }


        if (
            key === "Escape" ||
            key.toLowerCase() === "c"
        ) {

            clearCalculator();
        }
    }
);


/* =====================================
   COPY RESULT
===================================== */

copyBtn.addEventListener(
    "click",
    async () => {

        if (currentInput === "Error") {
            return;
        }


        try {

            await navigator.clipboard.writeText(
                currentInput
            );

            showToast("Result copied!");

        } catch {

            showToast("Unable to copy");
        }
    }
);


/* =====================================
   TOAST
===================================== */

function showToast(message) {

    toast.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 1800);
}


/* =====================================
   THEME TOGGLE
===================================== */

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle("light");


        const isLight =
            document.body.classList.contains("light");


        themeBtn.textContent =
            isLight ? "☾" : "☀";
    }
);


/* =====================================
   INITIALIZE
===================================== */

updateDisplay();
renderHistory();