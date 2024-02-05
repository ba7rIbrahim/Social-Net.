let baseURL = "https://tarmeezacademy.com/api/v1";
let currentPage = 1;
let lastPage;
isEdit = false;

loginSuccessUI();

function loginSuccessUI() {
  if (localStorage.getItem("token")) {
    showLogoutBtn();
    if (document.querySelector("#addPostBtn") != null)
      document.querySelector("#addPostBtn").style.display = "flex";
  }
}

window.addEventListener("scroll", () => {
  if (window.scrollY + window.innerHeight + 1 >= document.documentElement.scrollHeight && currentPage < lastPage) {
    currentPage++;
    getPost();
  }
});

function getPost(reload = false) {
  let params = {
    limit: 5,
    page: currentPage,
  };
  toggleLoader(true);
  axios.get(`${baseURL}/posts`, {
    params: params 
  }).then((response) => {
    lastPage = response.data.meta.last_page;
    let posts = response.data.data;

    if(reload) {
      document.querySelector(".posts .container").innerHTML = "";
    }

    for (let post of posts) {
      createPost(post);
    }
  }
  ).finally(() => toggleLoader(false));
}

function loginBtnClicked() {
  const username = document.querySelector(
    "#loginModal input#usernameInput"
  ).value;
  const password = document.querySelector(
    "#loginModal input#passwordInput"
  ).value;
  const params = {
    username: username,
    password: password,
  };
  toggleLoader(true);
  axios.post(`${baseURL}/login`, params
  ).then((response) => {
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("token", response.data.token);

    bootstrap.Modal.getInstance(document.querySelector("#loginModal")).hide();

    showLogoutBtn();
    showAlert("You are logged in successfully", "success", 2000);
    if (document.querySelector("#addPostBtn") != null)
      document.querySelector("#addPostBtn").style.display = "flex";
  }).catch((error) => showAlert(error.response.data.message, "warning", 3000)
  ).finally(() => toggleLoader(false))
}

function logoutBtnClicked() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  showLoginBtn();
  showAlert("You have been successfully logged out", "success", 2000);
  if (document.querySelector("#addPostBtn") != null)
    document.querySelector("#addPostBtn").style.display = "none";
}

function registerBtnClicked() {
  const username = document.querySelector("#registerModal input#usernameRegister").value;
  const name = document.querySelector("#registerModal input#nameRegister").value;
  const password = document.querySelector("#registerModal input#passwordRegister").value;
  const email = document.querySelector("#registerModal input#emailRegister").value;
  const image = document.querySelector("#registerModal input#imageRegister").files[0];

  let formData = new FormData();
  formData.append("username", username);
  formData.append("name", name);
  formData.append("password", password);
  formData.append("email", email);
  formData.append("image", image);

  toggleLoader(true);
  axios.post(`${baseURL}/register`, formData
  ).then((response) => {
    localStorage.setItem("user", JSON.stringify(response.data.user));
    localStorage.setItem("token", response.data.token);

    bootstrap.Modal.getInstance(document.querySelector("#registerModal")).hide();
    showLogoutBtn();
    showAlert("You are logged in successfully", "success", 2000);
  }).catch((error) => showAlert(error.response.data.message, "warning", 4000)
  ).finally(() => toggleLoader(false))
}

function showLogoutBtn() {
  document.querySelector("#loginButton").style.display = "none";
  document.querySelector("#registerButton").style.display = "none";
  document.querySelector("#logoutButton").style.display = "block";
  if (document.querySelector("#addPostBtn") != null)
    document.querySelector("#addPostBtn").style.display = "flex";
  userInfo();
}

function showLoginBtn() {
  document.querySelector("#loginButton").style.display = "block";
  document.querySelector("#registerButton").style.display = "block";
  document.querySelector("#logoutButton").style.display = "none";
  if (document.querySelector("#addPostBtn") != null)
    document.querySelector("#addPostBtn").style.display = "none";
  document.querySelector(".userInfo").innerHTML = "";
}

function createPost(post) {
  let postContainer = document.querySelector(".posts .container");
  let content = `
    <div id=${post.id} class="post card w-100 my-5 shadow" style="width: 18rem;">
      <div class="head d-flex align-items-center justify-content-between py-4 px-2" style="background: rgba(0, 0, 0, 0.03); border-bottom: 1px solid rgba(0, 0, 0, 0.175);">
        <div onclick="getProfileUser(${post.author.id})" style="cursor: pointer;">
          <img src="${post.author.profile_image}" class="rounded-circle border border-2 me-2" style="width: 40px; height: 40px" alt="">
          <span class="name fs-4 fw-semibold">${post.author.username}</span>
        </div>
        <div id="editPost">${showEditAndRemoveBtn(post)}</div>
      </div>
      <div class="card-body" style="cursor: pointer;" onclick="postClicked(${post.id})">
        <img src="${post.image}" class="card-img-top" alt="...">
        <span class="postTime pt-2 text-secondary">${post.created_at}</span>
        <div class="card-text mt-1">
          <h5 class="card-title fw-bolder">${post.title == null ? "" : post.title}</h5>
          <p class="card-text fs-5">${post.body}</p>
        </div>
        <hr>
        <div id="comments" class="comments d-flex align-items-center">
          <i class="fa-solid fa-pen"></i>
          <span class="comment fw-semibold mx-2" style="cursor: pointer;">(${post.comments_count})Comments</span>
          <div class="ms-3" id="tags">${createTagsBtn(post.tags)}</div>
      </div>
    </div>
  `;
  if (postContainer != null) postContainer.innerHTML += content;
}

function createTagsBtn(tags) {
  let tagsContent = ``;
  for (let tag of tags)
    tagsContent += `<span type="button" class="btn btn-secondary btn-sm rounded-pill mx-1">${tag.name}</span>`;
  return tagsContent;
}

function createNewPostBtn() {
  let alert;
  let postId = +document.querySelector("#postModal #postModalCreateBtn").dataset.id;
  let url;

  let formData = new FormData();
  formData.append("title", document.querySelector("#titlePost").value);
  formData.append("body", document.querySelector("#bodyPost").value);
  formData.append("image", document.querySelector("#imagePost").files[0]);
  let header = {
    "Content-Type": "multipart/form-data",
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  if (isEdit) {
    formData.append("_method", "put");
    url = `${baseURL}/posts/${postId}`;
    alert = showAlert("Success Edit The Post", "success", 2000);
  } else {
    url = `${baseURL}/posts`;
    alert = showAlert("Success Create The Post", "success", 2000);
  }

  toggleLoader(true)
  axios.post(url, formData, {
      headers: header,
    }).then(() => {
      bootstrap.Modal.getInstance(document.querySelector("#postModal")).hide();
      showAlert;
      getPost(true);
    }).catch((error) => showAlert(error.response.data.message, "error", 4000)
    ).finally(() => toggleLoader(false));
}

function postClicked(postId) {
  window.open(`./postDetails.html?postId=${postId}`, "_self");
}

function userInfo() {
  if (localStorage.getItem("user")) {
    const nameUser = JSON.parse(localStorage.getItem("user")).username;
    const imageUser = JSON.parse(localStorage.getItem("user")).profile_image;
    let content = `   
      <span class="fw-semibold fs-5">${nameUser}</span>
      <img src="${imageUser}" class="rounded-circle ms-1" style="width: 40px; height: 40px;" alt="">
    `;
    document.querySelector(".userInfo").innerHTML += content;
  }
}

function showAlert(customMessage, type = "success", timeSpend = 4000) {
  swal({ title: customMessage, icon: type });
  setTimeout(() => {
    swal.close();
  }, timeSpend);
}

function showEditAndRemoveBtn(post) {
  const userId = JSON.parse(localStorage.getItem("user")).id;
  let contentEditPost = ``;
  if (userId == post.author.id) {
    contentEditPost += `
      <button id="editPostBtn" class="btn btn-secondary" onclick="editPostBtnClicked('${encodeURIComponent(JSON.stringify(post))}')" style="padding: 3px 0; width: 65px;" type="button">Edit</button>
      <button id="removePostBtn" data-id=${post.id} class="btn btn-danger" data-bs-toggle="modal" data-bs-target="#deletePostModal" style="padding: 3px 0; width: 65px;" type="button">Remove</button>
    `;
  }
  return contentEditPost;
}

function editPostBtnClicked(postObject) {
  isEdit = true;
  let post = JSON.parse(decodeURIComponent(postObject));

  document.querySelector("#postModal #postModalCreateBtn").dataset.id = post.id;
  document.querySelector("#postModal #postModalTitle").textContent ="Edit Post";
  document.querySelector("#postModal #postModalCreateBtn").textContent ="Update";
  document.querySelector("#postModal #titlePost").value = post.title;
  document.querySelector("#postModal #bodyPost").value = post.body;
  document.querySelector("#postModal #imagePost").files[0] = post.image;

  let createPostModal = new bootstrap.Modal(document.querySelector("#postModal"));
  createPostModal.toggle();
}

function removePostBtnClicked() {
  postId = +document.querySelector("#removePostBtn").dataset.id;
  let header = {
    authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  toggleLoader(true);
  axios.delete(`${baseURL}/posts/${postId}`, {
    headers: header,
  }).then(() => {
    bootstrap.Modal.getInstance(document.querySelector("#deletePostModal")).hide();
    showAlert("Success Delete The Post", "success", 2000);
    getPost(true);
  })
  .catch((error) => showAlert(error.response.data.message, "warning", 4000)
  ).finally(() => toggleLoader(false));
}

function getProfileUser(userId) {
  window.open(`./profile.html?userId=${userId}`, "_self");
}

function profileClicked() {
  let user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    window.open(`./profile.html?userId=${user.id}`, "_self");
  }
}

function toggleLoader(show = true) {
  let loader = document.querySelector('#loader');
  if(show) loader.style.visibility = "visible";
  else loader.style.visibility = "hidden";
}
