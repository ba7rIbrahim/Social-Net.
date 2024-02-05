const parameters = new URLSearchParams(window.location.search);
const userId = parameters.get("userId");

getInfoProfile();
getPostUser();

function getInfoProfile() {
  toggleLoader(true);
  axios.get(`${baseURL}/users/${userId}`).then((response) => {
    let information = response.data.data;
    document.querySelector("#imageUser").src = information.profile_image;
    document.querySelector("#emailUser").textContent = information.email;
    document.querySelector("#nameUser").textContent = information.name;
    document.querySelector("#usernameUser").textContent = information.username;
    document.querySelector("#numberOfPosts").textContent =
      information.posts_count;
    document.querySelector("#numberOfComments").textContent =
      information.comments_count;
  }).catch((error) => showAlert(error.response.data.message, "warning", 4000)
  ).finally(() => toggleLoader(false));
}

function getPostUser() {
  let params = {
    "sortBy": "created_at",
    "orderBy": "asc "
  };
  toggleLoader(true);
  axios.get(`${baseURL}/users/${userId}/posts`, {
    params: params
  }).then((response) => {
    let posts = response.data.data;
    for (let post of posts) {
      createPost(post);
    }
  }).catch((error) => showAlert(error.response.data.message, "warning", 4000)
  ).finally(() => toggleLoader(false));
}
