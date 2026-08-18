import os

def update_file(filename):
    with open(filename, 'r') as f: content = f.read()
    
    old_script = """    Execute Javascript    
    ...    var btns = document.evaluate("//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]", document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
    ...    var lastBtn = btns.snapshotItem(btns.snapshotLength - 1);
    ...    if (lastBtn) lastBtn.click();"""
    
    new_script = """    Execute Javascript    
    ...    var xpath = "//h3[contains(., 'Delete')]/../..//button[contains(., 'Delete') or contains(., 'Yes') or contains(., 'Confirm')]";
    ...    var btn = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    ...    if (btn) btn.click();"""
    
    if old_script in content:
        content = content.replace(old_script, new_script)
        with open(filename, 'w') as f: f.write(content)
        print(f'Updated {filename}')

for root, _, files in os.walk('tests'):
    for file in files:
        if file.endswith('.robot'):
            update_file(os.path.join(root, file))
