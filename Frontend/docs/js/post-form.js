import {port} from "./port.js";
import {logoutListener} from "./logout.js";

/**
 * Add events listeners on form inputs
 */
function formEventsListeners(formData) {
    const publishInputs = document.forms["publish"].elements;
    console.log(publishInputs);
    for (let publishInput of publishInputs) {
        publishInput.addEventListener("input", inputsValidation);
        publishInput.addEventListener("invalid", showInputError);
    }
    const inputImage = publishInputs[1];
    inputImage.addEventListener("change", event => displayImageUploaded(event, formData)); // listen image upload
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
 * If post creation = we need userId
 * If post modification = we need postId, userId
 * @returns {{postId: string, userId: number}}
 */
function getIds() {
    const urlParams = new URLSearchParams(location.search);
    const postId = urlParams.get("postId") ? urlParams.get("postId") : undefined;
    const postUserId = urlParams.get("userId") ? Number(urlParams.get("userId")) : undefined;
    const userId = Number(sessionStorage.getItem("userId"));
    return {postId, postUserId, userId};
}


async function getPost(postId, token) {
    try {
        const response = await fetch(`http://localhost:${port}/api/posts/${postId}`,{
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
    }
    catch(err) { alert(err); }
}


function hideShowButtons(postUserId, userId, moderator) {

    if(postUserId === userId || moderator === true ) { // if it's a modification and user is owner or moderator
        document.getElementById("publish-post").disabled = true;
        document.getElementById("modify-post").disabled = false;
        document.getElementById("publish-post").style.setProperty("display", "none", "important");
        document.getElementById("modify-post").style.setProperty("display", "block", "important");
    }
    else { // if it's a modification but no rights
        document.getElementById("publish-post").disabled = true;
        document.getElementById("publish-post").style.setProperty("display", "none", "important");
    }
}


function displayPost(post){
    document.getElementsByTagName("h1")[0].innerText = "Modifier l'article";

    const preview = document.getElementById("preview");
    const image = document.createElement("img");
    image.src = post.result.imageUrl;
    image.height = 400;
    image.width = 800;
    image.decoding = "async";
    image.classList.add("rounded", "img-fluid", "w-100");
    preview.append(image);

    document.getElementById("caption").setAttribute("value", post.result.caption);
    document.getElementById("title").setAttribute("value", post.result.title);
    document.getElementById("content").value = post.result.content; // textarea !!
}


function displayImageUploaded(event, formData) {
    const preview = document.getElementById("preview");
    const file = event.target.files[0];
    if(file && validFileType(file)) {
        if(preview.firstChild) preview.removeChild(preview.firstChild); // removes old image if exist (also needs to be removed in backend)
        const image = document.createElement("img");
        image.src = window.URL.createObjectURL(file);
        image.height = 400;
        image.width = 800;
        image.decoding = "async";
        image.classList.add("rounded", "img-fluid", "w-100");
        preview.append(image);
        formData.append("image", file, file.name);
    }
}


function validFileType(file) {
    const fileTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png"
    ]
    for(let i = 0; i < fileTypes.length; i++ ) {
        if(file.type === fileTypes[i]) return true;
    }

    return false;
}


async function createPost(event, userId, token, formData) {
    event.preventDefault();
    const form = document.forms["publish"];
    const post = {
        caption: form.elements.caption.value,
        title: form.elements.title.value,
        content: document.getElementById("content").value,
        user_id: userId // used by auth and authPosts middlewares in backend
    };

    const postJson = JSON.stringify(post);
    formData.append("data", postJson); // formData = file + data

    try {
        const response = await fetch(`http://localhost:${port}/api/posts`, { // create post request
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                //"Content-Type": "multipart/form-data" ---> don't !!
            },
            body: formData
        });

        if(response.ok) { alert("Article publié !"); }
        return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
    }
    catch (err) { alert(err); }
}


async function modifyPost(event, userId, token, postId, formData) {
    event.preventDefault();
    const form = document.forms["publish"];

    const post = {
        caption: form.elements.caption.value ? form.elements.caption.value : undefined,
        title: form.elements.title.value ? form.elements.title.value : undefined,
        content: document.getElementById("content").value ?
                document.getElementById("content").value : undefined,
        user_id: userId // used by auth and authPosts middlewares in backend
    };

    const postJson = JSON.stringify(post);

    // if formData contains file, multer middleware
    if(formData.has("image")) {
        formData.append("data", postJson);

        try {
            const response = await fetch(`http://localhost:${port}/api/posts/${postId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": "Bearer " + token,
                },
                body: formData
            });

            if(response.ok) { alert("Article modifié !"); }
            return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
        }
        catch (err) { alert(err);}
    }

    // if there's no file, no multer middleware
    else {
        try {
            const response = await fetch(`http://localhost:${port}/api/posts/alt/${postId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json;charset=utf-8" // don't forget when there is a json body !!
                },
                body: postJson
            });

            if(response.ok) { alert("Article modifié !"); }
            return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
        }
        catch (err) { alert(err);}
    }

}


async function main() {
    if (sessionStorage.getItem("token")) {

        /* formData will be appended after input image change event
         * see formEventsListeners --> displayImageUploaded
         * and then we can pass it to createPost/modifyPost events
         */
        let formData = new FormData();

        formEventsListeners(formData);
        const {postId, postUserId, userId} = getIds();
        const token = sessionStorage.getItem("token");

        if(postId) { // if true it's a modification
            const post = await getPost(postId, token);
            const moderator = post.moderator; // form getPost response
            hideShowButtons(postUserId, userId, moderator);
            displayPost(post);
        }


        // events listeners on form publish and button modify
        document.getElementById("publish").addEventListener("submit",
            event => createPost(event, userId, token, formData));
        document.getElementById("modify-post").addEventListener("click",
            event => modifyPost(event, userId, token, postId, formData));

        // remove userId and token from sessionStorage and redirect to index page
        logoutListener();
    }
    else document.location.href = "index.html";
}

main();