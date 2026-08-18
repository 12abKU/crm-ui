import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

def classify(idx, item):
    t = item["text"]
    w, h = item["width"], item["height"]
    name = item["current_filename"]
    
    # Check agent items first (they usually have "AGENT" or "raju" in text or small widgets)
    is_agent = "raju" in t.lower() or "agent" in t.lower() or "my settings" in t.lower()
    
    # 1. Modals / specific widgets:
    if "Why was this deal lost?" in t or "LOST REASON" in t:
        return "admin_deal_lost_reason_modal"
    if "Compare & Resolve Duplicates" in t or "PRIMARY (SURVIVING)" in t:
        return "admin_deduplication_page_merge_ui"
    if "Create Automation Rule" in t or "Map trigger events to automated actions" in t:
        return "admin_settings_automated_sequences"
    if "Assign Lead" in t and "select multiple agents/admins" in t:
        return "admin_lead_assign_modal"
    if "New Lead" in t and "LEAD TITLE" in t and "DPDP consent" in t:
        return "admin_lead_add_form"
    if "DEAL TITLE" in t and "STAGE" in t and "EXPECTED CLOSE DATE" in t and "Sales Pipeline" in t:
        return "admin_deal_add_form"
    if "STAGE JOURNEY" in t and "TIME IN STAGE" in t:
        return "admin_deal_profile_journey"
    if "ACTIVITY TIMELINE" in t and "New Activity" in t and "Save Activity" in t:
        return "admin_deal_profile_activities"
    if "Emails with Abhay prajapati" in t or ("CONVERSATIONS" in t and "Show full email" in t):
        return "admin_deal_profile_conversation"
    if "CURRENT STAGE" in t and "DEAL VALUE" in t and "DEAL DETAILS" in t:
        return "admin_deal_profile_overview"
    if "Preview not available" in t and "Download 45.7 KB" in t:
        return "admin_document_preview"
    if "Grant all ACCOUNTS_VIEW" in t or "View accounts Create accounts" in t:
        return "admin_settings_permission_editor"
    if "Robot Test Lead 1862" in t and "CHANGE STAT" in t and "Convert to Deal" in t:
        return "admin_lead_convert_modal"
        
    # Quick dialer
    if "Dial a number" in t:
        # Check size or index
        if idx > 30 and ("*91" in t or "agent" in name or w < 630):
            return "agent_quick_dialer"
        return "admin_quick_dialer"

    # Dashboard tabs:
    if "Analytics Dashboard" in t or "Company-wide overview" in t or "ACTIVE DEALS" in t or "REVENUE WON" in t:
        if "raju" in t and "Welcome back, raju" in t:
            return "agent_dashboard_summary"
        if "Summary" in t and ("ACTIVE DEALS 48" in t or "OPEN PIPELINE" in t):
            return "admin_dashboard_summary"
        if "REVENUE WON" in t and "WIN RATE" in t and "Revenue Team" in t:
            if "Total Deals" in t or "Deals Bottlenecks" in t:
                # check which dashboard tab is active
                if "Z7.OL" in t or "700 stuck" in t:
                    return "admin_dashboard_deals"
                if "U8.5L" in t:
                    return "admin_dashboard_revenue"
        if "Team" in t and ("Top Performing" in t or "Leaderboard" in t or "Team Performance" in t or "team" in t.lower()):
            return "admin_dashboard_team"
        if "Bottlenecks" in t or "bottleneck" in t.lower():
            return "admin_dashboard_bottlenecks"
        if "Sales Activities" in t or "Activities" in t:
            return "admin_dashboard_activities"
        if "Contacts" in t:
            return "admin_dashboard_contacts"
            
    # Pages
    if "De-Duplication Dashboard" in t or "Potential Duplicates" in t or ("De-Duplication" in t and "Scan" in t):
        return "admin_deduplication_page"
    if "Audit Log" in t and "Complete history of every action" in t:
        return "admin_audit_logs"
    if "Privacy" in t and ("Consent" in t or "Data Subject" in t or "GDPR" in t or "Compliance" in t):
        return "admin_privacy_compliance"
    if "Support Center" in t or "Submit Ticket" in t or "Submit a Support Ticket" in t:
        return "admin_support_submit_ticket"
        
    return "UNKNOWN"

for idx, item in enumerate(data):
    res = classify(idx, item)
    print(f"[{idx+1:02d}] {item['current_filename']} -> {res}")
