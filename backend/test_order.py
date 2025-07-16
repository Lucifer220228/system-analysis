import requests

def test_order_flow():
    # 新增書籍
    book = requests.post('http://localhost:5000/api/books', json={
        'title': '訂單測試書', 'author': '作者X', 'image': '', 'stock': 5
    }).json()['book']
    # 下單
    order = requests.post('http://localhost:5000/api/orders', json={
        'user': 'testuser',
        'items': [{
            'book_id': 1, 'quantity': 2, 'price': 100
        }]
    })
    assert order.status_code == 200 or order.status_code == 201
    order_id = order.json().get('order_id')
    # 付款
    pay = requests.patch(f'http://localhost:5000/api/orders/{order_id}/pay')
    assert pay.status_code == 200
    # 通知
    notify = requests.post(f'http://localhost:5000/api/orders/{order_id}/notify')
    assert notify.status_code == 200
    print('order flow ok')

if __name__ == '__main__':
    test_order_flow()
    print('done')
