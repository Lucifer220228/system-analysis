import unittest
import tempfile
import os
from app import app, DB_PATH

class BookApiTestCase(unittest.TestCase):
    def setUp(self):
        self.db_fd, self.db_path = tempfile.mkstemp()
        app.config['TESTING'] = True
        app.config['DATABASE'] = self.db_path
        self.client = app.test_client()
        # 初始化資料庫
        with app.app_context():
            from app import init_db
            init_db()

    def tearDown(self):
        os.close(self.db_fd)
        os.unlink(self.db_path)

    def test_add_book(self):
        rv = self.client.post('/api/books', json={
            'title': '測試書', 'author': '作者A', 'image': ''
        })
        self.assertEqual(rv.status_code, 201)
        data = rv.get_json()
        self.assertIn('book', data)
        self.assertEqual(data['book']['title'], '測試書')

    def test_add_book_duplicate(self):
        self.client.post('/api/books', json={
            'title': '重複書', 'author': '作者B', 'image': ''
        })
        rv = self.client.post('/api/books', json={
            'title': '重複書', 'author': '作者B', 'image': ''
        })
        self.assertEqual(rv.status_code, 409)

    def test_edit_book(self):
        rv = self.client.post('/api/books', json={
            'title': '可編輯書', 'author': '作者C', 'image': ''
        })
        book_id = self.client.get('/api/books').get_json()[0]['id']
        rv2 = self.client.put(f'/api/books/{book_id}', json={
            'title': '已編輯書', 'author': '作者C', 'image': ''
        })
        self.assertEqual(rv2.status_code, 200)
        data = rv2.get_json()
        self.assertEqual(data['book']['title'], '已編輯書')

    def test_delete_book(self):
        self.client.post('/api/books', json={
            'title': '刪除書', 'author': '作者D', 'image': ''
        })
        book_id = self.client.get('/api/books').get_json()[0]['id']
        rv = self.client.delete(f'/api/books/{book_id}')
        self.assertEqual(rv.status_code, 200)
        # 確認已刪除
        rv2 = self.client.get('/api/books')
        self.assertNotIn('刪除書', str(rv2.data))

if __name__ == '__main__':
    unittest.main()
