// --- 購物車功能 ---
const CART_KEY = 'cart_items';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(book) {
  const cart = getCart();
  const exist = cart.find(item => item.id === book.id);
  if (!exist) {
    cart.push({...book, quantity: 1});
  } else {
    exist.quantity += 1;
  }
  setCart(cart);
  alert('已加入購物車！');
}

function removeFromCart(bookId) {
  let cart = getCart();
  cart = cart.filter(item => item.id !== bookId);
  setCart(cart);
}

function clearCart() {
  setCart([]);
}

// 在 cart.html 顯示購物車內容
if (location.pathname.endsWith('cart.html')) {
  document.addEventListener('DOMContentLoaded', function() {
    renderCart();
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) checkoutBtn.onclick = checkoutCart;
  });
}

function renderCart() {
  const cart = getCart();
  const cartList = document.getElementById('cart-list');
  const cartEmpty = document.getElementById('cart-empty');
  if (!cartList) return;
  if (cart.length === 0) {
    cartList.innerHTML = '';
    if (cartEmpty) cartEmpty.style.display = '';
    document.getElementById('cart-summary').innerHTML = '';
    return;
  }
  if (cartEmpty) cartEmpty.style.display = 'none';
  let total = 0;
  cartList.innerHTML = cart.map(item => {
    const subtotal = item.price * item.quantity;
    total += subtotal;
    return `
      <tr>
        <td class="text-start">
          <img src="${item.image}" alt="${item.title}" style="height:40px;margin-right:1em;">
          <strong>${item.title}</strong><br><span class="text-muted small">${item.author}</span>
        </td>
        <td>${item.quantity}</td>
        <td>$${item.price}</td>
        <td>$${subtotal}</td>
        <td><button class="btn btn-danger btn-sm" onclick="removeFromCartAndRerender(${item.id})">移除</button></td>
      </tr>
    `;
  }).join('');
  document.getElementById('cart-summary').innerHTML = `<strong>總金額：$${total}</strong>`;
}

function removeFromCartAndRerender(bookId) {
  removeFromCart(bookId);
  renderCart();
}

function checkoutCart() {
  const cart = getCart();
  if (cart.length === 0) {
    alert('購物車是空的');
    return;
  }
  // 這裡可串接後端 API，暫以 alert 模擬
  clearCart();
  renderCart();
  document.getElementById('checkout-result').innerHTML = '<div class="alert alert-success">結帳成功！</div>';
}

// --- 首頁動態渲染書卡與分類篩選 ---
document.addEventListener('DOMContentLoaded', function() {
  if (location.pathname.endsWith('index.html') || location.pathname.endsWith('/')) {
    // 靜態書籍資料（每分類五本）
    const books = [
      // 文學小說
      {id: 1, title: '被討厭的勇氣', author: '岸見一郎、古賀史健', price: 146, oldPrice: 299, image: 'https://fakeimg.pl/200x280/?text=書封1', category: '文學小說'},
      {id: 2, title: '百年孤寂', author: '加西亞．馬奎斯', price: 250, oldPrice: 420, image: 'https://fakeimg.pl/200x280/?text=書封2', category: '文學小說'},
      {id: 3, title: '追風箏的人', author: '卡勒德．胡賽尼', price: 180, oldPrice: 350, image: 'https://fakeimg.pl/200x280/?text=書封3', category: '文學小說'},
      {id: 4, title: '小王子', author: '聖修伯里', price: 120, oldPrice: 220, image: 'https://fakeimg.pl/200x280/?text=書封4', category: '文學小說'},
      {id: 5, title: '挪威的森林', author: '村上春樹', price: 210, oldPrice: 380, image: 'https://fakeimg.pl/200x280/?text=書封5', category: '文學小說'},
      // 商業理財
      {id: 6, title: '富爸爸窮爸爸', author: '羅伯特．T．清崎', price: 199, oldPrice: 350, image: 'https://fakeimg.pl/200x280/?text=商業1', category: '商業理財'},
      {id: 7, title: '有錢人想的和你不一樣', author: '哈福．艾克', price: 180, oldPrice: 320, image: 'https://fakeimg.pl/200x280/?text=商業2', category: '商業理財'},
      {id: 8, title: '窮查理的普通常識', author: '查理．蒙格', price: 220, oldPrice: 400, image: 'https://fakeimg.pl/200x280/?text=商業3', category: '商業理財'},
      {id: 9, title: '從0到1', author: '彼得．提爾', price: 210, oldPrice: 380, image: 'https://fakeimg.pl/200x280/?text=商業4', category: '商業理財'},
      {id: 10, title: '原子習慣', author: '詹姆斯．克利爾', price: 236, oldPrice: 329, image: 'https://fakeimg.pl/200x280/?text=商業5', category: '商業理財'},
      // 心理勵志
      {id: 11, title: '被討厭的勇氣', author: '岸見一郎、古賀史健', price: 146, oldPrice: 299, image: 'https://fakeimg.pl/200x280/?text=心理1', category: '心理勵志'},
      {id: 12, title: '自控力', author: '凱利．麥格尼格爾', price: 180, oldPrice: 320, image: 'https://fakeimg.pl/200x280/?text=心理2', category: '心理勵志'},
      {id: 13, title: '情緒勒索', author: '周慕姿', price: 210, oldPrice: 380, image: 'https://fakeimg.pl/200x280/?text=心理3', category: '心理勵志'},
      {id: 14, title: '被討厭的勇氣2', author: '岸見一郎、古賀史健', price: 146, oldPrice: 299, image: 'https://fakeimg.pl/200x280/?text=心理4', category: '心理勵志'},
      {id: 15, title: '你要如何衡量你的人生', author: '克雷頓．克里斯汀生', price: 250, oldPrice: 420, image: 'https://fakeimg.pl/200x280/?text=心理5', category: '心理勵志'},
      // 生活風格
      {id: 16, title: '斷捨離', author: '山下英子', price: 180, oldPrice: 320, image: 'https://fakeimg.pl/200x280/?text=生活1', category: '生活風格'},
      {id: 17, title: '怦然心動的人生整理魔法', author: '近藤麻理惠', price: 210, oldPrice: 380, image: 'https://fakeimg.pl/200x280/?text=生活2', category: '生活風格'},
      {id: 18, title: '小日子', author: '小日子編輯部', price: 236, oldPrice: 329, image: 'https://fakeimg.pl/200x280/?text=生活3', category: '生活風格'},
      {id: 19, title: '慢活', author: '慢活編輯部', price: 199, oldPrice: 350, image: 'https://fakeimg.pl/200x280/?text=生活4', category: '生活風格'},
      {id: 20, title: '日日三餐，早‧午‧晚', author: 'MASA', price: 250, oldPrice: 420, image: 'https://fakeimg.pl/200x280/?text=生活5', category: '生活風格'},
      // 人文社科
      {id: 21, title: '槍炮、病菌與鋼鐵', author: '賈德．戴蒙', price: 299, oldPrice: 480, image: 'https://fakeimg.pl/200x280/?text=人文1', category: '人文社科'},
      {id: 22, title: '人類大歷史', author: '尤瓦爾．赫拉利', price: 320, oldPrice: 520, image: 'https://fakeimg.pl/200x280/?text=人文2', category: '人文社科'},
      {id: 23, title: '思辨與立場', author: '朱家安', price: 180, oldPrice: 320, image: 'https://fakeimg.pl/200x280/?text=人文3', category: '人文社科'},
      {id: 24, title: '正義：一場思辨之旅', author: '麥可．桑德爾', price: 210, oldPrice: 380, image: 'https://fakeimg.pl/200x280/?text=人文4', category: '人文社科'},
      {id: 25, title: '社會心理學', author: '戴維．邁爾斯', price: 236, oldPrice: 329, image: 'https://fakeimg.pl/200x280/?text=人文5', category: '人文社科'},
      // 青少年
      {id: 26, title: '哈利波特：神秘的魔法石', author: 'J.K.羅琳', price: 299, oldPrice: 480, image: 'https://fakeimg.pl/200x280/?text=青少1', category: '青少年'},
      {id: 27, title: '小王子', author: '聖修伯里', price: 120, oldPrice: 220, image: 'https://fakeimg.pl/200x280/?text=青少2', category: '青少年'},
      {id: 28, title: '夏目友人帳', author: '綠川幸', price: 180, oldPrice: 320, image: 'https://fakeimg.pl/200x280/?text=青少3', category: '青少年'},
      {id: 29, title: '解憂雜貨店', author: '東野圭吾', price: 210, oldPrice: 380, image: 'https://fakeimg.pl/200x280/?text=青少4', category: '青少年'},
      {id: 30, title: '偷書賊', author: '馬克斯．朱薩克', price: 236, oldPrice: 329, image: 'https://fakeimg.pl/200x280/?text=青少5', category: '青少年'},
      // 漫畫輕小說
      {id: 31, title: '鬼滅之刃 1', author: '吾峠呼世晴', price: 99, oldPrice: 150, image: 'https://fakeimg.pl/200x280/?text=漫畫1', category: '漫畫輕小說'},
      {id: 32, title: '進擊的巨人 1', author: '諫山創', price: 99, oldPrice: 150, image: 'https://fakeimg.pl/200x280/?text=漫畫2', category: '漫畫輕小說'},
      {id: 33, title: '刀劍神域 1', author: '川原礫', price: 180, oldPrice: 320, image: 'https://fakeimg.pl/200x280/?text=漫畫3', category: '漫畫輕小說'},
      {id: 34, title: '名偵探柯南 1', author: '青山剛昌', price: 99, oldPrice: 150, image: 'https://fakeimg.pl/200x280/?text=漫畫4', category: '漫畫輕小說'},
      {id: 35, title: 'Re:從零開始的異世界生活 1', author: '長月達平', price: 180, oldPrice: 320, image: 'https://fakeimg.pl/200x280/?text=漫畫5', category: '漫畫輕小說'},
    ];

    const categories = [
      '文學小說', '商業理財', '心理勵志', '生活風格', '人文社科', '青少年', '漫畫輕小說'
    ];

    // 書卡渲染
    function renderBookCards(bookArr) {
      const bookList = document.getElementById('book-list');
      bookList.innerHTML = '';
      // 分類對應顏色
      const categoryColors = {
        '文學小說': 'bg-primary',
        '商業理財': 'bg-success',
        '心理勵志': 'bg-warning text-dark',
        '生活風格': 'bg-info text-dark',
        '人文社科': 'bg-danger',
        '青少年': 'bg-dark',
        '漫畫輕小說': 'bg-warning'
      };
      bookArr.forEach(book => {
        const col = document.createElement('div');
        col.className = 'col';
        const badgeClass = categoryColors[book.category] || 'bg-secondary';
        col.innerHTML = `
          <div class="card h-100 shadow-sm position-relative" data-category="${book.category}">
            <span class="badge ${badgeClass} position-absolute top-0 start-0 m-2">${book.category}</span>
            <button class="btn btn-light position-absolute top-0 end-0 m-2 p-1 border-0 bookmark-btn" title="加入收藏" style="z-index:2;">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-bookmark" viewBox="0 0 16 16">
                <path d="M2 2v13.5l6-3 6 3V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/>
              </svg>
            </button>
            <img src="${book.image}" class="card-img-top" alt="${book.title}">
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${book.title}</h5>
              <p class="card-text text-muted mb-1">${book.author}</p>
              <div class="mb-2"><span class="text-danger fw-bold">$${book.price}</span> <span class="text-secondary text-decoration-line-through small">$${book.oldPrice}</span></div>
              <button class="btn btn-outline-primary mt-auto w-100 add-cart-btn">加入購物車</button>
            </div>
          </div>
        `;
        // 綁定書籤 icon 與加入購物車按鈕事件
        setTimeout(() => {
          const btn = col.querySelector('.bookmark-btn');
          if (btn) {
            btn.onclick = function(e) {
              e.stopPropagation();
              let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
              if (!favs.some(f => f.id === book.id)) {
                favs.push(book);
                localStorage.setItem('favorites', JSON.stringify(favs));
                btn.disabled = true;
                btn.title = '已加入收藏';
                alert('已加入收藏！');
              } else {
                alert('已在收藏！');
              }
            };
            // 若已收藏則禁用
            let favs = JSON.parse(localStorage.getItem('favorites') || '[]');
            if (favs.some(f => f.id === book.id)) {
              btn.disabled = true;
              btn.title = '已加入收藏';
            }
          }
          // 綁定加入購物車按鈕
          const cartBtn = col.querySelector('.add-cart-btn');
          if (cartBtn) {
            cartBtn.onclick = function(e) {
              e.stopPropagation();
              let cart = JSON.parse(localStorage.getItem('cart_items') || '[]');
              const exist = cart.find(item => item.id === book.id);
              if (!exist) {
                cart.push({...book, quantity: 1});
              } else {
                exist.quantity += 1;
              }
              localStorage.setItem('cart_items', JSON.stringify(cart));
              alert('已加入購物車！');
            };
          }
        }, 0);
        bookList.appendChild(col);
      });
    }

    // 初始渲染全部
    renderBookCards(books);

    // 篩選功能（修正 selector 與 index.html 一致）
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const cat = this.dataset.category;
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        if (cat === '全部') {
          renderBookCards(books);
        } else {
          renderBookCards(books.filter(b => b.category === cat));
        }
      });
    });
  }
});
// 書籤（收藏）功能
let favorites = [];
const favoriteList = document.getElementById('favorite-list');
const exportFavoriteBtn = document.getElementById('export-favorite-btn');
const exportFavoriteResult = document.getElementById('export-favorite-result');

function renderBookList(books) {
  bookList.innerHTML = '';
  if (!books.length) {
    bookList.innerHTML = '<li>查無書籍</li>';
    return;
  }
  books.forEach((book, idx) => {
    const li = document.createElement('li');
    li.textContent = `${book.title} / ${book.author}`;
    if (book.image) {
      const img = document.createElement('img');
      img.src = book.image;
      img.alt = book.title;
      img.style.height = '40px';
      img.style.marginLeft = '1em';
      li.appendChild(img);
    }
    // 加入購物車按鈕
    const addBtn = document.createElement('button');
    addBtn.textContent = '加入購物車';
    addBtn.style.marginLeft = '1em';
    addBtn.onclick = () => addToCart(book);
    li.appendChild(addBtn);
    // 收藏快捷按鈕
    const favBtn = document.createElement('button');
    favBtn.textContent = favorites.some(f => f.title === book.title && f.author === book.author) ? '已收藏' : '收藏';
    favBtn.style.marginLeft = '0.5em';
    favBtn.disabled = favorites.some(f => f.title === book.title && f.author === book.author);
    favBtn.onclick = () => {
      favorites.push(book);
      renderFavorites();
      renderBookList(books);
    };
    li.appendChild(favBtn);
    bookList.appendChild(li);
  });
}

function renderFavorites() {
  favoriteList.innerHTML = '';
  if (!favorites.length) {
    favoriteList.innerHTML = '<li>尚無收藏</li>';
    return;
  }
  // 依書名排序
  const sorted = [...favorites].sort((a, b) => a.title.localeCompare(b.title, 'zh-Hant'));
  sorted.forEach((book, idx) => {
    const li = document.createElement('li');
    li.textContent = `${book.title} / ${book.author}`;
    // 移除收藏按鈕
    const removeBtn = document.createElement('button');
    removeBtn.textContent = '移除';
    removeBtn.style.marginLeft = '1em';
    removeBtn.onclick = () => {
      favorites = favorites.filter(f => !(f.title === book.title && f.author === book.author));
      renderFavorites();
      fetchBooks();
    };
    li.appendChild(removeBtn);
    favoriteList.appendChild(li);
  });
}

if (exportFavoriteBtn) {
  exportFavoriteBtn.onclick = () => {
    if (!favorites.length) {
      exportFavoriteResult.textContent = '尚無收藏可匯出';
      exportFavoriteResult.style.color = 'red';
      return;
    }
    // 匯出為 JSON 檔
    const data = JSON.stringify(favorites, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'favorites.json';
    a.click();
    URL.revokeObjectURL(url);
    exportFavoriteResult.textContent = '已匯出 favorites.json';
    exportFavoriteResult.style.color = 'green';
  };
}

renderFavorites();
// 檢舉流程（UI）
const reportForm = document.getElementById('report-form');
const reportResult = document.getElementById('report-result');

if (reportForm) {
  reportForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const id = parseInt(document.getElementById('report-comment-id').value, 10) - 1;
    const reason = document.getElementById('report-reason').value.trim();
    if (isNaN(id) || id < 0 || id >= comments.length) {
      reportResult.textContent = '留言編號錯誤';
      reportResult.style.color = 'red';
      return;
    }
    if (!reason) {
      reportResult.textContent = '請輸入檢舉原因';
      reportResult.style.color = 'red';
      return;
    }
    reportResult.textContent = `留言「${comments[id].user}：${comments[id].content}」已被檢舉，原因：${reason}`;
    reportResult.style.color = 'orange';
    reportForm.reset();
  });
}
// 留言區功能
let comments = [];
const commentList = document.getElementById('comment-list');
const addCommentForm = document.getElementById('add-comment-form');

function renderComments() {
  commentList.innerHTML = '';
  if (!comments.length) {
    commentList.innerHTML = '<li>暫無留言</li>';
    return;
  }
  comments.forEach((c, idx) => {
    const li = document.createElement('li');
    li.textContent = `${c.user}：${c.content}`;
    // 刪除按鈕
    const delBtn = document.createElement('button');
    delBtn.textContent = '刪除';
    delBtn.style.marginLeft = '1em';
    delBtn.onclick = () => {
      comments.splice(idx, 1);
      renderComments();
    };
    li.appendChild(delBtn);
    commentList.appendChild(li);
  });
}

if (addCommentForm) {
  addCommentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const user = document.getElementById('comment-user').value.trim();
    const content = document.getElementById('comment-content').value.trim();
    if (!user || !content) return;
    comments.push({ user, content });
    addCommentForm.reset();
    renderComments();
  });
}

renderComments();
// 訂單通知（UI）
function showOrderNotification(orderId) {
  if (window.Notification && Notification.permission === 'granted') {
    new Notification('訂單通知', { body: `您的訂單 ${orderId} 已成立！` });
  } else if (window.Notification && Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification('訂單通知', { body: `您的訂單 ${orderId} 已成立！` });
      }
    });
  } else {
    alert(`您的訂單 ${orderId} 已成立！`);
  }
}
// 付款整合（UI）
const paymentForm = document.getElementById('payment-form');
const paymentResult = document.getElementById('payment-result');

if (paymentForm) {
  paymentForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const orderId = document.getElementById('order-id').value.trim();
    const method = document.getElementById('payment-method').value;
    if (!orderId || !method) {
      paymentResult.textContent = '請輸入訂單編號並選擇付款方式';
      paymentResult.style.color = 'red';
      return;
    }
    // 模擬付款流程
    paymentResult.textContent = `訂單 ${orderId} 已以 ${method === 'credit' ? '信用卡' : method === 'linepay' ? 'Line Pay' : 'ATM 轉帳'} 完成付款（模擬）`;
    paymentResult.style.color = 'green';
    paymentForm.reset();
  });
}
const API_URL = 'http://localhost:5000/api/books';

// DOM 元素
const bookList = document.getElementById('book-list');
const addBookForm = document.getElementById('add-book-form');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');

// 取得書籍清單
async function fetchBooks(keyword = '') {
  let url = API_URL;
  if (keyword) {
    url += '?q=' + encodeURIComponent(keyword);
  }
  const res = await fetch(url);
  const books = await res.json();
  renderBookList(books);
}

// 渲染書籍清單
function renderBookList(books) {
  bookList.innerHTML = '';
  if (!books.length) {
    bookList.innerHTML = '<li>查無書籍</li>';
    return;
  }
  books.forEach(book => {
    const li = document.createElement('li');
    li.textContent = `${book.title} / ${book.author}`;
    if (book.image) {
      const img = document.createElement('img');
      img.src = book.image;
      img.alt = book.title;
      img.style.height = '40px';
      img.style.marginLeft = '1em';
      li.appendChild(img);
    }
    bookList.appendChild(li);
  });
}

// 新增書籍
addBookForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('book-title').value.trim();
  const author = document.getElementById('book-author').value.trim();
  const image = document.getElementById('book-image').value.trim();
  if (!title || !author) return;
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, author, image })
  });
  addBookForm.reset();
  fetchBooks();
});

// 搜尋書籍
searchBtn.addEventListener('click', () => {
  const keyword = searchInput.value.trim();
  fetchBooks(keyword);
});

// 頁面載入時取得書籍
fetchBooks();

// 全域錯誤處理（UI）
const globalErrorDiv = document.getElementById('global-error');
window.onerror = function(msg, src, line, col, err) {
  if (globalErrorDiv) {
    globalErrorDiv.style.display = '';
    globalErrorDiv.textContent = '⚠️ 錯誤：' + msg + (src ? `\n來源：${src}:${line}` : '');
    globalErrorDiv.style.background = '#ffeaea';
    globalErrorDiv.style.color = '#b30000';
    globalErrorDiv.style.padding = '1em';
    globalErrorDiv.style.margin = '1em 0';
    globalErrorDiv.style.border = '1px solid #b30000';
    globalErrorDiv.style.borderRadius = '6px';
    globalErrorDiv.style.fontWeight = 'bold';
  }
  return false; // 讓瀏覽器也顯示錯誤
};

// 會員註冊/登入/OAuth（UI）
const authSection = document.getElementById('auth-section');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const showLoginBtn = document.getElementById('show-login');
const showRegisterBtn = document.getElementById('show-register');
const authMessage = document.getElementById('auth-message');
const oauthGoogleBtn = document.getElementById('oauth-google');
const oauthFacebookBtn = document.getElementById('oauth-facebook');

let currentUser = null;

function showAuthMessage(msg, color = 'red') {
  authMessage.textContent = msg;
  authMessage.style.color = color;
}

if (showLoginBtn && showRegisterBtn && loginForm && registerForm) {
  showLoginBtn.onclick = () => {
    loginForm.style.display = '';
    registerForm.style.display = 'none';
    showLoginBtn.classList.add('active');
    showRegisterBtn.classList.remove('active');
    showAuthMessage('');
  };
  showRegisterBtn.onclick = () => {
    loginForm.style.display = 'none';
    registerForm.style.display = '';
    showLoginBtn.classList.remove('active');
    showRegisterBtn.classList.add('active');
    showAuthMessage('');
  };
}

if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
      showAuthMessage('請輸入 Email 與密碼');
      return;
    }
    // 模擬登入驗證
    const regUser = localStorage.getItem('user_' + email);
    if (!regUser) {
      showAuthMessage('查無此帳號，請先註冊');
      return;
    }
    const userObj = JSON.parse(regUser);
    if (userObj.password !== password) {
      showAuthMessage('密碼錯誤');
      return;
    }
    currentUser = { email };
    showAuthMessage('登入成功', 'green');
    loginForm.reset();
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;
    if (!email || !password || !confirm) {
      showAuthMessage('請完整填寫註冊資訊');
      return;
    }
    if (!/^[^@]+@[^@]+\.[^@]+$/.test(email)) {
      showAuthMessage('Email 格式錯誤');
      return;
    }
    if (password.length < 6) {
      showAuthMessage('密碼需至少 6 字元');
      return;
    }
    if (password !== confirm) {
      showAuthMessage('兩次密碼不一致');
      return;
    }
    if (localStorage.getItem('user_' + email)) {
      showAuthMessage('此 Email 已註冊，請直接登入');
      return;
    }
    localStorage.setItem('user_' + email, JSON.stringify({ email, password }));
    showAuthMessage('註冊成功，請登入', 'green');
    registerForm.reset();
    showLoginBtn.click();
  });
}

if (oauthGoogleBtn) {
  oauthGoogleBtn.onclick = () => {
    showAuthMessage('（僅 UI）Google OAuth 尚未串接', 'orange');
  };
}
if (oauthFacebookBtn) {
  oauthFacebookBtn.onclick = () => {
    showAuthMessage('（僅 UI）Facebook OAuth 尚未串接', 'orange');
  };
}

// 權限/角色管理（UI）
const roleSection = document.getElementById('role-section');
const currentRoleSpan = document.getElementById('current-role');
const switchRoleBtn = document.getElementById('switch-role-btn');

function getUserRole(email) {
  return localStorage.getItem('role_' + email) || '買家';
}
function setUserRole(email, role) {
  localStorage.setItem('role_' + email, role);
}
function updateRoleUI() {
  if (!currentUser || !currentUser.email) {
    roleSection.style.display = 'none';
    return;
  }
  roleSection.style.display = '';
  const role = getUserRole(currentUser.email);
  currentRoleSpan.textContent = role;
  switchRoleBtn.textContent = role === '買家' ? '切換為賣家' : '切換為買家';
}
if (switchRoleBtn) {
  switchRoleBtn.onclick = () => {
    if (!currentUser || !currentUser.email) return;
    const now = getUserRole(currentUser.email);
    const next = now === '買家' ? '賣家' : '買家';
    setUserRole(currentUser.email, next);
    updateRoleUI();
    showAuthMessage('角色已切換為 ' + next, 'green');
  };
}

// 登入後顯示角色管理
function afterLogin() {
  updateRoleUI();
}

// 登出時隱藏角色管理
function afterLogout() {
  roleSection.style.display = 'none';
}

// 修改登入流程，登入成功後呼叫 afterLogin
if (loginForm) {
  loginForm.addEventListener('submit', function(e) {
    // ...existing code...
    if (userObj.password !== password) {
      showAuthMessage('密碼錯誤');
      return;
    }
    currentUser = { email };
    showAuthMessage('登入成功', 'green');
    loginForm.reset();
    afterLogin();
  });
}

// 註冊後自動切換到登入畫面，角色管理會在登入時顯示
