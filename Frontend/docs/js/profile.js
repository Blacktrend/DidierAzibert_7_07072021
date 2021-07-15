
import {port} from "./port.js";
import {logoutListener} from "./logout.js";

/**
 * Add events listeners on form inputs
 */
function formEventsListeners() {
    const profileInputs = document.forms["profile"].elements;
    for (let profileInput of profileInputs) {
        profileInput.addEventListener("input", inputsValidation);
        profileInput.addEventListener("invalid", showInputError);
    }
}

// ************* POSSIBLE faire un module avec inputsValidation et showInputError *************
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
 * @Typedef user
 * @property {number} userId
 * @property {string} firstName
 * @property {string} lastName
 * @property {string} job
 * @property {number} moderator
 * @property {number} canModify
 */


/**
 * Returns userId from url (when clic on user name)
 * or from sessionStorage (when clic on profile button)
 * @returns {number}
 */
function getUserId() {
    // if comes from user link (post author)
    const urlParams = new URLSearchParams(location.search);
    let userId = urlParams.get("userId");
    if (!userId) userId = sessionStorage.getItem("userId");
    return Number(userId);
}


/**
 * Get profile request
 * @param userId {number}
 * @param token {string}
 * @returns {Promise<Promise<user>|void>}
 */
async function getProfile(userId, token) {
    try {
        const response = await fetch(`http://localhost:${port}/api/auth/${userId}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
    }
    catch (err) { alert(err);}
}

/**
 * Display user identity
 * and email/password inputs + delete/modify buttons
 * if user is owner or moderator
 * (delete/modify routes are protected by auth2 in backend)
 * @param user
 */
function displayProfile(user) {

    if(user.userId === Number(sessionStorage.getItem("userId"))) {
        document.getElementsByTagName("h1")[0].innerText = "Mon Profil";
    }

    document.getElementById("firstName").setAttribute("value", user.firstName);
    document.getElementById("lastName").setAttribute("value", user.lastName);
    document.getElementById("job").setAttribute("value", user.job);

    // disable modify/delete buttons if user is not owner neither moderator
    if (user.moderator !== 1 && user.canModify !==1) {
        document.getElementById("modify-user").disabled = true;
        document.getElementById("modify-user").style.setProperty("display", "none", "important");
        document.getElementById("delete-user").disabled = true;
        document.getElementById("delete-user").style.setProperty("display", "none", "important");
    }
    //disable email and password inputs if user is not owner
    if (user.canModify !==1) {
        document.getElementById("credentials").disabled = true;
        document.getElementById("credentials").style.display = "none";
        document.getElementById("identity").classList.add("w-100");
    }
}


async function modifyUser(event, userId, token) {
    event.preventDefault();
    const form = document.forms["profile"];
    const user = {
        firstName: form.elements.firstName.value ? form.elements.firstName.value : undefined,
        lastName: form.elements.lastName.value ? form.elements.lastName.value : undefined,
        job: form.elements.job.value ? form.elements.job.value : undefined,
        email: form.elements.email.value ? form.elements.email.value : undefined,
        password: form.elements.password.value ? form.elements.password.value: undefined
    };

    const userJson = JSON.stringify(user);

    try {
        const response = await fetch(`http://localhost:${port}/api/auth/${userId}`, {
            method: "PATCH",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json;charset=utf-8" // don't forget when there is a json body !!
            },
            body: userJson
        });
        if(response.ok) {
            alert("Profil modifié !");
        }
        return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
    }
    catch (err) { alert(err);}
}


async function deleteUser(event, userId, token) {
    event.preventDefault();

    try {
        const response = await fetch(`http://localhost:${port}/api/auth/${userId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if(response.ok) {
            alert("Profil supprimé !");
            await sessionStorage.removeItem("userId");
            await sessionStorage.removeItem("token");
            document.location.href = "index.html";
        }
        else {
            alert("Erreur HTTP " + response.status);
        }
    }
    catch (err) { alert(err);}
}



async function main() {
    if (sessionStorage.getItem("token")) {
        formEventsListeners();
        const userId = getUserId();
        const token = sessionStorage.getItem("token");

        const user = await getProfile(userId, token);
        displayProfile(user);

        // events listeners on form profile and button delete
        document.getElementById("profile").addEventListener("submit",
            event => modifyUser(event, userId, token));
        document.getElementById("delete-user").addEventListener("click",
                event => deleteUser(event, userId, token));

        // remove userId and token from sessionStorage and redirect to index page
        logoutListener();
    }
    else document.location.href = "index.html";
}

main();