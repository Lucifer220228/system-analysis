import requests

def test_register_login_role():
    # 註冊
    rv = requests.post('http://localhost:5000/api/register', json={
        'email': 'testuser@example.com', 'password': 'abc12345'
    })
    assert rv.status_code == 201 or rv.status_code == 409
    # 登入
    rv2 = requests.post('http://localhost:5000/api/login', json={
        'email': 'testuser@example.com', 'password': 'abc12345'
    })
    assert rv2.status_code == 200
    # 切換角色
    rv3 = requests.patch('http://localhost:5000/api/users/testuser@example.com/role', json={
        'role': 'seller'
    })
    assert rv3.status_code == 200
    print('user flow ok')

if __name__ == '__main__':
    test_register_login_role()
    print('done')
