#!/usr/bin/env python3
import requests
import json
import uuid
import time
from typing import Dict, Any, List, Optional

# Backend URL from frontend/.env
BACKEND_URL = "https://e74680c4-c58f-4dc2-becd-ade10a64fbb4.preview.emergentagent.com/api"

class BackendTester:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session_id = str(uuid.uuid4())
        self.created_product_ids = []
        self.created_user_ids = []
        self.test_results = {
            "status": {},
            "products": {},
            "cart": {},
            "users": {}
        }
        self.test_summary = {
            "total_tests": 0,
            "passed_tests": 0,
            "failed_tests": 0
        }

    def run_test(self, test_name: str, test_func, *args, **kwargs):
        """Run a test and record the result"""
        print(f"\n{'='*80}\nRunning test: {test_name}\n{'='*80}")
        self.test_summary["total_tests"] += 1
        
        try:
            result = test_func(*args, **kwargs)
            if result:
                print(f"✅ PASSED: {test_name}")
                self.test_summary["passed_tests"] += 1
                return True
            else:
                print(f"❌ FAILED: {test_name}")
                self.test_summary["failed_tests"] += 1
                return False
        except Exception as e:
            print(f"❌ ERROR: {test_name} - {str(e)}")
            self.test_summary["failed_tests"] += 1
            return False

    def print_summary(self):
        """Print a summary of all test results"""
        print(f"\n{'='*80}\nTEST SUMMARY\n{'='*80}")
        print(f"Total tests: {self.test_summary['total_tests']}")
        print(f"Passed tests: {self.test_summary['passed_tests']}")
        print(f"Failed tests: {self.test_summary['failed_tests']}")
        
        success_rate = (self.test_summary['passed_tests'] / self.test_summary['total_tests']) * 100 if self.test_summary['total_tests'] > 0 else 0
        print(f"Success rate: {success_rate:.2f}%")
        
        # Clean up any created resources
        self.cleanup()

    def cleanup(self):
        """Clean up any resources created during testing"""
        print("\nCleaning up resources...")
        
        # Delete created products
        for product_id in self.created_product_ids:
            try:
                requests.delete(f"{self.base_url}/products/{product_id}")
                print(f"Deleted product: {product_id}")
            except:
                pass
        
        # Clear cart
        try:
            requests.delete(f"{self.base_url}/cart/{self.session_id}")
            print(f"Cleared cart for session: {self.session_id}")
        except:
            pass

    # Status API Tests
    def test_root_endpoint(self) -> bool:
        """Test the root API endpoint"""
        response = requests.get(f"{self.base_url}/")
        self.test_results["status"]["root"] = response.json()
        
        return (response.status_code == 200 and 
                "message" in response.json() and 
                "version" in response.json())

    def test_status_endpoints(self) -> bool:
        """Test the status check endpoints"""
        # Create a status check
        create_data = {"client_name": "Backend Tester"}
        create_response = requests.post(f"{self.base_url}/status", json=create_data)
        
        if create_response.status_code != 200:
            print(f"Failed to create status check: {create_response.text}")
            return False
        
        # Get status checks
        get_response = requests.get(f"{self.base_url}/status")
        
        self.test_results["status"]["create"] = create_response.json()
        self.test_results["status"]["get"] = get_response.json()
        
        return (create_response.status_code == 200 and 
                get_response.status_code == 200 and 
                isinstance(get_response.json(), list))

    # Product API Tests
    def test_get_products(self) -> bool:
        """Test getting all products"""
        response = requests.get(f"{self.base_url}/products")
        
        if response.status_code != 200:
            print(f"Failed to get products: {response.text}")
            return False
            
        products = response.json()
        self.test_results["products"]["all"] = products
        
        # Verify we have the expected sample products
        expected_products = ["MacBook Pro M3", "iPhone 15 Pro", "AirPods Pro (2nd Gen)", "Apple Watch Series 9"]
        found_products = [p["name"] for p in products]
        
        for product in expected_products:
            if product not in found_products:
                print(f"Expected product not found: {product}")
                return False
                
        # Verify Vietnamese text in descriptions
        for product in products:
            if not any(c in product["description"] for c in "àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ"):
                print(f"Product description doesn't contain Vietnamese characters: {product['name']}")
                return False
        
        return True

    def test_product_filtering(self) -> bool:
        """Test product filtering by category, type, and featured status"""
        # Test category filter
        category_response = requests.get(f"{self.base_url}/products?category=Laptop")
        
        # Test product_type filter
        type_response = requests.get(f"{self.base_url}/products?product_type=phone")
        
        # Test featured filter
        featured_response = requests.get(f"{self.base_url}/products?featured=true")
        
        # Test combined filters
        combined_response = requests.get(f"{self.base_url}/products?category=Audio&featured=true")
        
        self.test_results["products"]["filter_category"] = category_response.json()
        self.test_results["products"]["filter_type"] = type_response.json()
        self.test_results["products"]["filter_featured"] = featured_response.json()
        self.test_results["products"]["filter_combined"] = combined_response.json()
        
        # Verify category filter
        if not all(p["category"] == "Laptop" for p in category_response.json()):
            print("Category filter failed")
            return False
            
        # Verify product_type filter
        if not all(p["product_type"] == "phone" for p in type_response.json()):
            print("Product type filter failed")
            return False
            
        # Verify featured filter
        if not all(p["featured"] for p in featured_response.json()):
            print("Featured filter failed")
            return False
            
        # Verify combined filter
        if not all(p["category"] == "Audio" and p["featured"] for p in combined_response.json()):
            print("Combined filter failed")
            return False
            
        return True

    def test_get_product_by_id(self) -> bool:
        """Test getting a specific product by ID"""
        # First get all products
        all_products = requests.get(f"{self.base_url}/products").json()
        
        if not all_products:
            print("No products found to test get_product_by_id")
            return False
            
        # Get the first product's ID
        product_id = all_products[0]["id"]
        
        # Get the specific product
        response = requests.get(f"{self.base_url}/products/{product_id}")
        
        if response.status_code != 200:
            print(f"Failed to get product by ID: {response.text}")
            return False
            
        product = response.json()
        self.test_results["products"]["by_id"] = product
        
        # Verify it's the same product
        return product["id"] == product_id and product["name"] == all_products[0]["name"]

    def test_create_product(self) -> bool:
        """Test creating a new product"""
        new_product = {
            "name": "Test Product",
            "description": "Sản phẩm thử nghiệm với văn bản tiếng Việt",
            "price": 1999000,
            "category": "Test",
            "product_type": "test_device",
            "colors": ["#FF0000", "#00FF00", "#0000FF"],
            "stock": 10,
            "featured": False
        }
        
        response = requests.post(f"{self.base_url}/products", json=new_product)
        
        if response.status_code != 200:
            print(f"Failed to create product: {response.text}")
            return False
            
        created_product = response.json()
        self.test_results["products"]["create"] = created_product
        
        # Save the ID for cleanup
        self.created_product_ids.append(created_product["id"])
        
        # Verify the product was created with the correct data
        for key, value in new_product.items():
            if created_product[key] != value:
                print(f"Created product has incorrect {key}: {created_product[key]} != {value}")
                return False
                
        return True

    def test_update_product(self) -> bool:
        """Test updating an existing product"""
        # First create a product to update
        new_product = {
            "name": "Product to Update",
            "description": "Sản phẩm cần cập nhật",
            "price": 2999000,
            "category": "Test",
            "product_type": "test_device",
            "colors": ["#FF0000"],
            "stock": 5,
            "featured": False
        }
        
        create_response = requests.post(f"{self.base_url}/products", json=new_product)
        
        if create_response.status_code != 200:
            print(f"Failed to create product for update test: {create_response.text}")
            return False
            
        product_id = create_response.json()["id"]
        self.created_product_ids.append(product_id)
        
        # Update the product
        update_data = {
            "name": "Updated Product",
            "description": "Sản phẩm đã được cập nhật",
            "price": 3999000,
            "colors": ["#FF0000", "#00FF00"]
        }
        
        update_response = requests.put(f"{self.base_url}/products/{product_id}", json=update_data)
        
        if update_response.status_code != 200:
            print(f"Failed to update product: {update_response.text}")
            return False
            
        updated_product = update_response.json()
        self.test_results["products"]["update"] = updated_product
        
        # Verify the product was updated correctly
        for key, value in update_data.items():
            if updated_product[key] != value:
                print(f"Updated product has incorrect {key}: {updated_product[key]} != {value}")
                return False
                
        # Verify other fields weren't changed
        if updated_product["category"] != new_product["category"]:
            print(f"Update changed category when it shouldn't have")
            return False
            
        return True

    def test_delete_product(self) -> bool:
        """Test deleting a product"""
        # First create a product to delete
        new_product = {
            "name": "Product to Delete",
            "description": "Sản phẩm cần xóa",
            "price": 999000,
            "category": "Test",
            "product_type": "test_device",
            "colors": ["#000000"],
            "stock": 1,
            "featured": False
        }
        
        create_response = requests.post(f"{self.base_url}/products", json=new_product)
        
        if create_response.status_code != 200:
            print(f"Failed to create product for delete test: {create_response.text}")
            return False
            
        product_id = create_response.json()["id"]
        
        # Delete the product
        delete_response = requests.delete(f"{self.base_url}/products/{product_id}")
        
        if delete_response.status_code != 200:
            print(f"Failed to delete product: {delete_response.text}")
            # Add back to cleanup list in case it wasn't actually deleted
            self.created_product_ids.append(product_id)
            return False
            
        self.test_results["products"]["delete"] = delete_response.json()
        
        # Verify the product was deleted
        get_response = requests.get(f"{self.base_url}/products/{product_id}")
        
        return get_response.status_code == 404

    # Cart API Tests
    def test_get_cart(self) -> bool:
        """Test getting a cart by session ID"""
        response = requests.get(f"{self.base_url}/cart/{self.session_id}")
        
        if response.status_code != 200:
            print(f"Failed to get cart: {response.text}")
            return False
            
        cart = response.json()
        self.test_results["cart"]["get"] = cart
        
        # Verify the cart has the correct session ID and is empty
        return (cart["session_id"] == self.session_id and 
                isinstance(cart["items"], list) and 
                len(cart["items"]) == 0)

    def test_add_to_cart(self) -> bool:
        """Test adding an item to the cart"""
        # First get all products
        all_products = requests.get(f"{self.base_url}/products").json()
        
        if not all_products:
            print("No products found to test add_to_cart")
            return False
            
        # Get the first product's ID and a color
        product = all_products[0]
        product_id = product["id"]
        color = product["colors"][0] if product["colors"] else "#000000"
        
        # Add the item to the cart
        item_data = {
            "product_id": product_id,
            "quantity": 2,
            "selected_color": color
        }
        
        response = requests.post(f"{self.base_url}/cart/{self.session_id}/items", json=item_data)
        
        if response.status_code != 200:
            print(f"Failed to add item to cart: {response.text}")
            return False
            
        result = response.json()
        self.test_results["cart"]["add"] = result
        
        # Verify the item was added correctly
        cart = result["cart"]
        
        if not cart["items"] or len(cart["items"]) == 0:
            print("Item was not added to cart")
            return False
            
        added_item = cart["items"][0]
        
        return (added_item["product_id"] == product_id and 
                added_item["quantity"] == 2 and 
                added_item["selected_color"] == color)

    def test_remove_from_cart(self) -> bool:
        """Test removing an item from the cart"""
        # First add an item to the cart
        all_products = requests.get(f"{self.base_url}/products").json()
        
        if not all_products:
            print("No products found to test remove_from_cart")
            return False
            
        product = all_products[0]
        product_id = product["id"]
        color = product["colors"][0] if product["colors"] else "#000000"
        
        item_data = {
            "product_id": product_id,
            "quantity": 1,
            "selected_color": color
        }
        
        add_response = requests.post(f"{self.base_url}/cart/{self.session_id}/items", json=item_data)
        
        if add_response.status_code != 200:
            print(f"Failed to add item to cart for remove test: {add_response.text}")
            return False
            
        # Get the item ID
        cart = add_response.json()["cart"]
        if not cart["items"] or len(cart["items"]) == 0:
            print("Item was not added to cart for remove test")
            return False
            
        item_id = cart["items"][0]["id"]
        
        # Remove the item
        remove_response = requests.delete(f"{self.base_url}/cart/{self.session_id}/items/{item_id}")
        
        if remove_response.status_code != 200:
            print(f"Failed to remove item from cart: {remove_response.text}")
            return False
            
        self.test_results["cart"]["remove"] = remove_response.json()
        
        # Verify the item was removed
        get_response = requests.get(f"{self.base_url}/cart/{self.session_id}")
        updated_cart = get_response.json()
        
        return len(updated_cart["items"]) == 0

    def test_clear_cart(self) -> bool:
        """Test clearing the entire cart"""
        # First add multiple items to the cart
        all_products = requests.get(f"{self.base_url}/products").json()
        
        if len(all_products) < 2:
            print("Not enough products found to test clear_cart")
            return False
            
        # Add first product
        item1_data = {
            "product_id": all_products[0]["id"],
            "quantity": 1,
            "selected_color": all_products[0]["colors"][0] if all_products[0]["colors"] else "#000000"
        }
        
        requests.post(f"{self.base_url}/cart/{self.session_id}/items", json=item1_data)
        
        # Add second product
        item2_data = {
            "product_id": all_products[1]["id"],
            "quantity": 1,
            "selected_color": all_products[1]["colors"][0] if all_products[1]["colors"] else "#000000"
        }
        
        requests.post(f"{self.base_url}/cart/{self.session_id}/items", json=item2_data)
        
        # Verify items were added
        get_response = requests.get(f"{self.base_url}/cart/{self.session_id}")
        cart_before = get_response.json()
        
        if len(cart_before["items"]) < 2:
            print("Failed to add multiple items to cart for clear test")
            return False
            
        # Clear the cart
        clear_response = requests.delete(f"{self.base_url}/cart/{self.session_id}")
        
        if clear_response.status_code != 200:
            print(f"Failed to clear cart: {clear_response.text}")
            return False
            
        self.test_results["cart"]["clear"] = clear_response.json()
        
        # Verify the cart was cleared
        get_response = requests.get(f"{self.base_url}/cart/{self.session_id}")
        cart_after = get_response.json()
        
        return len(cart_after["items"]) == 0

    # User API Tests
    def test_create_user(self) -> bool:
        """Test creating a new user"""
        user_data = {
            "email": f"test-{uuid.uuid4()}@example.com",
            "name": "Test User",
            "phone": "+84 123 456 789",
            "address": "123 Đường Lê Lợi, Quận 1, TP. Hồ Chí Minh"
        }
        
        response = requests.post(f"{self.base_url}/users", json=user_data)
        
        if response.status_code != 200:
            print(f"Failed to create user: {response.text}")
            return False
            
        created_user = response.json()
        self.test_results["users"]["create"] = created_user
        
        # Save the ID for future tests
        self.created_user_ids.append(created_user["id"])
        
        # Verify the user was created with the correct data
        for key, value in user_data.items():
            if created_user[key] != value:
                print(f"Created user has incorrect {key}: {created_user[key]} != {value}")
                return False
                
        return True

    def test_get_user(self) -> bool:
        """Test getting a user by ID"""
        # First create a user
        user_data = {
            "email": f"get-user-{uuid.uuid4()}@example.com",
            "name": "Get User Test",
            "phone": "+84 987 654 321",
            "address": "456 Đường Nguyễn Huệ, Quận 1, TP. Hồ Chí Minh"
        }
        
        create_response = requests.post(f"{self.base_url}/users", json=user_data)
        
        if create_response.status_code != 200:
            print(f"Failed to create user for get test: {create_response.text}")
            return False
            
        user_id = create_response.json()["id"]
        self.created_user_ids.append(user_id)
        
        # Get the user
        get_response = requests.get(f"{self.base_url}/users/{user_id}")
        
        if get_response.status_code != 200:
            print(f"Failed to get user: {get_response.text}")
            return False
            
        user = get_response.json()
        self.test_results["users"]["get"] = user
        
        # Verify it's the same user
        return user["id"] == user_id and user["email"] == user_data["email"]

    def run_all_tests(self):
        """Run all API tests"""
        # Status API Tests
        self.run_test("Root Endpoint", self.test_root_endpoint)
        self.run_test("Status Endpoints", self.test_status_endpoints)
        
        # Product API Tests
        self.run_test("Get Products", self.test_get_products)
        self.run_test("Product Filtering", self.test_product_filtering)
        self.run_test("Get Product by ID", self.test_get_product_by_id)
        self.run_test("Create Product", self.test_create_product)
        self.run_test("Update Product", self.test_update_product)
        self.run_test("Delete Product", self.test_delete_product)
        
        # Cart API Tests
        self.run_test("Get Cart", self.test_get_cart)
        self.run_test("Add to Cart", self.test_add_to_cart)
        self.run_test("Remove from Cart", self.test_remove_from_cart)
        self.run_test("Clear Cart", self.test_clear_cart)
        
        # User API Tests
        self.run_test("Create User", self.test_create_user)
        self.run_test("Get User", self.test_get_user)
        
        # Print summary
        self.print_summary()
        
        return self.test_summary

if __name__ == "__main__":
    print(f"Testing backend API at: {BACKEND_URL}")
    tester = BackendTester(BACKEND_URL)
    tester.run_all_tests()