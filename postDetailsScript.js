
const urlParams = new URLSearchParams (window.location.search);
const id = urlParams.get('postId');
showPost();

function showPost() {
  toggleLoader(true);
  axios.get(`${baseURL}/posts/${id}`)
    .then((response) => {
      let post = response.data.data;
      
      let content = `
        <div id=${post.id} class="post card w-100 my-5 shadow" style="width: 18rem;">
          <div class="head d-flex align-items-center justify-content-between py-4 px-2" style="background: rgba(0, 0, 0, 0.03); border-bottom: 1px solid rgba(0, 0, 0, 0.175);">
            <div onclick="getProfileUser(${post.author.id})" style="cursor: pointer;">
              <img src="${post.author.profile_image}" class="rounded-circle border border-2 me-2" style="width: 40px; height: 40px" alt="">
              <span class="name fs-4 fw-semibold">${post.author.username}</span>
            </div>
            <div id="editPost">${showEditAndRemoveBtn(post)}</div>
          </div>
        <div class="card-body">
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

          <div id="comments" class="mt-3">
            <div id="comment">${showComments(post.comments, post.author.id)}</div>
            <div class="input-group my-3" id="add-comment-div">
              <input id="commentValue" type="text" placeholder="add your comment.." class="form-control" placeholder="" aria-label="Example text with button addon" aria-describedby="button-addon1">
              <button class="btn btn-outline-primary" type="button" id="button-addon1" onclick="addComment()">send</button>
            </div>
          </div>



        </div>
      `;
      let postContainer = document.querySelector('.posts .container');
      if(postContainer != null) postContainer.innerHTML = content;
    }).catch((error) => showAlert(error.response.data.message, "warning", 4000)
    ).finally(() => toggleLoader(false))
}

function showComments(comments) {
  let commentContent = ``;
  for(let comment of comments) {
    commentContent +=
    `
    <div class="m-2 ps-2 py-1" style="background-color: #f5f5f5; border-radius: 10px;">
      <div class="d-flex align-items-center" style="cursor: pointer; width: fit-content" onclick="getProfileUser(${comment.author.id})">
        <img src="${comment.author.profile_image}" class="img-thumbnail rounded-5 me-1" style="width: 40px; height: 40px" alt="">
        <span class="name fw-bolder">${comment.author.username}</span>
      </div>
      <div id="textComment" class="mx-4 mb-1">${comment.body}</div>
    </div>
    `;
  }
  return commentContent;
}

function addComment() {
  let commentValue  = document.querySelector('#commentValue');
  let header = {
    "authorization": `Bearer ${localStorage.getItem('token')}`
  }
  let params = {
    "body": commentValue.value,
  }

  toggleLoader(true);
  axios.post(`${baseURL}/posts/${id}/comments`, params, {
    headers: header
  }).then((response) => {
    let comment = response.data.data;
    let commentContent = 
    `
    <div class="m-2 ps-2 py-1" style="background-color: #f5f5f5; border-radius: 10px;">
      <div class="d-flex align-items-center" style="cursor: pointer" onclick="getProfileUser(${comment.author.id})">
        <img src="${comment.author.profile_image}" class="img-thumbnail rounded-5 me-1" style="width: 40px; height: 40px" alt="">
        <span class="name fw-bolder">${comment.author.username}</span>
      </div>
      <div id="textComment" class="mx-4 mb-1">${comment.body}</div>
    </div>
    `;
    document.querySelector('#comments #comment').innerHTML += commentContent;
    document.querySelector('#commentValue').value = "";
  }).catch((error) => showAlert(error.response.data.message, "warning", 4000)
  ).finally(() => toggleLoader(false));
}