import {port} from "./port.js";
import {logoutListener} from "./logout.js";


function getIds() {
    const urlParams = new URLSearchParams(location.search);
    const postId = urlParams.get("postId") ? urlParams.get("postId") : undefined;
    const postUserId = urlParams.get("userId") ? Number(urlParams.get("userId")) : undefined;
    const userId = Number(sessionStorage.getItem("userId"));
    return {postId, postUserId, userId};
}


async function getUser(userId, token) {
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


async function getAuthor(post, token) {

    if(!post.result.user_id) return {userId: "#", firstName: "Utilisateur", lastName: "supprimé"}; // deleted users but keep posts

    try {
        const response = await fetch(`http://localhost:${port}/api/auth/${post.result.user_id}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
    }
    catch (err) { alert(err);}
}


async function displayPost(post, author, postUserId){

    // redirect to post-fom page to modify post
    document.getElementById("modify-post").setAttribute("href", `post-form.html?postId=${post.result.id}&userId=${postUserId}`);

    const postContainer = document.getElementById("article");

    const datetime = new Date(post.result.updatedAt);
    const date = datetime.toLocaleDateString('fr-FR');


    postContainer.innerHTML =
        `<figure>
                <img src="${post.result.imageUrl}" class="rounded img-fluid w-100" alt="${post.result.caption}"/>
                <figcaption class="text-center">${post.result.caption}</figcaption>
            </figure>
            <div class="date bg-secondary text-white rounded px-2 d-inline-block">${date}</div>
            <h1 class="my-2">${post.result.title}</h1>
            <pre class="bg-light p-1 p-lg-5">${post.result.content}</pre>
            <a class="fst-italic fs-5" href="profile.html?userId=${author.userId}">Article publié par&nbsp: ${author.firstName} ${author.lastName}</a>`
}



async function getComments(postId, token) {
    try {
        const response = await fetch(`http://localhost:${port}/api/comments/${postId}`,{
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
    }
    catch(err) { alert(err); }
}


async function getCommentAuthor(user_id, token) {

    if(!user_id) return {firstName: "Utilisateur", lastName: "supprimé"}; // deleted users but keep comments

    try {
        const response = await fetch(`http://localhost:${port}/api/auth/${user_id}`, {
            method: "GET",
            headers: {
                "Authorization": "Bearer " + token
            }
        });
        return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
    }
    catch (err) { alert(err);}
}


async function displayComments(comments, user, moderator, token) {

    const commentsContainer = document.getElementById("comments");

    for (let comment of comments) {

        const user_id = comment.user_id;
        const author = await getCommentAuthor(user_id, token);

        const content = document.createElement("div");
        content.classList.add("my-4");
        const datetime = new Date(comment.updatedAt);
        const date = datetime.toLocaleDateString('fr-FR');

        let commentsButtons = "";

        if(comment.user_id === user.userId || moderator === true ) {
            commentsButtons =
                `<button class="position-absolute d-none validate-comment btn btn-primary mb-2" type="button" name="Valider" value="Valider" disabled>Valider</button>
            <button class="position-absolute modify-comment btn btn-primary mb-2" type="button" name="Modifier" value="Modifier">Modifier</button>
            <button class="position-absolute d-none cancel-comment btn btn-danger mb-2" type="button" name="Annuler" value="Annuler" disabled>Annuler</button>
            <button class="position-absolute delete-comment btn btn-danger mb-2" type="button" name="Supprimer" value="Supprimer">Supprimer</button>`;
        }

        content.innerHTML = `<a href="profile.html?userId=${comment.user_id}">${author.firstName} ${author.lastName} a écrit le ${date}&nbsp:</a>
            <textarea class="form-control pr-5 py-3" name="${comment.id}" id="${comment.id}" 
            rows="5" cols="80" minlength="3" maxlength="400" readonly>${comment.content}</textarea>
            <div class="position-relative">${commentsButtons}</div>`;
        commentsContainer.append(content);
    }
}


async function createComment(event, userId, token, postId) {
    event.preventDefault();
    const comments = document.getElementById("comments");
    const comment = {
        content: document.getElementById("content").value,
        user_id: userId,
        post_id: postId
    };

    const commentJson = JSON.stringify(comment);

    try {
        const response = await fetch(`http://localhost:${port}/api/comments/${postId}`, {
            method: "POST",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json;charset=utf-8"
            },
            body: commentJson
        });

        if(response.ok) {
            alert("Commentaire publié !");

            // to be reviewed to respect the DRY**********************
            const content = document.createElement("div");
            content.classList.add("my-4");
            const datetime = new Date();
            const date = datetime.toLocaleDateString('fr-FR');
            const author = await getCommentAuthor(userId, token);

            content.innerHTML = `<a href="profile.html?userId=userId">${author.firstName} ${author.lastName} a écrit le ${date}&nbsp:</a>
            <textarea class="form-control pr-5 py-3" rows="5" cols="80" readonly>${comment.content}</textarea>`;
            comments.prepend(content);
        }
        else { alert("Erreur HTTP " + response.status); }
    }
    catch (err) { alert(err); }
}


async function modifyComment(event, userId, token, postId) {

    let textarea = event.target.parentNode.previousElementSibling;
    textarea.readOnly = false;
    const backupComment =  textarea.value;

    // hide modify and delete buttons
    event.target.disabled = true;
    event.target.style.setProperty("display", "none", "important");
    event.target.nextElementSibling.nextElementSibling.disabled = true;
    event.target.nextElementSibling.nextElementSibling.style.setProperty("display", "none", "important");

    // display validate and cancel buttons
    event.target.previousElementSibling.disabled = false;
    event.target.previousElementSibling.style.setProperty("display", "inline-block", "important");
    event.target.nextElementSibling.disabled = false;
    event.target.nextElementSibling.style.setProperty("display", "inline-block", "important");

    // add event listeners on validate and cancel buttons
    event.target.previousElementSibling.addEventListener("click", event => validateComment(event, userId, token, postId));
    event.target.nextElementSibling.addEventListener("click", event => cancelComment(event, textarea, backupComment));
}

async function validateComment(event, userId, token, postId) {
    // hide cancel button
    event.target.nextElementSibling.nextElementSibling.disabled = true;
    event.target.nextElementSibling.nextElementSibling.style.setProperty("display", "none", "important");

    const textarea = event.target.parentNode.previousElementSibling;
    textarea.readOnly = true;
    const commentId = textarea.id;

    const comment = {
        content: document.getElementById(`${commentId}`).value,
        user_id: userId,
        post_id: postId
    };

    const commentJson = JSON.stringify(comment);

    try {
        const response = await fetch(`http://localhost:${port}/api/comments/${commentId}`, {
            method: "PUT",
            headers: {
                "Authorization": "Bearer " + token,
                "Content-Type": "application/json;charset=utf-8"
            },
            body: commentJson
        });

        if(response.ok) { alert("Commentaire modifié !"); }
        return response.ok ? response.json() : alert("Erreur HTTP " + response.status);
    }
    catch (err) { alert(err);}
}


function cancelComment(event, textarea, backupComment) {

    textarea.readOnly = true;
    textarea.value = backupComment;

    // hide validate and cancel buttons
    event.target.disabled = true;
    event.target.style.setProperty("display", "none", "important");
    event.target.previousElementSibling.previousElementSibling.disabled = true;
    event.target.previousElementSibling.previousElementSibling.style.setProperty("display", "none", "important");

    // display modify and delete buttons
    event.target.previousElementSibling.disabled = false;
    event.target.previousElementSibling.style.setProperty("display", "inline-block", "important");
    event.target.nextElementSibling.disabled = false;
    event.target.nextElementSibling.style.setProperty("display", "inline-block", "important");
}


async function deleteComment(event, token) {

    const textarea = event.target.parentNode.previousElementSibling;
    textarea.readonly = false;
    const commentId = textarea.id;

    try {
        const response = await fetch(`http://localhost:${port}/api/comments/${commentId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if(response.ok) {
            alert("Commentaire supprimé !");
            const textareaParent = textarea.parentNode;
            textareaParent.remove();
        }
        else { alert("Erreur HTTP " + response.status); }
    }
    catch (err) { alert(err);}
}


async function deletePost(event, token, postId) {
    event.preventDefault();
    try {
        const response = await fetch(`http://localhost:${port}/api/posts/${postId}`, {
            method: "DELETE",
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        if(response.ok) {
            alert("Article supprimé !");
            document.location.href = "posts.html";
        }

        else { alert("Erreur HTTP " + response.status); }
    }
    catch (err) { alert(err);}

}


function hideShowButtons(postUserId, userId, moderator) {

    if(postUserId === userId || moderator === true ) { // if user is owner or moderator
        document.getElementById("modify-button").disabled = false;
        document.getElementById("delete-post").disabled = false;
        document.getElementById("delete-post").style.setProperty("display", "block", "important");
        document.getElementById("modify-post").style.setProperty("display", "inline", "important");
    }
    else {
        document.getElementById("modify-button").disabled = true;
        document.getElementById("delete-post").disabled = true;
        document.getElementById("delete-post").style.setProperty("display", "none", "important");
        document.getElementById("modify-post").style.setProperty("display", "none", "important");
    }
}


async function main() {
    if (sessionStorage.getItem("token")) {

        const {postId, postUserId, userId} = getIds();
        const token = sessionStorage.getItem("token");

        const post = await getPost(postId, token);
        const moderator = post.moderator; // from getPost response
        const author = await getAuthor(post,token);
        const user = await getUser(userId, token);
        await displayPost(post, author, postUserId);
        const comments = await getComments(postId, token);
        await displayComments(comments, user, moderator, token);
        hideShowButtons(postUserId, userId, moderator);

        // events listeners on comment form and buttons
        document.getElementById("delete-post").addEventListener("click",
            event => deletePost(event, token, postId));
        document.getElementById("comment").addEventListener("submit",
            event => createComment(event, userId, token, postId));

        const modifyCommentButtons = document.getElementsByClassName("modify-comment");
        for (let modifyCommentButton of modifyCommentButtons) {
            modifyCommentButton.addEventListener("click",event => modifyComment(event, userId, token, postId));
        }

        const deleteCommentButtons = document.getElementsByClassName("delete-comment");
        for (let deleteCommentButton of deleteCommentButtons) {
            deleteCommentButton.addEventListener("click",event => deleteComment(event, token));
        }

        // remove userId and token from sessionStorage and redirect to index page
        logoutListener();
    }
    else document.location.href = "index.html";
}

main();