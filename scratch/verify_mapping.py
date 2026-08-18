import json

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# Let's define the exact matching function for each index
mapping = {}

for idx, item in enumerate(data):
    t = item["text"]
    name = item["current_filename"]
    w, h = item["width"], item["height"]
    
    # Check each index specifically based on full OCR analysis:
    if idx == 0: # admin_account_profile.png (1919x1007) -> "Accounts Total Accounts -102 ... Zerodha Broking"
        target = "admin_accounts_list.png"
    elif idx == 1: # admin_accounts_list.png (1919x1007) -> "Back Himanshu Sales Executive PolicyBazaar OPEN DEALS ... Overview EMAIL"
        target = "admin_contact_profile.png"
    elif idx == 2: # admin_activities_list.png (1028x1010) -> "CONVERSATIONS abhay.kumar@acem.edu.in ... Emails with Abhay prajapati"
        target = "admin_deal_profile_conversation.png"
    elif idx == 3: # admin_activity_profile.png (1919x1005) -> "Activities 6 logged OVERDUE 6 ... Activities"
        target = "admin_activities_list.png"
    elif idx == 4: # admin_audit_logs.png (1012x977) -> "Create Automation Rule Map trigger events to automated actions"
        target = "admin_settings_automated_sequences.png"
    elif idx == 5: # admin_calendar_view.png (1919x999) -> "Back Logged 22h ago ... Activity Details TYPE CALL SCHEDULED AT"
        target = "admin_activity_profile.png"
    elif idx == 6: # admin_calls_list.png (1910x1000) -> "Teammates witn In Q, Search raju Message raju..."
        target = "admin_teammates_chat.png"
    elif idx == 7: # admin_contact_profile.png (1919x1016) -> "Contacts Total contacts -112 NAME Himanshu Jain"
        target = "admin_contacts_list.png"
    elif idx == 8: # admin_contacts_list.png (1140x808) -> "Assign Lead Robot Test Lead 1862 ... select multiple agents/admins"
        target = "admin_lead_assign_modal.png"
    elif idx == 9: # admin_conversations_email.png (1919x1002) -> "Conversations Search contacts ... Email (Gmail) WhatsApp"
        target = "admin_conversations_email.png"
    elif idx == 10: # admin_conversations_whatsapp.png (1919x1001) -> "Calendar Manage your schedule ... SUN + Create Event/Task All Team Calend"
        target = "admin_calendar_view.png"
    elif idx == 11: # admin_dashboard_activities.png (1919x1005) -> Analytics Dashboard ... Activities tab
        target = "admin_dashboard_activities.png"
    elif idx == 12: # admin_dashboard_bottlenecks.png (1919x1004) -> Analytics Dashboard ... Bottlenecks / Notes
        target = "admin_dashboard_contacts.png"
    elif idx == 13: # admin_dashboard_contacts.png (1915x1003) -> Analytics Dashboard ... Deals Bottlenecks Contacts
        target = "admin_dashboard_deals.png"
    elif idx == 14: # admin_dashboard_deals.png (1917x1006) -> Analytics Dashboard ... Deals
        target = "admin_dashboard_bottlenecks.png"
    elif idx == 15: # admin_dashboard_revenue.png (1917x1004) -> Analytics Dashboard ... Revenue tab
        target = "admin_dashboard_revenue.png"
    elif idx == 16: # admin_dashboard_summary.png (1917x1010) -> Analytics Dashboard ... Summary tab
        target = "admin_dashboard_summary.png"
    elif idx == 17: # admin_dashboard_team.png (1919x1004) -> Analytics Dashboard ... Bottlenecks distribution / Team
        target = "admin_dashboard_team.png"
    elif idx == 18: # admin_deals_kanban_board.png (1919x1003) -> "Deals Total Deas ... QUALIFIED PROPOSAL SENT"
        target = "admin_deals_kanban_board.png"
    elif idx == 19: # admin_deal_add_form.png (650x1024) -> "DEAL TITLE AMOUNT PIPELINE STAGE EXPECTED CLOSE DATE ACCOUNT CONTACT"
        target = "admin_deal_add_form.png"
    elif idx == 20: # admin_deal_lost_reason_modal.png (1028x1009) -> "STAGE JOURNEY Closed Won Entered... Proposal Sent Entered..."
        target = "admin_deal_profile_journey.png"
    elif idx == 21: # admin_deal_profile_activities.png (1043x1005) -> "ACTIVITIES ACTIVITY TIMELINE New Activity CALL EMAIL MEETING"
        target = "admin_deal_profile_activities.png"
    elif idx == 22: # admin_deal_profile_conversation.png (1168x1043) -> "OVERVIEW CURRENT STAGE Proposal Sent CHANGE STAGE DEAL VALUE"
        target = "admin_deal_profile_overview.png"
    elif idx == 23: # admin_deal_profile_journey.png (608x635) -> "Why was this deal lost? LOST REASON Price too high"
        target = "admin_deal_lost_reason_modal.png"
    elif idx == 24: # admin_deal_profile_overview.png (1104x788) -> "Compare & Resolve Duplicates PRIMARY (SURVIVING)"
        target = "admin_deduplication_page_merge_ui.png"
    elif idx == 25: # admin_deduplication_page.png (1899x990) -> "Back Zerodha Broking Fintech OPEN DEALS Overview PHONE WEBSITE"
        target = "admin_account_profile.png"
    elif idx == 26: # admin_deduplication_page_merge_ui.png (1914x1014) -> "De-Duplication Settings Support ... Potential Duplicates"
        target = "admin_deduplication_page.png"
    elif idx == 27: # admin_document_preview.png (1919x998) -> "Documents Manage files and attachments ... Upload Document ... DOCUMENT test"
        target = "admin_documents_list.png"
    elif idx == 28: # admin_documents_list.png (633x405) -> "Dial a number +91xxxxxxxxxx"
        target = "admin_quick_dialer.png"
    elif idx == 29: # admin_lead_add_form.png (1919x1004) -> "Leads Total Leads ... CONTACTED QUALIFIED CONVERTED"
        target = "admin_leads_list.png"
    elif idx == 30: # admin_lead_assign_modal.png (1032x267) -> "Robot Test Lead 1862 ... CHANGE STATUS Contacted Convert to Deal"
        target = "admin_lead_convert_modal.png"
    elif idx == 31: # admin_lead_convert_modal.png (1919x999) -> "Sulekha: CRM Software Installation SULEKHA OVERVIEW CHANGE STATUS"
        target = "admin_lead_profile_overview.png"
    elif idx == 32: # admin_lead_profile_overview.png (688x1064) -> "New Lead LEAD TITLE SOURCE COMPANY CONTACT PERSON EMAIL PHONE STATUS"
        target = "admin_lead_add_form.png"
    elif idx == 33: # admin_leads_list.png (1914x1012) -> "Analytics Dashboard ... TEAM PERFORMANCE AGENT raju testing abhay"
        target = "admin_dashboard_team.png" # wait, let's check between 17 and 33
    elif idx == 34: # admin_privacy_compliance.png (1919x1000) -> "Audit Log Complete history of every action performed in your CRM"
        target = "admin_audit_logs.png"
    elif idx == 35: # admin_quick_dialer.png (1909x998) -> "Calls Voice call history arid logs TOTAL CALLS 2 Call Logs"
        target = "admin_calls_list.png"
    elif idx == 36: # admin_settings_agent_management.png (1195x919) -> "Preview not available We do not support inline previewing for application..."
        target = "admin_document_preview.png"
    elif idx == 37: # admin_settings_app_integrations.png (1916x994) -> "Pipeline Configuration ... Pipeline Stages Customize your sales pipeline"
        target = "admin_settings_pipeline.png"
    elif idx == 38: # admin_settings_automated_sequences.png (1915x985) -> "Email Templates ... Create customized HTML templates with dynamic interpolation"
        target = "admin_settings_email_templates.png"
    elif idx == 39: # admin_settings_email_templates.png (1919x982) -> "Change Password Update your login password ... Subscription & Resource Limits"
        target = "admin_settings_app_integrations.png" # or general settings
    elif idx == 40: # admin_settings_permission_editor.png (1919x1001) -> "Admin Settings ... Team Management Create and manage team members ... raju testing"
        target = "admin_settings_agent_management.png"
    elif idx == 41: # admin_settings_pipeline.png (925x966) -> "AGENT Accounts View accounts Create accounts Edit accounts ... Permissions"
        target = "admin_settings_permission_editor.png"
    elif idx == 42: # admin_support_submit_ticket.png (989x1008) -> "Support Center Managing support for iinventive ... Submit a Support Ticket"
        target = "admin_support_submit_ticket.png"
    elif idx == 43: # admin_teammates_chat.png (1897x994) -> "Conversations Search contacts ... 100 CONTACTS Aarav Soni ... WhatsApp"
        target = "admin_conversations_whatsapp.png"
    elif idx == 44: # agent_calendar.png (1911x996) -> "Calendar Manage your schedule ... raju"
        target = "agent_calendar.png"
    elif idx == 45: # agent_change_password.png (959x990) -> "Agent FULL NAME raju ... Change Password"
        target = "agent_change_password.png"
    elif idx == 46: # agent_contact_profile.png (1919x992) -> "Back Sneha Pillai Manager Bharatpe Network ... raju AGENT"
        target = "agent_contact_profile.png"
    elif idx == 47: # agent_dashboard_summary.png (1915x1004) -> "Good day Welcome back, raju ... ACTIVE DEALS"
        target = "agent_dashboard_summary.png"
    elif idx == 48: # agent_deals_board.png (1912x1001) -> "Deals Total Deals - 3 (Assigned to you) ... raju AGENT"
        target = "agent_deals_board.png"
    elif idx == 49: # agent_leads_list.png (1919x997) -> "Leads Total Leads - 1 ... raju AGENT"
        target = "agent_leads_list.png"
    elif idx == 50: # agent_profile_settings.png (1915x1006) -> "My Settings Manage your profile ... raju Agent"
        target = "agent_profile_settings.png"
    elif idx == 51: # agent_quick_dialer.png (624x396) -> "Dial a number *91xxxxxxxxxx call"
        target = "agent_quick_dialer.png"
    elif idx == 52: # agent_teammates_chat.png (1915x999) -> "Teammates Chat Wth Colleagues ... raju AGENT"
        target = "agent_teammates_chat.png"
    elif idx == 53: # agent_whatsapp_chat.png (1919x1003) -> "Conversations Search contacts ... raju AGENT"
        target = "agent_whatsapp_chat.png"
        
    mapping[idx] = target

# Check duplicates and missing
counts = {}
for k, v in mapping.items():
    counts[v] = counts.get(v, 0) + 1

print(f"Total mapped: {len(mapping)}")
for k, v in counts.items():
    if v > 1:
        print(f"DUPLICATE TARGET: {k} (count={v})")

# Check which of the 54 targets is missing
all_targets = [
    "admin_dashboard_summary.png", "admin_dashboard_revenue.png", "admin_dashboard_deals.png",
    "admin_dashboard_contacts.png", "admin_dashboard_activities.png", "admin_dashboard_bottlenecks.png",
    "admin_dashboard_team.png", "admin_leads_list.png", "admin_lead_add_form.png",
    "admin_lead_profile_overview.png", "admin_lead_convert_modal.png", "admin_lead_assign_modal.png",
    "admin_contacts_list.png", "admin_contact_profile.png", "admin_accounts_list.png",
    "admin_account_profile.png", "admin_deduplication_page.png", "admin_deduplication_page_merge_ui.png",
    "admin_deals_kanban_board.png", "admin_deal_add_form.png", "admin_deal_lost_reason_modal.png",
    "admin_deal_profile_overview.png", "admin_deal_profile_journey.png", "admin_deal_profile_activities.png",
    "admin_deal_profile_conversation.png", "admin_activities_list.png", "admin_activity_profile.png",
    "admin_calendar_view.png", "admin_conversations_whatsapp.png", "admin_conversations_email.png",
    "admin_teammates_chat.png", "admin_calls_list.png", "admin_quick_dialer.png",
    "admin_documents_list.png", "admin_document_preview.png", "admin_settings_agent_management.png",
    "admin_settings_permission_editor.png", "admin_settings_pipeline.png", "admin_settings_app_integrations.png",
    "admin_settings_email_templates.png", "admin_settings_automated_sequences.png", "admin_audit_logs.png",
    "admin_privacy_compliance.png", "admin_support_submit_ticket.png", "agent_dashboard_summary.png",
    "agent_leads_list.png", "agent_deals_board.png", "agent_contact_profile.png",
    "agent_calendar.png", "agent_whatsapp_chat.png", "agent_teammates_chat.png",
    "agent_quick_dialer.png", "agent_profile_settings.png", "agent_change_password.png"
]

missing = [t for t in all_targets if t not in counts]
print(f"Missing targets: {missing}")
