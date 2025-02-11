import pytest
import requests

BASE_URL = "http://127.0.0.1:5000"

test_item = {
    "name": "Test Shirt",
    "clothing_type": "top",
    "category": "shirt",
    "brand": "Zara",
    "size": "m",
    "image_url": "static/images/bottoms/00001.png"
}


def test_home():
    response = requests.get(f"{BASE_URL}/")
    assert response.status_code == 200
    assert response.json()["message"] == "Welcome to Magic Mirror Flask API"

def test_add_clothing_item():
    response = requests.post(f"{BASE_URL}/clothing-items",  json=test_item) 
    assert response.status_code == 201
    assert "item" in response.json()
    assert response.json()["item"]["name"] == "Test Shirt"

def test_get_clothing_item():
    response = requests.get(f"{BASE_URL}/clothing-items")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_delete_clothing_item():
    # First, add an item
    post_response = requests.post(f"{BASE_URL}/clothing-items", json=test_item)
    assert post_response.status_code == 201
    clothing_id = post_response.json()["item"]["id"]

    # Then, delete it
    delete_response = requests.delete(f"{BASE_URL}/clothing-items/{clothing_id}")
    assert delete_response.status_code == 200
    assert f"Clothing item {clothing_id} deleted successfully." in delete_response.json()["message"]


if __name__ == "__main__":
    pytest.main()