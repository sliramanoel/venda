#!/usr/bin/env python3
"""
NeuroVita Backend API Testing Suite
Tests all backend endpoints for the NeuroVita supplement store
"""

import requests
import json
import sys
from datetime import datetime

# Get backend URL from environment
BACKEND_URL = "https://pix-checkout-system.preview.emergentagent.com/api"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def log_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.END}")

def log_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.END}")

def log_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.END}")

def log_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.END}")

class NeuroVitaAPITest:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
        self.test_results = {
            'total': 0,
            'passed': 0,
            'failed': 0,
            'errors': []
        }
        self.created_order_id = None

    def make_request(self, method, endpoint, data=None, expected_status=200):
        """Make HTTP request and validate response"""
        url = f"{BACKEND_URL}{endpoint}"
        self.test_results['total'] += 1
        
        try:
            if method.upper() == 'GET':
                response = self.session.get(url)
            elif method.upper() == 'POST':
                response = self.session.post(url, json=data)
            elif method.upper() == 'PUT':
                response = self.session.put(url, json=data)
            elif method.upper() == 'PATCH':
                response = self.session.patch(url, json=data)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")

            if response.status_code == expected_status:
                self.test_results['passed'] += 1
                return response
            else:
                error_msg = f"Expected {expected_status}, got {response.status_code} for {method} {endpoint}"
                self.test_results['failed'] += 1
                self.test_results['errors'].append(error_msg)
                log_error(error_msg)
                if response.text:
                    log_error(f"Response: {response.text}")
                return None
                
        except Exception as e:
            error_msg = f"Request failed for {method} {endpoint}: {str(e)}"
            self.test_results['failed'] += 1
            self.test_results['errors'].append(error_msg)
            log_error(error_msg)
            return None

    def test_settings_api(self):
        """Test Settings API endpoints"""
        log_info("Testing Settings API...")
        
        # Test GET /api/settings
        log_info("Testing GET /api/settings")
        response = self.make_request('GET', '/settings')
        
        if response:
            data = response.json()
            required_fields = ['name', 'tagline', 'description', 'phone', 'email', 'instagram', 'paymentLink']
            
            for field in required_fields:
                if field not in data:
                    error_msg = f"Missing required field '{field}' in settings response"
                    self.test_results['errors'].append(error_msg)
                    log_error(error_msg)
                else:
                    log_success(f"Settings field '{field}' present: {data[field]}")
        
        # Test PUT /api/settings - Partial update
        log_info("Testing PUT /api/settings with partial update")
        update_data = {
            "name": "NeuroVita Teste",
            "tagline": "Memória Testada",
            "phone": "(11) 98888-7777"
        }
        
        response = self.make_request('PUT', '/settings', update_data)
        
        if response:
            data = response.json()
            if data.get('name') == update_data['name']:
                log_success(f"Settings name updated successfully: {data['name']}")
            else:
                log_error(f"Settings name not updated correctly. Expected: {update_data['name']}, Got: {data.get('name')}")
            
            if data.get('tagline') == update_data['tagline']:
                log_success(f"Settings tagline updated successfully: {data['tagline']}")
            else:
                log_error(f"Settings tagline not updated correctly. Expected: {update_data['tagline']}, Got: {data.get('tagline')}")

    def test_images_api(self):
        """Test Images API endpoints"""
        log_info("Testing Images API...")
        
        # Test GET /api/images
        log_info("Testing GET /api/images")
        response = self.make_request('GET', '/images')
        
        if response:
            data = response.json()
            required_fields = ['main', 'secondary', 'tertiary']
            
            for field in required_fields:
                if field not in data:
                    error_msg = f"Missing required field '{field}' in images response"
                    self.test_results['errors'].append(error_msg)
                    log_error(error_msg)
                else:
                    log_success(f"Images field '{field}' present: {data[field][:50]}...")
        
        # Test PUT /api/images - Partial update
        log_info("Testing PUT /api/images with partial update")
        update_data = {
            "main": "https://example.com/test-main-image.jpg",
            "secondary": "https://example.com/test-secondary-image.jpg"
        }
        
        response = self.make_request('PUT', '/images', update_data)
        
        if response:
            data = response.json()
            if data.get('main') == update_data['main']:
                log_success(f"Images main URL updated successfully: {data['main']}")
            else:
                log_error(f"Images main URL not updated correctly. Expected: {update_data['main']}, Got: {data.get('main')}")

    def test_orders_api(self):
        """Test Orders API endpoints"""
        log_info("Testing Orders API...")
        
        # Test POST /api/orders - Create order with specified test data
        log_info("Testing POST /api/orders")
        order_data = {
            "name": "Teste Backend",
            "email": "teste@backend.com",
            "phone": "(11) 99999-8888",
            "cep": "01310-100",
            "address": "Avenida Teste",
            "number": "100",
            "complement": "",
            "neighborhood": "Centro",
            "city": "São Paulo",
            "state": "SP",
            "quantity": 2,
            "productPrice": 197.00,
            "shippingPrice": 20.00,
            "totalPrice": 217.00
        }
        
        response = self.make_request('POST', '/orders', order_data, 200)
        
        if response:
            data = response.json()
            self.created_order_id = data.get('_id')  # Backend returns _id, not id
            order_number = data.get('orderNumber')
            
            log_success(f"Order created successfully with ID: {self.created_order_id}")
            log_success(f"Order number: {order_number}")
            
            # Verify order data
            if data.get('name') == order_data['name']:
                log_success(f"Order name correct: {data['name']}")
            else:
                log_error(f"Order name incorrect. Expected: {order_data['name']}, Got: {data.get('name')}")
                
            if data.get('email') == order_data['email']:
                log_success(f"Order email correct: {data['email']}")
            else:
                log_error(f"Order email incorrect. Expected: {order_data['email']}, Got: {data.get('email')}")
            
            if data.get('totalPrice') == order_data['totalPrice']:
                log_success(f"Order total price correct: {data['totalPrice']}")
            else:
                log_error(f"Order total price incorrect. Expected: {order_data['totalPrice']}, Got: {data.get('totalPrice')}")
            
            if data.get('status') == 'pending':
                log_success(f"Order status correct: {data['status']}")
            else:
                log_error(f"Order status incorrect. Expected: pending, Got: {data.get('status')}")
        
        # Test GET /api/orders - List orders
        log_info("Testing GET /api/orders")
        response = self.make_request('GET', '/orders')
        
        if response:
            data = response.json()
            if isinstance(data, list):
                log_success(f"Orders list retrieved successfully. Count: {len(data)}")
                
                if len(data) > 0:
                    first_order = data[0]
                    required_fields = ['_id', 'orderNumber', 'name', 'email', 'status', 'createdAt']  # Backend uses _id
                    
                    for field in required_fields:
                        if field not in first_order:
                            error_msg = f"Missing required field '{field}' in order response"
                            self.test_results['errors'].append(error_msg)
                            log_error(error_msg)
                        else:
                            log_success(f"Order field '{field}' present")
            else:
                log_error("Orders response is not a list")
        
        # Test GET /api/orders/{id} - Get specific order
        if self.created_order_id:
            log_info(f"Testing GET /api/orders/{self.created_order_id}")
            response = self.make_request('GET', f'/orders/{self.created_order_id}')
            
            if response:
                data = response.json()
                if data.get('_id') == self.created_order_id:  # Backend returns _id
                    log_success(f"Order retrieved by ID successfully: {data['_id']}")
                else:
                    log_error(f"Order ID mismatch. Expected: {self.created_order_id}, Got: {data.get('_id')}")
        
        # Test PATCH /api/orders/{id}/status - Update order status
        if self.created_order_id:
            log_info(f"Testing PATCH /api/orders/{self.created_order_id}/status")
            status_update = {"status": "paid"}
            
            response = self.make_request('PATCH', f'/orders/{self.created_order_id}/status', status_update)
            
            if response:
                data = response.json()
                if data.get('status') == 'paid':
                    log_success(f"Order status updated successfully: {data['status']}")
                else:
                    log_error(f"Order status not updated correctly. Expected: paid, Got: {data.get('status')}")
            
            # Test other status updates
            for status in ['shipped', 'delivered']:
                log_info(f"Testing status update to: {status}")
                status_update = {"status": status}
                response = self.make_request('PATCH', f'/orders/{self.created_order_id}/status', status_update)
                
                if response:
                    data = response.json()
                    if data.get('status') == status:
                        log_success(f"Order status updated to {status} successfully")
                    else:
                        log_error(f"Order status not updated to {status} correctly")

    def test_invalid_endpoints(self):
        """Test invalid endpoints return 404"""
        log_info("Testing invalid endpoints...")
        
        # Test 404 endpoints (should fail and we expect them to fail)
        invalid_endpoints = [
            ('/nonexistent', 404),
            ('/orders/invalid-id', 404),
            ('/settings/nonexistent', 404)
        ]
        
        for endpoint, expected_status in invalid_endpoints:
            url = f"{BACKEND_URL}{endpoint}"
            try:
                response = self.session.get(url)
                if response.status_code == expected_status:
                    log_success(f"Invalid endpoint {endpoint} correctly returned {expected_status}")
                else:
                    log_error(f"Invalid endpoint {endpoint} returned {response.status_code}, expected {expected_status}")
            except Exception as e:
                log_error(f"Error testing invalid endpoint {endpoint}: {str(e)}")
                
        # Test invalid order status update 
        log_info("Testing invalid order status...")
        invalid_status_data = {"status": "invalid_status"}
        response = self.session.patch(f"{BACKEND_URL}/orders/507f1f77bcf86cd799439011/status", 
                                    json=invalid_status_data)
        if response.status_code == 422:  # Validation error expected
            log_success("Invalid status correctly rejected with 422")
        else:
            log_warning(f"Invalid status returned {response.status_code}, expected 422")

    def run_all_tests(self):
        """Run all API tests"""
        log_info("🚀 Starting NeuroVita Backend API Tests")
        log_info(f"Testing backend at: {BACKEND_URL}")
        print("=" * 60)
        
        try:
            # Test all API endpoints
            self.test_settings_api()
            print()
            
            self.test_images_api()
            print()
            
            self.test_orders_api()
            print()
            
            self.test_invalid_endpoints()
            print()
            
            # Print final results
            self.print_results()
            
        except KeyboardInterrupt:
            log_warning("Tests interrupted by user")
            self.print_results()
        except Exception as e:
            log_error(f"Test suite failed with error: {str(e)}")
            self.print_results()

    def print_results(self):
        """Print test results summary"""
        print("=" * 60)
        log_info("🏁 Test Results Summary")
        print("=" * 60)
        
        total = self.test_results['total']
        passed = self.test_results['passed']
        failed = self.test_results['failed']
        
        print(f"Total Tests: {total}")
        print(f"{Colors.GREEN}Passed: {passed}{Colors.END}")
        print(f"{Colors.RED}Failed: {failed}{Colors.END}")
        
        if failed > 0:
            print(f"\n{Colors.RED}❌ ERRORS FOUND:{Colors.END}")
            for i, error in enumerate(self.test_results['errors'], 1):
                print(f"{i}. {error}")
        
        success_rate = (passed / total * 100) if total > 0 else 0
        print(f"\nSuccess Rate: {success_rate:.1f}%")
        
        if failed == 0:
            log_success("🎉 All tests passed! NeuroVita Backend APIs are working correctly.")
            return True
        else:
            log_error(f"❌ {failed} test(s) failed. Please check the errors above.")
            return False

if __name__ == "__main__":
    tester = NeuroVitaAPITest()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)