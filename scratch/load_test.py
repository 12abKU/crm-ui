import requests
import concurrent.futures
import time

# --- CONFIGURATION ---
BASE_URL = "http://localhost:8086"
LOGIN_URL = f"{BASE_URL}/api/auth/login"
TARGET_URL = f"{BASE_URL}/api/deals"
USER_EMAIL = "kabhay@gmail.com"
USER_PASS = "123456"
NUM_REQUESTS = 500  # Total requests to send
CONCURRENCY = 50    # How many users at exactly the same time

def get_token():
    print("Getting auth token...")
    resp = requests.post(LOGIN_URL, json={"email": USER_EMAIL, "password": USER_PASS})
    if resp.status_code == 200:
        return resp.json().get("token")
    else:
        print(f"Failed to login: {resp.text}")
        return None

def fetch_deals(token, req_id):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    start_time = time.time()
    try:
        resp = requests.get(TARGET_URL, headers=headers)
        duration = time.time() - start_time
        return {"id": req_id, "status": resp.status_code, "duration": duration, "error": None}
    except Exception as e:
        duration = time.time() - start_time
        return {"id": req_id, "status": None, "duration": duration, "error": str(e)}

def run_load_test():
    token = get_token()
    if not token:
        return
    
    print(f"Token acquired. Starting load test...")
    print(f"Sending {NUM_REQUESTS} requests with {CONCURRENCY} concurrent users...")
    
    results = []
    start_time = time.time()
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=CONCURRENCY) as executor:
        futures = [executor.submit(fetch_deals, token, i) for i in range(NUM_REQUESTS)]
        for future in concurrent.futures.as_completed(futures):
            results.append(future.result())
            
    total_time = time.time() - start_time
    
    # --- CALCULATE METRICS ---
    successful = [r for r in results if r["status"] == 200]
    failed = [r for r in results if r["status"] != 200]
    durations = [r["duration"] for r in successful]
    
    print("\n" + "="*40)
    print("        LOAD TEST RESULTS        ")
    print("="*40)
    print(f"Total Requests: {len(results)}")
    print(f"Successful:     {len(successful)}")
    print(f"Failed:         {len(failed)}")
    print(f"Total Time:     {total_time:.2f} seconds")
    print(f"Requests/sec:   {(len(results)/total_time):.2f}")
    
    if durations:
        avg_time = sum(durations) / len(durations)
        max_time = max(durations)
        print("-" * 40)
        print(f"Average Response: {avg_time*1000:.2f} ms")
        print(f"Max Response:     {max_time*1000:.2f} ms")
        
    if failed:
        print("\nErrors encountered:")
        errors = set([r.get("error") or f"HTTP {r.get('status')}" for r in failed])
        for e in errors:
            print(f"- {e}")

if __name__ == "__main__":
    run_load_test()
