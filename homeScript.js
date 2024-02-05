getPost();

function addPostBtn() {
  isEdit = false;
  document.querySelector("#postModal #postModalTitle").textContent = "New Post";
  document.querySelector("#postModal #postModalCreateBtn").textContent = "Post";
  document.querySelector("#postModal #titlePost").value = "";
  document.querySelector("#postModal #bodyPost").value = "";
  let createPostModal = new bootstrap.Modal(document.querySelector("#postModal"));
  createPostModal.toggle();
}
