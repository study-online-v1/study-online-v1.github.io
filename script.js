  function showDiscussion(subject) {
  const discussions = document.querySelectorAll('.discussion');
  discussions.forEach(discussion => discussion.style.display = 'none');
  document.getElementById(subject).style.display = 'block';
}

  // 顯示選中的討論區
  const selectedDiscussion = document.getElementById(subject);
  selectedDiscussion.style.display = 'block';

  // 從後端獲取該主題的討論串資料
  fetch(`/threads/${subject}`)
    .then(response => response.json())
    .then(data => {
      const threadContainer = document.getElementById(`${subject}-threads`);
      threadContainer.innerHTML = ''; // 清空原有內容
      data.forEach(thread => {
        const threadElement = document.createElement('div');
        threadElement.classList.add('thread');
        threadElement.innerHTML = `
          <h3>${thread.title}</h3>
          <textarea placeholder="新增留言"></textarea>
          <button onclick="addComment(this)">提交留言</button>
          <div class="comments"></div>
        `;
        threadContainer.appendChild(threadElement);
      });
    });
    }
    const users = [];
    let currentUser = null;

    // 切換註冊與登入
    function switchToRegister() {
      document.getElementById('login-container').style.display = 'none';
      document.getElementById('register-container').style.display = 'block';
    }

    function switchToLogin() {
      document.getElementById('login-container').style.display = 'block';
      document.getElementById('register-container').style.display = 'none';
    }

    function handleRegister(event) {
  event.preventDefault();
  const username = document.getElementById('new-username').value.trim();
  const password = document.getElementById('new-password').value;

  // 取得現有使用者資料
  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.some(user => user.username === username)) {
    alert('用戶名稱已被註冊');
    return;
  }

  // 新增使用者到 localStorage
  users.push({ username, password });
  localStorage.setItem('users', JSON.stringify(users));
  alert('註冊成功，請登入');
  switchToLogin();
    }

    function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  // 從 localStorage 取出使用者資料
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(user => user.username === username && user.password === password);

  if (user) {
    alert('登入成功');
    currentUser = user.username;
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('discussion-container').style.display = 'block';
    document.getElementById('navbar').style.display = 'flex';
  } else {
    alert('用戶名稱或密碼錯誤');
  }
    }

    function logout() {
      currentUser = null;
      alert('已登出');
      document.getElementById('discussion-container').style.display = 'none';
      document.getElementById('login-container').style.display = 'block';
      document.getElementById('navbar').style.display = 'none';
    }


    function createNewThread(subject) {
  const title = prompt("請輸入討論串標題：");
  if (title) {
    // 獲取已存在的討論串，若無則初始化
    const storedThreads = JSON.parse(localStorage.getItem(`${subject}-threads`)) || [];

    // 新增討論串資料
    const thread = { title, comments: [] };
    storedThreads.push(thread);

    // 存回 localStorage
    localStorage.setItem(`${subject}-threads`, JSON.stringify(storedThreads));

    // 更新 UI
    loadThreads(subject);
  }
}

    function loadThreads(subject) {
  const threadContainer = document.getElementById(`${subject}-threads`);
  threadContainer.innerHTML = ""; // 清空現有 DOM

  // 從 localStorage 加載討論串資料
  const storedThreads = JSON.parse(localStorage.getItem(`${subject}-threads`)) || [];

  // 更新 UI
  storedThreads.forEach((thread, index) => {
    const threadElement = document.createElement("div");
    threadElement.classList.add("thread");
    threadElement.innerHTML = `
      <h3>${thread.title}</h3>
      <button onclick="editThread('${subject}', ${index})">編輯標題</button>
      <button onclick="deleteThread('${subject}', ${index})">刪除討論串</button>
      <textarea placeholder="新增留言"></textarea>
      <button onclick="addComment(this, '${subject}', ${index})">提交留言</button>
      <div class="comments"></div>
    `;

    // 加載留言與回覆
    const commentsContainer = threadElement.querySelector(".comments");
    thread.comments.forEach((comment, commentIndex) => {
      const commentElement = document.createElement("div");
      commentElement.classList.add("comment");
      commentElement.innerHTML = `
        <p><strong>${comment.user}:</strong> ${comment.content}</p>
        <div class="actions">
          <button onclick="replyToComment(this, '${subject}', ${index}, ${commentIndex})">回覆</button>
          <button onclick="editComment(this, '${subject}', ${index}, ${commentIndex})">編輯</button>
          <button onclick="deleteComment(this, '${subject}', ${index}, ${commentIndex})">刪除</button>
        </div>
        <div class="replies"></div>
      `;

      // 加載回覆
      const repliesContainer = commentElement.querySelector(".replies");
      comment.replies?.forEach(reply => {
        const replyElement = document.createElement("div");
        replyElement.classList.add("comment");
        replyElement.innerHTML = `
          <p><strong>${reply.user}:</strong> ${reply.content}</p>
        `;
        repliesContainer.appendChild(replyElement);
      });

      commentsContainer.appendChild(commentElement);
    });

    threadContainer.appendChild(threadElement);
  });
}

// 頁面載入時自動加載討論串
document.addEventListener("DOMContentLoaded", () => {
  const subjects = ["chinese", "english", "math", "chemistry", "physics", "geography", "history"];
  subjects.forEach(subject => loadThreads(subject));
});

    
    function addComment(buttonElement) {
  const commentText = buttonElement.previousElementSibling.value;
  const commentContainer = buttonElement.nextElementSibling;

  if (commentText) {
    const comment = document.createElement("div");
    comment.classList.add("comment");
    comment.innerHTML = `
      <p><strong>${currentUser}:</strong> ${commentText}</p>
      <div class="actions">
        <button onclick="replyToComment(this)">回覆</button>
        <button onclick="editComment(this)">編輯</button>
        <button onclick="deleteComment(this)">刪除</button>
      </div>
      <div class="replies"></div>
    `;
    commentContainer.appendChild(comment);
    buttonElement.previousElementSibling.value = "";

    // 儲存留言到 localStorage
    const subject = commentContainer.closest(".discussion").id; // 獲取目前討論區 ID
    const storedComments = JSON.parse(localStorage.getItem(subject)) || [];
    storedComments.push({
      user: currentUser,
      content: commentText,
      replies: []
    });
    localStorage.setItem(subject, JSON.stringify(storedComments));
  }
}
    function loadComments(subject) {
  const threadContainer = document.getElementById(`${subject}-threads`);
  threadContainer.innerHTML = ""; // 清空原有內容

  const storedComments = JSON.parse(localStorage.getItem(subject)) || [];
  storedComments.forEach((comment) => {
    const commentElement = document.createElement("div");
    commentElement.classList.add("comment");
    commentElement.innerHTML = `
      <p><strong>${comment.user}:</strong> ${comment.content}</p>
      <div class="actions">
        <button onclick="replyToComment(this)">回覆</button>
        <button onclick="editComment(this)">編輯</button>
        <button onclick="deleteComment(this)">刪除</button>
      </div>
      <div class="replies"></div>
    `;
    threadContainer.appendChild(commentElement);
  });
}
    //編輯討論串
    function editThread(subject, index) {
  const newTitle = prompt("請輸入新的討論串標題：");
  if (newTitle) {
    const storedThreads = JSON.parse(localStorage.getItem(`${subject}-threads`));
    storedThreads[index].title = newTitle;
    localStorage.setItem(`${subject}-threads`, JSON.stringify(storedThreads));
    loadThreads(subject);
  }
    }
    //刪除討論串
    function deleteThread(subject, index) {
  if (confirm("確定要刪除此討論串嗎？")) {
    const storedThreads = JSON.parse(localStorage.getItem(`${subject}-threads`));
    storedThreads.splice(index, 1);
    localStorage.setItem(`${subject}-threads`, JSON.stringify(storedThreads));
    loadThreads(subject);
  }
    }

// 頁面載入時調用
document.addEventListener("DOMContentLoaded", () => {
  const subjects = ["chinese", "english", "math", "chemistry", "physics", "geography", "history"];
  subjects.forEach((subject) => loadComments(subject));
});

    function replyToComment(buttonElement, subject, threadIndex) {
  const replyText = prompt("請輸入回覆內容：");
  if (replyText) {
    const replyContainer = buttonElement.parentElement.nextElementSibling;

    // 獲取留言的索引
    const commentIndex = Array.from(replyContainer.parentElement.parentElement.children).indexOf(replyContainer.parentElement);

    // 從 localStorage 讀取討論串資料
    const storedThreads = JSON.parse(localStorage.getItem(`${subject}-threads`)) || [];
    const targetThread = storedThreads[threadIndex];

    // 確保目標討論串的留言資料結構存在
    if (!targetThread.comments[commentIndex].replies) {
      targetThread.comments[commentIndex].replies = [];
    }

    // 新增回覆
    targetThread.comments[commentIndex].replies.push({
      user: currentUser,
      content: replyText
    });

    // 更新 localStorage
    localStorage.setItem(`${subject}-threads`, JSON.stringify(storedThreads));

    // 在頁面上新增回覆
    const reply = document.createElement("div");
    reply.classList.add("comment");
    reply.innerHTML = `
      <p><strong>${currentUser}:</strong> ${replyText}</p>
      <div class="actions">
        <button onclick="replyToComment(this, '${subject}', ${threadIndex})">回覆</button>
        <button onclick="editComment(this)">編輯</button>
        <button onclick="deleteComment(this)">刪除</button>
      </div>
    `;
    replyContainer.appendChild(reply);
  }
}

    function editComment(buttonElement) {
      const comment = buttonElement.parentElement.previousElementSibling;
      const newCommentText = prompt("請編輯留言內容：", comment.innerText);
      if (newCommentText) {
        comment.innerHTML = `<strong>${currentUser}:</strong> ${newCommentText}`;
      }
    }

    function deleteComment(buttonElement) {
      const comment = buttonElement.parentElement.parentElement;
      comment.remove();
    }

    function searchThreads(subject, query) {
      const threads = document.querySelectorAll(`#${subject}-threads .thread`);
      threads.forEach(thread => {
        const title = thread.querySelector('h3').innerText;
        thread.style.display = title.includes(query) ? 'block' : 'none';
      });
    }