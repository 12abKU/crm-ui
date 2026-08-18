import os

def update_file(filename, old, new):
    with open(filename, 'r') as f: content = f.read()
    if old in content:
        content = content.replace(old, new)
        with open(filename, 'w') as f: f.write(content)
        print(f'Updated {filename}')

update_file('tests/02_leads_tests.robot', 'Wait Until Page Does Not Contain    Robot Test Lead ${RND} - Edited    timeout=10s', 'Wait Until Page Does Not Contain Element    xpath=//h4[contains(., \\'Robot Test Lead ${RND} - Edited\\')]    timeout=10s')

update_file('tests/03_deals_tests.robot', 'Wait Until Page Does Not Contain    Robot Test Deal ${RND} - Edited    timeout=10s', 'Wait Until Page Does Not Contain Element    xpath=//*[contains(text(), \\'Robot Test Deal ${RND} - Edited\\')]    timeout=10s')

update_file('tests/04_contacts_tests.robot', 'Wait Until Page Does Not Contain    Robot Contact ${RND} Edited    timeout=10s', 'Wait Until Page Does Not Contain Element    xpath=//tr[contains(., \\'Robot Contact ${RND} Edited\\')]    timeout=10s')

update_file('tests/05_accounts_tests.robot', 'Wait Until Page Does Not Contain    Robot Account ${RND} Edited    timeout=10s', 'Wait Until Page Does Not Contain Element    xpath=//tr[contains(., \\'Robot Account ${RND} Edited\\')]    timeout=10s')
