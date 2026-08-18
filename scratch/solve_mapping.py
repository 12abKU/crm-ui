import json
import re

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Let's inspect the exact titles/headers for each item
items_mapped = {}

for idx, item in enumerate(data):
    t = item["text"]
    name = item["current_filename"]
    w, h = item["width"], item["height"]
    
    label = None
    
    # 1. Clear modals / standalone widgets
    if "Why was this deal lost?" in t:
        label = "admin_deal_lost_reason_modal"
    elif "Compare & Resolve Duplicates" in t:
        label = "admin_deduplication_page_merge_ui"
    elif "Create Automation Rule" in t:
        label = "admin_settings_automated_sequences"
    elif "Assign Lead" in t and "select multiple agents/admins" in t:
        label = "admin_lead_assign_modal"
    elif "New Lead" in t and "LEAD TITLE" in t and "DPDP consent" in t:
        label = "admin_lead_add_form"
    elif "DEAL TITLE" in t and "Sales Pipeline" in t and "EXPECTED CLOSE DATE" in t:
        label = "admin_deal_add_form"
    elif "STAGE JOURNEY" in t and "TIME IN STAGE" in t:
        label = "admin_deal_profile_journey"
    elif "ACTIVITY TIMELINE" in t and "New Activity" in t and "Save Activity" in t:
        label = "admin_deal_profile_activities"
    elif "CONVERSATIONS" in t and "Emails with" in t:
        label = "admin_deal_profile_conversation"
    elif "CURRENT STAGE" in t and "DEAL VALUE" in t and "DEAL DETAILS" in t:
        label = "admin_deal_profile_overview"
    elif "Preview not available" in t and "Download 45.7 KB" in t:
        label = "admin_document_preview"
    elif "Grant all ACCOUNTS_VIEW" in t or ("Accounts View accounts Create accounts" in t and "Deals View deals" in t):
        label = "admin_settings_permission_editor"
    elif "Robot Test Lead 1862" in t and "CHANGE STAT" in t and "Convert to Deal" in t:
        label = "admin_lead_convert_modal"
    elif "Dial a number" in t:
        if "agent" in name or idx >= 44:
            label = "agent_quick_dialer"
        else:
            label = "admin_quick_dialer"
            
    # 2. Agent Views (raju)
    elif "Welcome back, raju" in t or "Heres what's happening with your accounts today" in t:
        label = "agent_dashboard_summary"
    elif "Total Leads - 1" in t and "raju" in t and "Leads Total Leads" in t:
        label = "agent_leads_list"
    elif "Total Deals - 3 (Assigned to you)" in t:
        label = "agent_deals_board"
    elif "Sneha Pillai" in t and "Bharatpe Network" in t and "raju" in t:
        label = "agent_contact_profile"
    elif "Calendar Manage your schedule" in t and "raju" in t:
        label = "agent_calendar"
    elif "Teammates Chat Wth Colleagues" in t and "raju" in t:
        label = "agent_teammates_chat"
    elif "Conversations Search contacts" in t and "raju" in t and "Aarav Soni" in t and "100 CONTACTS" in t and idx >= 44:
        label = "agent_whatsapp_chat"
    elif "My Settings Manage your profile and view your permissions" in t and "Update your name and email" in t and "raju" in t:
        label = "agent_profile_settings"
    elif "Change Password Update your login password" in t and "CURRENT PASSWORD" in t and "raju" in t:
        label = "agent_change_password"
        
    # 3. Admin Pages & Settings
    elif "Audit Log Complete history of every action" in t:
        label = "admin_audit_logs"
    elif "Support Center" in t and "Submit a Support Ticket" in t:
        label = "admin_support_submit_ticket"
    elif "Voice call history arid logs" in t or ("Calls Voice call history" in t) or ("TOTAL CALLS 2" in t and "Calls" in t):
        label = "admin_calls_list"
    elif "De-Duplication Dashboard" in t or ("De-Duplication" in t and "Potential Duplicates" in t):
        label = "admin_deduplication_page"
    elif "Privacy & Compliance" in t and ("Consent Logs" in t or "Data Subject Requests" in t or "GDPR" in t):
        label = "admin_privacy_compliance"
    elif "Teammates witn" in t or ("Teammates Chat" in t and "abhay" in t):
        label = "admin_teammates_chat"
    elif "Activity Details TYPE CALL SCHEDULED AT" in t or "Logged 22h ago" in t:
        label = "admin_activity_profile"
    elif "Calendar Manage your schedule" in t and ("All Team Calend" in t or "SUN" in t):
        label = "admin_calendar_view"
    elif "Activities 6 logged" in t or "OVERDUE 6" in t or "Activities Manage all tasks" in t:
        label = "admin_activities_list"
    elif "Contacts Total contacts -112" in t or "Contacts Total contacts" in t:
        label = "admin_contacts_list"
    elif "Accounts Total Accounts -102" in t or "Accounts Total Accounts" in t:
        label = "admin_accounts_list"
    elif "Himanshu Sales Executive PolicyBazaar" in t or ("Back" in t and "PolicyBazaar" in t):
        label = "admin_contact_profile" # or account profile
    elif "Total Deas" in t or "Deals Total Deals" in t or ("Deals" in t and "PROPOSAL SENT" in t and "OUALIFIED" in t):
        label = "admin_deals_kanban_board"
    elif "Leads Total Leads" in t or ("Leads" in t and "CONTACTED" in t and "OUALIFIED" in t and "CONVERTED" in t):
        label = "admin_leads_list"
    elif "Sulekha: CRM Software Installation SULEKHA OVERVIEW" in t:
        label = "admin_lead_profile_overview"
    elif "Conversations Search contacts" in t and "Email (Gmail)" in t:
        label = "admin_conversations_email"
    elif "Conversations Search contacts" in t and "WhatsApp" in t:
        label = "admin_conversations_whatsapp"
        
    items_mapped[idx] = {
        "current_name": name,
        "size": f"{w}x{h}",
        "detected": label,
        "text": t[:150]
    }

for idx, m in items_mapped.items():
    print(f"[{idx+1:02d}] {m['current_name']:35s} -> {str(m['detected']):35s} | ({m['size']})")
