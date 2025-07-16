import requests

def test_comment_flow():
    # 新增書籍
    book = requests.post('http://localhost:5000/api/books', json={
        'title': '留言測試書', 'author': '留言作者', 'image': ''
    }).json()['book']
    # 新增留言
    rv = requests.post('http://localhost:5000/api/comments', json={
        'book_id': 1, 'user': '留言者', 'content': '這是留言'
    })
    assert rv.status_code == 201
    # 取得留言
    comments = requests.get('http://localhost:5000/api/comments', params={'book_id': 1}).json()
    assert any('這是留言' in c['content'] for c in comments)
    comment_id = comments[0]['id']
    # 檢舉留言
    rv2 = requests.patch(f'http://localhost:5000/api/comments/{comment_id}/report')
    assert rv2.status_code == 200
    # 刪除留言
    rv3 = requests.delete(f'http://localhost:5000/api/comments/{comment_id}')
    assert rv3.status_code == 200
    print('comment flow ok')

if __name__ == '__main__':
    test_comment_flow()
    print('done')
