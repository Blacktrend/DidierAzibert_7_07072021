
import {port} from "./port.js";

/**
 * Add events listeners on forms inputs
 */
function formsEventsListeners() {
    const signupInputs = document.forms["signup"].elements; // array of inputs in form named "signup"
    for (let signupInput of signupInputs) {
        signupInput.addEventListener("input", inputsValidation);
        signupInput.addEventListener("invalid", showInputError);
    }
    const loginInputs = document.forms["login"].elements;
    for (let loginInput of loginInputs) {
        loginInput.addEventListener("input", inputsValidation);
        loginInput.addEventListener("invalid", showInputError);
    }
}


/**
 * Check validity of inputs (to use with custom error messages)
 * @param event
 */
function inputsValidation(event) {
    event.target.setCustomValidity(""); // error message reset otherwise input is not validated
    event.target.checkValidity(); // true or false
}


/**
 * Display custom error messages if inputs are not valid
 * @param event
 */
function showInputError(event) {
    const input = event.target;
    if (input.validity.valueMissing) {
        input.setCustomValidity("Obligatoire");
    }
    else if (input.validity.tooLong) {
        input.setCustomValidity(`Ne doit pas dépasser ${input.maxLength} caractères`)
    }
    else if (input.validity.tooShort) {
        input.setCustomValidity(`Au minimum ${input.minLength} caractères`)
    }
    else if (input.validity.patternMismatch) {
        input.setCustomValidity(`Veuillez vérifier les critères de saisie`)
    }
    else {
        input.setCustomValidity("Veuillez vérifier votre saisie");
    }
}

/**
 * signup
 * @param event
 * @returns {Promise<any>} user creation confirmation
 * trim() to remove leading and trailing whitespaces
 */
async function signup(event) {
    event.preventDefault();
    const form = document.forms["signup"];
    const user = {
        firstName: form.elements.firstName.value,
        lastName: form.elements.lastName.value,
        email: form.elements.email.value,
        password: form.elements.password.value,
        job: form.elements.job.value
    };
    const userJson = JSON.stringify(user);

    try {
        const response = await fetch(`http://localhost:${port}/api/auth/signup`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: userJson
        });

        if (response.ok) {
            const email = user.email;
            const password = user.password;
            await firstLogin(email, password);
            return response.json(); // user created
        }
        else alert("Erreur HTTP " + response.status);
    }
    catch (err) {
        alert(err);
    }
}

/**
 * Prepare body JSON for login request after signup and then redirect
 * @param email
 * @param password
 * @returns {Promise<void>}
 */
async function firstLogin(email, password) {
    const userJson = JSON.stringify({email: email, password: password});
    const loginRes = await loginReq(userJson);
    if (loginRes) loginRedirect(loginRes);
}

/**
 * Prepare body JSON for login request after login form submit
 * and then redirect
 * @param event
 * @returns {Promise<void>}
 */
async function login(event) {
    event.preventDefault();
    const form = document.forms["login"];
    const user = {
        email: form.elements.loginEmail.value.trim(),
        password: form.elements.loginPassword.value.trim()
    };
    const userJson = JSON.stringify(user);

    const loginRes = await loginReq(userJson);
    if (loginRes) loginRedirect(loginRes);
}

/**
 * Login request after signup or after login form submit
 * @param userJson
 * @returns {Promise<Promise<any>|void>}
 */
async function loginReq(userJson) {
    try {
        const response = await fetch(`http://localhost:${port}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: userJson
        });

        // .json() = response interface method = json ---> to object
        return response.ok ? response.json() : alert("Erreur HTTP " + response.status); // if ok return object from json
    }
    catch (err) {
        alert(err);
    }
}

/**
 * Store userId, token (login response) and redirect to posts page
 * @param loginRes
 * @type {{userId: number, token: string }}
 */
function loginRedirect(loginRes) {
    sessionStorage.setItem("token", loginRes.token);
    sessionStorage.setItem("userId", loginRes.userId);
    document.location.href = "posts.html";
}


/**
 * Main function
 * redirects if user already connected
 * adds event listeners on forms inputs and submits
 */
function main() {
    // redirect to posts if user already connected
    if (sessionStorage.getItem("token")) document.location.href = "posts.html";
    formsEventsListeners();
    document.getElementById("signup").addEventListener("submit", signup); // signup = form id
    document.getElementById("login").addEventListener("submit", login); // login = form id
}

main();
