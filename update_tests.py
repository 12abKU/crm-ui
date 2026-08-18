import os

files = ['tests/02_leads_tests.robot', 'tests/03_deals_tests.robot', 'tests/04_contacts_tests.robot', 'tests/05_accounts_tests.robot']
for f in files:
    with open(f, 'r') as file:
        content = file.read()
    
    # Replace static values with random suffix to avoid duplicates
    content = content.replace('Robot Test Lead', 'Robot Test Lead ${RND}')
    content = content.replace('Robot Deal', 'Robot Deal ${RND}')
    content = content.replace('Robot Contact', 'Robot Contact ${RND}')
    content = content.replace('Robot Account', 'Robot Account ${RND}')
    content = content.replace('Robot Corp', 'Robot Corp ${RND}')
    content = content.replace('robot.contact@test.com', 'robot.contact.${RND}@test.com')
    content = content.replace('robot@corp.com', 'robot.${RND}@corp.com')
    content = content.replace('9999999999', '999${RND}999')
    
    # Update delete xpath
    old_xpath = "//button[contains(., 'Delete') or contains(., 'Yes')]"
    new_xpath = "//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]"
    content = content.replace(old_xpath, new_xpath)
    
    with open(f, 'w') as file:
        file.write(content)

print("Updated test files")
