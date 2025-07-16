# 權限/角色管理 (買家/賣家)
@app.route('/api/users/<email>/role', methods=['PATCH'])
def switch_role(email):
    db = get_db()
    data = request.json
    role = data.get('role')
    if role not in ['buyer', 'seller']:
        return jsonify({'error': '角色錯誤'}), 400
    db.execute('UPDATE user SET role=? WHERE email=?', (role, email))
    db.commit()
    return jsonify({'msg': '角色已更新', 'role': role})
# 收藏 / 取消收藏 API
@app.route('/api/favorites', methods=['GET'])
def get_favorites():
    db = get_db()
    user = request.args.get('user', '')
    sql = 'SELECT f.id, f.book_id, b.title, b.author, b.image, f.created_at FROM favorite f JOIN book b ON f.book_id = b.id WHERE 1=1'
    params = []
    if user:
        sql += ' AND f.user=?'
        params.append(user)
    sort = request.args.get('sort', 'created_at')
    order = request.args.get('order', 'desc')
    export = request.args.get('export', '')
    if sort in ['title', 'author', 'created_at']:
        sql += f' ORDER BY {sort} {order.upper() if order in ["asc", "desc"] else "DESC"}'
    else:
        sql += ' ORDER BY f.created_at DESC'
    rows = db.execute(sql, params).fetchall()
    favs = [dict(row) for row in rows]
    if export == 'json':
        from flask import Response
        import json
        return Response(json.dumps(favs, ensure_ascii=False, indent=2), mimetype='application/json', headers={"Content-Disposition": "attachment;filename=favorites.json"})
    return jsonify(favs)

@app.route('/api/favorites', methods=['POST'])
def add_favorite():
    db = get_db()
    data = request.json
    user = data.get('user', '').strip()
    book_id = data.get('book_id')
    if not user or not book_id:
        return jsonify({'error': '缺少欄位'}), 400
    try:
        db.execute('INSERT INTO favorite (user, book_id) VALUES (?, ?)', (user, book_id))
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': '已收藏過'}), 409
    return jsonify({'msg': '已加入收藏'}), 201

@app.route('/api/favorites/<int:fav_id>', methods=['DELETE'])
def delete_favorite(fav_id):
    db = get_db()
    db.execute('DELETE FROM favorite WHERE id=?', (fav_id,))
    db.commit()
    return jsonify({'msg': '已取消收藏'})
# 審查 / 檢舉流程（API）
@app.route('/api/comments/<int:comment_id>/report', methods=['PATCH'])
def report_comment(comment_id):
    db = get_db()
    db.execute('UPDATE comment SET status=? WHERE id=?', ('reported', comment_id))
    db.commit()
    return jsonify({'msg': '留言已檢舉'})
# 留言 API (CRUD & 分頁)
@app.route('/api/comments', methods=['GET'])
def get_comments():
    db = get_db()
    book_id = request.args.get('book_id')
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    sql = 'SELECT * FROM comment WHERE 1=1'
    params = []
    if book_id:
        sql += ' AND book_id=?'
        params.append(book_id)
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params += [per_page, (page-1)*per_page]
    rows = db.execute(sql, params).fetchall()
    comments = [dict(row) for row in rows]
    return jsonify(comments)

@app.route('/api/comments', methods=['POST'])
def add_comment():
    db = get_db()
    data = request.json
    book_id = data.get('book_id')
    user = data.get('user', '').strip()
    content = data.get('content', '').strip()
    if not book_id or not user or not content:
        return jsonify({'error': '缺少欄位'}), 400
    db.execute('INSERT INTO comment (book_id, user, content) VALUES (?, ?, ?)', (book_id, user, content))
    db.commit()
    return jsonify({'msg': '留言已新增'}), 201

@app.route('/api/comments/<int:comment_id>', methods=['DELETE'])
def delete_comment(comment_id):
    db = get_db()
    db.execute('DELETE FROM comment WHERE id=?', (comment_id,))
    db.commit()
    return jsonify({'msg': '留言已刪除'})
# 訂單通知 (Email / Push，API)
@app.route('/api/orders/<int:order_id>/notify', methods=['POST'])
def notify_order(order_id):
    # 寫入通知 log
    with open(os.path.join(os.path.dirname(__file__), 'order_notify.log'), 'a', encoding='utf-8') as f:
        f.write(f"order_id={order_id} notified at {datetime.datetime.now().isoformat()}\n")
    return jsonify({'msg': '已發送通知', 'order_id': order_id})
# 金流／第三方付款整合（API）
@app.route('/api/orders/<int:order_id>/pay', methods=['PATCH'])
def pay_order(order_id):
    db = get_db()
    db.execute('UPDATE "order" SET status=? WHERE id=?', ('paid', order_id))
    db.commit()
    return jsonify({'msg': '付款完成', 'order_id': order_id})
# 結帳 API (下單、庫存更新)
@app.route('/api/orders', methods=['POST'])
def create_order():
    db = get_db()
    data = request.json
    user = data.get('user', '')
    items = data.get('items', [])  # [{book_id, quantity, price}]
    if not items:
        return jsonify({'error': '訂單明細不得為空'}), 400
    # 檢查庫存
    for item in items:
        row = db.execute('SELECT stock FROM book WHERE id=?', (item['book_id'],)).fetchone()
        if not row or row['stock'] < item['quantity']:
            return jsonify({'error': f"書籍ID {item['book_id']} 庫存不足"}), 409
    # 建立訂單
    total = sum(item['price'] * item['quantity'] for item in items)
    cur = db.execute('INSERT INTO "order" (user, total) VALUES (?, ?)', (user, total))
    order_id = cur.lastrowid
    for item in items:
        db.execute('INSERT INTO order_item (order_id, book_id, quantity, price) VALUES (?, ?, ?, ?)',
                   (order_id, item['book_id'], item['quantity'], item['price']))
        db.execute('UPDATE book SET stock = stock - ? WHERE id=?', (item['quantity'], item['book_id']))
    db.commit()
    return jsonify({'msg': '訂單已成立', 'order_id': order_id})
import datetime
# 行為追蹤 API
@app.route('/api/track', methods=['POST'])
def track():
    data = request.json
    event = data.get('event', '')
    user = data.get('user', '')
    detail = data.get('detail', {})
    logline = f"{datetime.datetime.now().isoformat()}\t{user}\t{event}\t{detail}\n"
    with open(os.path.join(os.path.dirname(__file__), 'track.log'), 'a', encoding='utf-8') as f:
        f.write(logline)
    return jsonify({'msg': '已記錄'}), 201
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': '未選擇檔案'}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': '未選擇檔案'}), 400
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        save_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(save_path)
        # 模擬 CDN 回傳網址
        url = f'/uploads/{filename}'
        return jsonify({'url': url})
    return jsonify({'error': '檔案格式不支援'}), 400
@app.route('/api/books/<int:book_id>', methods=['PUT'])
def edit_book(book_id):
    data = request.json
    title = data.get('title', '').strip()
    author = data.get('author', '').strip()
    image = data.get('image', '').strip()
    if not title or not author:
        return jsonify({'error': '書名與作者為必填'}), 400
    db = get_db()
    try:
        db.execute('UPDATE book SET title=?, author=?, image=? WHERE id=?', (title, author, image, book_id))
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': '書名與作者重複'}), 409
    return jsonify({'msg': '書籍已更新', 'book': {'id': book_id, 'title': title, 'author': author, 'image': image}})

@app.route('/api/books/<int:book_id>', methods=['DELETE'])
def delete_book(book_id):
    db = get_db()
    db.execute('DELETE FROM book WHERE id=?', (book_id,))
    db.commit()
    return jsonify({'msg': '書籍已刪除', 'id': book_id})

from flask import Flask, jsonify, request, g
from flask_cors import CORS
import sqlite3
import os


app = Flask(__name__)
CORS(app)
DB_PATH = os.path.join(os.path.dirname(__file__), 'books.db')

def get_db():
    if 'db' not in g:
        g.db = sqlite3.connect(DB_PATH)
        g.db.row_factory = sqlite3.Row
    return g.db

@app.teardown_appcontext
def close_db(error):
    db = g.pop('db', None)
    if db is not None:
        db.close()

def init_db():
    db.execute('''
        CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'buyer',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
# 註冊 API
import hashlib
def hash_pw(pw):
    return hashlib.sha256(pw.encode()).hexdigest()

@app.route('/api/register', methods=['POST'])
def register():
    db = get_db()
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    if not email or not password:
        return jsonify({'error': 'Email/密碼必填'}), 400
    try:
        db.execute('INSERT INTO user (email, password) VALUES (?, ?)', (email, hash_pw(password)))
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Email 已註冊'}), 409
    return jsonify({'msg': '註冊成功'}), 201

# 登入 API
@app.route('/api/login', methods=['POST'])
def login():
    db = get_db()
    data = request.json
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    row = db.execute('SELECT * FROM user WHERE email=?', (email,)).fetchone()
    if not row or row['password'] != hash_pw(password):
        return jsonify({'error': '帳號或密碼錯誤'}), 401
    return jsonify({'msg': '登入成功', 'user': {'email': row['email'], 'role': row['role']}})
    db.execute('''
        CREATE TABLE IF NOT EXISTS favorite (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT,
            book_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user, book_id),
            FOREIGN KEY(book_id) REFERENCES book(id)
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS comment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER,
            user TEXT,
            content TEXT,
            status TEXT DEFAULT 'normal',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(book_id) REFERENCES book(id)
        )
    ''')
    db = get_db()
    db.execute('''
        CREATE TABLE IF NOT EXISTS book (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            image TEXT,
            stock INTEGER DEFAULT 10,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(title, author)
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS "order" (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT,
            total INTEGER,
            status TEXT DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    db.execute('''
        CREATE TABLE IF NOT EXISTS order_item (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            order_id INTEGER,
            book_id INTEGER,
            quantity INTEGER,
            price INTEGER,
            FOREIGN KEY(order_id) REFERENCES "order"(id),
            FOREIGN KEY(book_id) REFERENCES book(id)
        )
    ''')
    db.commit()




@app.before_first_request
def setup():
    init_db()



@app.route('/api/books', methods=['GET'])
def get_books():
    db = get_db()
    q = request.args.get('q', '').strip()
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    sql = 'SELECT id, title, author, image, created_at FROM book'
    params = []
    if q:
        sql += ' WHERE title LIKE ? OR author LIKE ?'
        params += [f'%{q}%', f'%{q}%']
    sql += ' ORDER BY created_at DESC'
    # 分頁
    sql += ' LIMIT ? OFFSET ?'
    params += [per_page, (page-1)*per_page]
    rows = db.execute(sql, params).fetchall()
    books = [dict(row) for row in rows]
    # 回傳總數
    count_sql = 'SELECT COUNT(*) FROM book'
    count_params = []
    if q:
        count_sql += ' WHERE title LIKE ? OR author LIKE ?'
        count_params += [f'%{q}%', f'%{q}%']
    total = db.execute(count_sql, count_params).fetchone()[0]
    return jsonify({'books': books, 'total': total, 'page': page, 'per_page': per_page})

@app.route('/api/books', methods=['POST'])
def add_book():
    data = request.json
    title = data.get('title', '').strip()
    author = data.get('author', '').strip()
    image = data.get('image', '').strip()
    if not title or not author:
        return jsonify({'error': '書名與作者為必填'}), 400
    db = get_db()
    try:
        db.execute('INSERT INTO book (title, author, image) VALUES (?, ?, ?)', (title, author, image))
        db.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': '書名與作者重複'}), 409
    return jsonify({'msg': '書籍已新增', 'book': {'title': title, 'author': author, 'image': image}}), 201

if __name__ == '__main__':
    app.run(debug=True)
