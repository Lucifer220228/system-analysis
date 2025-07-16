import requests
import time

def test_search_and_paging():
    url = 'http://localhost:5000/api/books'
    # 新增 15 本書
    for i in range(15):
        requests.post(url, json={
            'title': f'測試書{i}', 'author': f'作者{i%3}', 'image': ''
        })
    # 測試分頁
    r = requests.get(url, params={'page': 2, 'per_page': 5})
    assert r.status_code == 200
    data = r.json()
    assert data['page'] == 2
    assert len(data['books']) == 5
    # 測試搜尋
    r2 = requests.get(url, params={'q': '測試書1'})
    assert r2.status_code == 200
    data2 = r2.json()
    assert any('測試書1' in b['title'] for b in data2['books'])

def test_track():
    url = 'http://localhost:5000/api/track'
    r = requests.post(url, json={
        'event': 'search', 'user': 'testuser', 'detail': {'q': 'abc'}})
    assert r.status_code == 201
    print('track ok')

if __name__ == '__main__':
    test_search_and_paging()
    test_track()
    print('done')
