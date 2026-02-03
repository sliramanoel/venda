"""
Backend API Tests for NeuroVita Whitelabel CMS
Tests: Settings API, Images API, Orders API
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestSettingsAPI:
    """Tests for /api/settings endpoints"""
    
    def test_get_settings(self):
        """GET /api/settings - Should return site settings"""
        response = requests.get(f"{BASE_URL}/api/settings")
        assert response.status_code == 200
        
        data = response.json()
        # Verify required fields exist
        assert "siteName" in data
        assert "productName" in data
        assert "benefits" in data
        assert "testimonials" in data
        assert "faq" in data
        assert "hero" in data
        assert "productOptions" in data
        
        # Verify data types
        assert isinstance(data["siteName"], str)
        assert isinstance(data["benefits"], list)
        assert isinstance(data["testimonials"], list)
        assert isinstance(data["productOptions"], list)
        
    def test_update_settings_sitename(self):
        """PUT /api/settings - Update site name"""
        # First get current settings
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original_data = get_response.json()
        original_name = original_data.get("siteName")
        
        # Update site name
        test_name = "TEST_NeuroVita_CMS"
        update_response = requests.put(f"{BASE_URL}/api/settings", json={
            "siteName": test_name
        })
        assert update_response.status_code == 200
        
        updated_data = update_response.json()
        assert updated_data["siteName"] == test_name
        
        # Verify persistence with GET
        verify_response = requests.get(f"{BASE_URL}/api/settings")
        assert verify_response.status_code == 200
        verify_data = verify_response.json()
        assert verify_data["siteName"] == test_name
        
        # Restore original name
        requests.put(f"{BASE_URL}/api/settings", json={
            "siteName": original_name or "NeuroVita"
        })
        
    def test_update_settings_product_name(self):
        """PUT /api/settings - Update product name"""
        # Get current settings
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original_data = get_response.json()
        original_product_name = original_data.get("productName")
        
        # Update product name
        test_product_name = "TEST_SuperVita"
        update_response = requests.put(f"{BASE_URL}/api/settings", json={
            "productName": test_product_name
        })
        assert update_response.status_code == 200
        
        updated_data = update_response.json()
        assert updated_data["productName"] == test_product_name
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/settings")
        verify_data = verify_response.json()
        assert verify_data["productName"] == test_product_name
        
        # Restore original
        requests.put(f"{BASE_URL}/api/settings", json={
            "productName": original_product_name or "NeuroVita"
        })

    def test_update_settings_hero_section(self):
        """PUT /api/settings - Update hero section"""
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original_data = get_response.json()
        original_hero = original_data.get("hero")
        
        test_hero = {
            "badge": "TEST_Badge",
            "title": "TEST_Title",
            "subtitle": "TEST_Subtitle",
            "ctaText": "TEST_CTA"
        }
        
        update_response = requests.put(f"{BASE_URL}/api/settings", json={
            "hero": test_hero
        })
        assert update_response.status_code == 200
        
        updated_data = update_response.json()
        assert updated_data["hero"]["badge"] == test_hero["badge"]
        assert updated_data["hero"]["title"] == test_hero["title"]
        
        # Restore original
        if original_hero:
            requests.put(f"{BASE_URL}/api/settings", json={
                "hero": original_hero
            })
        
    def test_update_settings_benefits(self):
        """PUT /api/settings - Update benefits array"""
        get_response = requests.get(f"{BASE_URL}/api/settings")
        original_data = get_response.json()
        original_benefits = original_data.get("benefits")
        
        test_benefits = [
            {"icon": "Star", "title": "TEST_Benefit_1", "description": "Test description 1"},
            {"icon": "Brain", "title": "TEST_Benefit_2", "description": "Test description 2"}
        ]
        
        update_response = requests.put(f"{BASE_URL}/api/settings", json={
            "benefits": test_benefits
        })
        assert update_response.status_code == 200
        
        updated_data = update_response.json()
        assert len(updated_data["benefits"]) == 2
        assert updated_data["benefits"][0]["title"] == "TEST_Benefit_1"
        
        # Restore original
        if original_benefits:
            requests.put(f"{BASE_URL}/api/settings", json={
                "benefits": original_benefits
            })


class TestImagesAPI:
    """Tests for /api/images endpoints"""
    
    def test_get_images(self):
        """GET /api/images - Should return product images"""
        response = requests.get(f"{BASE_URL}/api/images")
        assert response.status_code == 200
        
        data = response.json()
        # Verify required fields
        assert "main" in data
        assert "secondary" in data
        assert "tertiary" in data
        assert "_id" in data
        
        # Verify data types
        assert isinstance(data["main"], str)
        assert isinstance(data["secondary"], str)
        
    def test_update_images(self):
        """PUT /api/images - Update product images"""
        # Get current images
        get_response = requests.get(f"{BASE_URL}/api/images")
        original_data = get_response.json()
        original_main = original_data.get("main")
        
        # Update main image
        test_image_url = "https://example.com/test-image.jpg"
        update_response = requests.put(f"{BASE_URL}/api/images", json={
            "main": test_image_url
        })
        assert update_response.status_code == 200
        
        updated_data = update_response.json()
        assert updated_data["main"] == test_image_url
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/images")
        verify_data = verify_response.json()
        assert verify_data["main"] == test_image_url
        
        # Restore original
        requests.put(f"{BASE_URL}/api/images", json={
            "main": original_main
        })


class TestOrdersAPI:
    """Tests for /api/orders endpoints"""
    
    def test_list_orders(self):
        """GET /api/orders - Should return orders list"""
        response = requests.get(f"{BASE_URL}/api/orders")
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        
        # If there are orders, verify structure
        if len(data) > 0:
            order = data[0]
            assert "orderNumber" in order
            assert "name" in order
            assert "email" in order
            assert "status" in order
            assert "totalPrice" in order
            
    def test_create_order(self):
        """POST /api/orders - Create a new order"""
        order_data = {
            "name": "TEST_Order_User",
            "email": "test_order@example.com",
            "phone": "(11) 99999-0000",
            "cep": "01310-100",
            "address": "Avenida Teste",
            "number": "999",
            "complement": "",
            "neighborhood": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "quantity": 1,
            "productPrice": 0,
            "shippingPrice": 20.00,
            "totalPrice": 20.00
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        
        created_order = response.json()
        assert "orderNumber" in created_order
        assert created_order["name"] == order_data["name"]
        assert created_order["email"] == order_data["email"]
        assert created_order["status"] == "pending"
        assert created_order["totalPrice"] == order_data["totalPrice"]
        
        # Store order_id for subsequent tests
        order_id = created_order["_id"]
        
        # Verify order exists in list
        list_response = requests.get(f"{BASE_URL}/api/orders")
        orders = list_response.json()
        order_ids = [o["_id"] for o in orders]
        assert order_id in order_ids
        
    def test_get_single_order(self):
        """GET /api/orders/{id} - Get a specific order"""
        # First create an order
        order_data = {
            "name": "TEST_Get_Order",
            "email": "test_get@example.com",
            "phone": "(11) 99999-1111",
            "cep": "01310-100",
            "address": "Avenida Teste",
            "number": "100",
            "complement": "",
            "neighborhood": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "quantity": 1,
            "productPrice": 0,
            "shippingPrice": 18.00,
            "totalPrice": 18.00
        }
        
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert create_response.status_code == 200
        created_order = create_response.json()
        order_id = created_order["_id"]
        
        # Get the specific order
        get_response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        assert get_response.status_code == 200
        
        fetched_order = get_response.json()
        assert fetched_order["_id"] == order_id
        assert fetched_order["name"] == order_data["name"]
        assert fetched_order["email"] == order_data["email"]
        
    def test_update_order_status(self):
        """PATCH /api/orders/{id}/status - Update order status"""
        # First create an order
        order_data = {
            "name": "TEST_Status_Order",
            "email": "test_status@example.com",
            "phone": "(11) 99999-2222",
            "cep": "01310-100",
            "address": "Avenida Teste",
            "number": "200",
            "complement": "",
            "neighborhood": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "quantity": 1,
            "productPrice": 0,
            "shippingPrice": 19.00,
            "totalPrice": 19.00
        }
        
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert create_response.status_code == 200
        created_order = create_response.json()
        order_id = created_order["_id"]
        
        # Update status to paid
        status_response = requests.patch(f"{BASE_URL}/api/orders/{order_id}/status", json={
            "status": "paid"
        })
        assert status_response.status_code == 200
        
        updated_order = status_response.json()
        assert updated_order["status"] == "paid"
        
        # Verify persistence
        verify_response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        verify_order = verify_response.json()
        assert verify_order["status"] == "paid"
        
    def test_get_nonexistent_order(self):
        """GET /api/orders/{id} - Should return 404 for non-existent order"""
        fake_id = "000000000000000000000000"
        response = requests.get(f"{BASE_URL}/api/orders/{fake_id}")
        assert response.status_code == 404


class TestResetEndpoints:
    """Tests for reset endpoints (settings and images)"""
    
    def test_reset_settings(self):
        """POST /api/settings/reset - Reset settings to default"""
        response = requests.post(f"{BASE_URL}/api/settings/reset")
        assert response.status_code == 200
        
        data = response.json()
        # Verify default values
        assert data["siteName"] == "NeuroVita"
        assert data["productName"] == "NeuroVita"
        assert len(data["benefits"]) == 4  # Default has 4 benefits
        
    def test_reset_images(self):
        """POST /api/images/reset - Reset images to default"""
        response = requests.post(f"{BASE_URL}/api/images/reset")
        assert response.status_code == 200
        
        data = response.json()
        # Verify images are reset to default URLs
        assert "main" in data
        assert data["main"] != ""


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
