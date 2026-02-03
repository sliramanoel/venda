"""
Backend API Tests for P1 (Webhook/Payment) and P2 (Image Upload) Features
Tests: Webhook endpoints, Payment simulation, Image upload API
"""
import pytest
import requests
import os
import tempfile
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestWebhookEndpoints:
    """Tests for P1: Webhook/Payment simulation endpoints"""
    
    def test_webhook_test_endpoint(self):
        """GET /api/webhooks/orionpay/test - Should return OK status"""
        response = requests.get(f"{BASE_URL}/api/webhooks/orionpay/test")
        assert response.status_code == 200
        
        data = response.json()
        assert data["status"] == "ok"
        assert "message" in data
        print(f"Webhook test endpoint: {data}")
    
    def test_create_order_for_payment_simulation(self):
        """Create a test order for payment simulation"""
        order_data = {
            "name": "TEST_Payment_Simulation",
            "email": "test_payment@example.com",
            "phone": "(11) 99999-3333",
            "cep": "01310-100",
            "address": "Avenida Paulista",
            "number": "1000",
            "complement": "Sala 100",
            "neighborhood": "Bela Vista",
            "city": "São Paulo",
            "state": "SP",
            "quantity": 1,
            "productPrice": 0,
            "shippingPrice": 25.00,
            "totalPrice": 25.00
        }
        
        response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert response.status_code == 200
        
        created_order = response.json()
        assert "orderNumber" in created_order
        assert created_order["status"] == "pending"
        print(f"Created order: {created_order['orderNumber']} with ID: {created_order['_id']}")
        
        # Store order ID for subsequent test
        return created_order["_id"]
    
    def test_simulate_payment(self):
        """POST /api/webhooks/orionpay/simulate-payment - Simulate payment for an order"""
        # First, create an order
        order_data = {
            "name": "TEST_Simulate_Payment",
            "email": "test_simulate@example.com",
            "phone": "(11) 99999-4444",
            "cep": "01310-100",
            "address": "Avenida Paulista",
            "number": "2000",
            "complement": "",
            "neighborhood": "Bela Vista",
            "city": "São Paulo",
            "state": "SP",
            "quantity": 2,
            "productPrice": 0,
            "shippingPrice": 30.00,
            "totalPrice": 30.00
        }
        
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert create_response.status_code == 200
        created_order = create_response.json()
        order_id = created_order["_id"]
        
        print(f"Created order with ID: {order_id}, status: {created_order['status']}")
        
        # Verify initial status is pending
        assert created_order["status"] == "pending"
        
        # Simulate payment
        simulate_response = requests.post(f"{BASE_URL}/api/webhooks/orionpay/simulate-payment?order_id={order_id}")
        assert simulate_response.status_code == 200
        
        simulate_data = simulate_response.json()
        assert simulate_data["success"] == True
        assert simulate_data["status"] == "paid"
        print(f"Payment simulation result: {simulate_data}")
        
        # Verify order status changed to paid
        get_response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        assert get_response.status_code == 200
        
        updated_order = get_response.json()
        assert updated_order["status"] == "paid"
        # Note: paidAt and paymentData are stored in DB but not exposed in API response model
        # The status change from "pending" to "paid" confirms the payment simulation worked
        print(f"Order status after simulation: {updated_order['status']}")
    
    def test_simulate_payment_already_paid(self):
        """Test simulating payment for an already paid order"""
        # Create order
        order_data = {
            "name": "TEST_Already_Paid",
            "email": "test_already_paid@example.com",
            "phone": "(11) 99999-5555",
            "cep": "01310-100",
            "address": "Rua Teste",
            "number": "100",
            "complement": "",
            "neighborhood": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "quantity": 1,
            "productPrice": 0,
            "shippingPrice": 15.00,
            "totalPrice": 15.00
        }
        
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        order_id = create_response.json()["_id"]
        
        # First payment simulation
        requests.post(f"{BASE_URL}/api/webhooks/orionpay/simulate-payment?order_id={order_id}")
        
        # Second payment simulation (should handle gracefully)
        second_response = requests.post(f"{BASE_URL}/api/webhooks/orionpay/simulate-payment?order_id={order_id}")
        assert second_response.status_code == 200
        
        second_data = second_response.json()
        assert second_data["success"] == True
        assert "já está pago" in second_data.get("message", "") or second_data["status"] == "paid"
        print(f"Double payment simulation result: {second_data}")
    
    def test_simulate_payment_invalid_order(self):
        """Test simulating payment for a non-existent order"""
        fake_id = "000000000000000000000000"
        response = requests.post(f"{BASE_URL}/api/webhooks/orionpay/simulate-payment?order_id={fake_id}")
        assert response.status_code == 404
        print("Invalid order correctly returns 404")
    
    def test_webhook_endpoint_post(self):
        """POST /api/webhooks/orionpay - Test webhook receiving payment.success event"""
        # Create an order first
        order_data = {
            "name": "TEST_Webhook_Order",
            "email": "test_webhook_order@example.com",
            "phone": "(11) 99999-6666",
            "cep": "01310-100",
            "address": "Avenida Brasil",
            "number": "500",
            "complement": "",
            "neighborhood": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "quantity": 1,
            "productPrice": 0,
            "shippingPrice": 20.00,
            "totalPrice": 20.00
        }
        
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        created_order = create_response.json()
        
        # Send webhook payload
        webhook_payload = {
            "event": "payment.success",
            "data": {
                "transactionId": "TXN_TEST_001",
                "buyerEmail": "test_webhook_order@example.com",
                "amount": 20.00,
                "status": "paid"
            }
        }
        
        webhook_response = requests.post(
            f"{BASE_URL}/api/webhooks/orionpay",
            json=webhook_payload
        )
        assert webhook_response.status_code == 200
        
        webhook_result = webhook_response.json()
        assert webhook_result["received"] == True
        assert webhook_result["event"] == "payment.success"
        print(f"Webhook received correctly: {webhook_result}")


class TestImageUploadEndpoints:
    """Tests for P2: Image Upload endpoints"""
    
    def test_list_uploaded_images(self):
        """GET /api/uploads/list - List all uploaded images"""
        response = requests.get(f"{BASE_URL}/api/uploads/list")
        assert response.status_code == 200
        
        data = response.json()
        assert "images" in data
        assert "count" in data
        assert isinstance(data["images"], list)
        assert isinstance(data["count"], int)
        print(f"Images list: {data['count']} images found")
    
    def test_upload_png_image(self):
        """POST /api/uploads/image - Upload a PNG image"""
        # Create a minimal valid PNG file
        # PNG header + minimal data
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  # PNG signature
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,  # IHDR chunk
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,  # 1x1 pixel
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,  # bit depth, color type
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,  # IDAT chunk
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,  # compressed data
            0x02, 0x00, 0x01, 0x00, 0x01, 0xEB, 0x67, 0xD0,  
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,  # IEND chunk
            0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {'file': ('test_image.png', png_data, 'image/png')}
        response = requests.post(f"{BASE_URL}/api/uploads/image", files=files)
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert "filename" in data
        assert "url" in data
        assert "size" in data
        assert data["filename"].endswith(".png")
        print(f"PNG upload successful: {data['filename']}, URL: {data['url']}")
        
        # Store filename for retrieval test
        return data["filename"]
    
    def test_upload_jpg_image(self):
        """POST /api/uploads/image - Upload a JPG image"""
        # Create a minimal valid JPEG file
        jpg_data = bytes([
            0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46,  # JPEG SOI and APP0
            0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01,  # JFIF marker
            0x00, 0x01, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,  # DQT
            0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
            0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C,
            0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
            0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D,
            0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
            0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
            0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
            0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34,
            0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x01,  # SOF
            0x00, 0x01, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4,  # DHT
            0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
            0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
            0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF,
            0xC4, 0x00, 0xB5, 0x10, 0x00, 0x02, 0x01, 0x03,
            0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04,
            0x00, 0x00, 0x01, 0x7D, 0x01, 0x02, 0x03, 0x00,
            0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
            0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32,
            0x81, 0x91, 0xA1, 0x08, 0x23, 0x42, 0xB1, 0xC1,
            0x15, 0x52, 0xD1, 0xF0, 0x24, 0x33, 0x62, 0x72,
            0x82, 0x09, 0x0A, 0x16, 0x17, 0x18, 0x19, 0x1A,
            0x25, 0x26, 0x27, 0x28, 0x29, 0x2A, 0x34, 0x35,
            0x36, 0x37, 0x38, 0x39, 0x3A, 0x43, 0x44, 0x45,
            0x46, 0x47, 0x48, 0x49, 0x4A, 0x53, 0x54, 0x55,
            0x56, 0x57, 0x58, 0x59, 0x5A, 0x63, 0x64, 0x65,
            0x66, 0x67, 0x68, 0x69, 0x6A, 0x73, 0x74, 0x75,
            0x76, 0x77, 0x78, 0x79, 0x7A, 0x83, 0x84, 0x85,
            0x86, 0x87, 0x88, 0x89, 0x8A, 0x92, 0x93, 0x94,
            0x95, 0x96, 0x97, 0x98, 0x99, 0x9A, 0xA2, 0xA3,
            0xA4, 0xA5, 0xA6, 0xA7, 0xA8, 0xA9, 0xAA, 0xB2,
            0xB3, 0xB4, 0xB5, 0xB6, 0xB7, 0xB8, 0xB9, 0xBA,
            0xC2, 0xC3, 0xC4, 0xC5, 0xC6, 0xC7, 0xC8, 0xC9,
            0xCA, 0xD2, 0xD3, 0xD4, 0xD5, 0xD6, 0xD7, 0xD8,
            0xD9, 0xDA, 0xE1, 0xE2, 0xE3, 0xE4, 0xE5, 0xE6,
            0xE7, 0xE8, 0xE9, 0xEA, 0xF1, 0xF2, 0xF3, 0xF4,
            0xF5, 0xF6, 0xF7, 0xF8, 0xF9, 0xFA, 0xFF, 0xDA,  # SOS
            0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F, 0x00,
            0xFB, 0xD5, 0xDB, 0x00, 0x31, 0xC4, 0x1F, 0xFF,
            0xD9  # EOI
        ])
        
        files = {'file': ('test_image.jpg', jpg_data, 'image/jpeg')}
        response = requests.post(f"{BASE_URL}/api/uploads/image", files=files)
        
        assert response.status_code == 200
        
        data = response.json()
        assert data["success"] == True
        assert data["filename"].endswith(".jpg")
        print(f"JPG upload successful: {data['filename']}")
        
        return data["filename"]
    
    def test_upload_invalid_file_type(self):
        """POST /api/uploads/image - Should reject invalid file types"""
        txt_data = b"This is not an image"
        files = {'file': ('test.txt', txt_data, 'text/plain')}
        response = requests.post(f"{BASE_URL}/api/uploads/image", files=files)
        
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
        print(f"Invalid file type correctly rejected: {data['detail']}")
    
    def test_get_uploaded_image(self):
        """GET /api/uploads/images/{filename} - Retrieve an uploaded image"""
        # First upload an image
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
            0x02, 0x00, 0x01, 0x00, 0x01, 0xEB, 0x67, 0xD0,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
            0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {'file': ('retrieval_test.png', png_data, 'image/png')}
        upload_response = requests.post(f"{BASE_URL}/api/uploads/image", files=files)
        filename = upload_response.json()["filename"]
        
        # Retrieve the image
        get_response = requests.get(f"{BASE_URL}/api/uploads/images/{filename}")
        assert get_response.status_code == 200
        assert get_response.headers.get("content-type") == "image/png"
        assert len(get_response.content) > 0
        print(f"Image retrieval successful: {filename}")
    
    def test_get_nonexistent_image(self):
        """GET /api/uploads/images/{filename} - Should return 404 for non-existent image"""
        response = requests.get(f"{BASE_URL}/api/uploads/images/nonexistent_file.png")
        assert response.status_code == 404
        print("Non-existent image correctly returns 404")
    
    def test_delete_uploaded_image(self):
        """DELETE /api/uploads/images/{filename} - Delete an uploaded image"""
        # First upload an image
        png_data = bytes([
            0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
            0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
            0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
            0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
            0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
            0x54, 0x08, 0xD7, 0x63, 0xF8, 0x00, 0x00, 0x00,
            0x02, 0x00, 0x01, 0x00, 0x01, 0xEB, 0x67, 0xD0,
            0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44,
            0xAE, 0x42, 0x60, 0x82
        ])
        
        files = {'file': ('delete_test.png', png_data, 'image/png')}
        upload_response = requests.post(f"{BASE_URL}/api/uploads/image", files=files)
        filename = upload_response.json()["filename"]
        
        # Delete the image
        delete_response = requests.delete(f"{BASE_URL}/api/uploads/images/{filename}")
        assert delete_response.status_code == 200
        
        delete_data = delete_response.json()
        assert delete_data["success"] == True
        print(f"Image deletion successful: {filename}")
        
        # Verify deletion
        get_response = requests.get(f"{BASE_URL}/api/uploads/images/{filename}")
        assert get_response.status_code == 404
        print("Verified image no longer exists after deletion")


class TestPaymentIntegrationFlow:
    """End-to-end test for the payment simulation flow"""
    
    def test_complete_payment_flow(self):
        """Full flow: Create order -> Verify pending -> Simulate payment -> Verify paid"""
        # Step 1: Create order
        order_data = {
            "name": "TEST_Integration_Flow",
            "email": "test_integration@example.com",
            "phone": "(11) 99999-7777",
            "cep": "01310-100",
            "address": "Avenida Paulista",
            "number": "3000",
            "complement": "Andar 5",
            "neighborhood": "Bela Vista",
            "city": "São Paulo",
            "state": "SP",
            "quantity": 3,
            "productPrice": 0,
            "shippingPrice": 35.00,
            "totalPrice": 35.00
        }
        
        create_response = requests.post(f"{BASE_URL}/api/orders", json=order_data)
        assert create_response.status_code == 200
        
        created_order = create_response.json()
        order_id = created_order["_id"]
        order_number = created_order["orderNumber"]
        
        print(f"Step 1: Order created - {order_number}")
        
        # Step 2: Verify initial status is pending
        get_response = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        assert get_response.status_code == 200
        
        order_before = get_response.json()
        assert order_before["status"] == "pending"
        print(f"Step 2: Order status is pending: {order_before['status']}")
        
        # Step 3: Simulate payment
        simulate_response = requests.post(f"{BASE_URL}/api/webhooks/orionpay/simulate-payment?order_id={order_id}")
        assert simulate_response.status_code == 200
        
        simulate_data = simulate_response.json()
        assert simulate_data["success"] == True
        assert simulate_data["status"] == "paid"
        print(f"Step 3: Payment simulated - {simulate_data}")
        
        # Step 4: Verify status changed to paid
        get_response_after = requests.get(f"{BASE_URL}/api/orders/{order_id}")
        assert get_response_after.status_code == 200
        
        order_after = get_response_after.json()
        assert order_after["status"] == "paid"
        print(f"Step 4: Order status changed to paid: {order_after['status']}")
        
        # Step 5: Verify in orders list
        list_response = requests.get(f"{BASE_URL}/api/orders")
        orders = list_response.json()
        
        matching_order = next((o for o in orders if o["_id"] == order_id), None)
        assert matching_order is not None
        assert matching_order["status"] == "paid"
        print(f"Step 5: Order verified in list with status: {matching_order['status']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
