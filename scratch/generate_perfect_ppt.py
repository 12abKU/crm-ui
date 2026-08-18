import os
import shutil
import json
from PIL import Image
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor

folder = r"d:\Desktop\crm-screenshots"
staging_folder = r"d:\Desktop\crm-screenshots\staging_clean"
output_file = r"d:\Desktop\crm-screenshots\Final_CRM_User_Manual.pptx"

# 1. Exact mapping from OCR report index to True Feature Name
index_to_true_name = {
    0: "admin_accounts_list.png",
    1: "admin_contact_profile.png",
    2: "admin_deal_profile_conversation.png",
    3: "admin_activities_list.png",
    4: "admin_settings_automated_sequences.png",
    5: "admin_activity_profile.png",
    6: "admin_teammates_chat.png",
    7: "admin_contacts_list.png",
    8: "admin_lead_assign_modal.png",
    9: "admin_conversations_email.png",
    10: "admin_calendar_view.png",
    11: "admin_dashboard_contacts.png",
    12: "admin_dashboard_activities.png",
    13: "admin_dashboard_deals.png",
    14: "admin_privacy_compliance.png",
    15: "admin_dashboard_revenue.png",
    16: "admin_dashboard_summary.png",
    17: "admin_dashboard_bottlenecks.png",
    18: "admin_deals_kanban_board.png",
    19: "admin_deal_add_form.png",
    20: "admin_deal_profile_journey.png",
    21: "admin_deal_profile_activities.png",
    22: "admin_deal_profile_overview.png",
    23: "admin_deal_lost_reason_modal.png",
    24: "admin_deduplication_page_merge_ui.png",
    25: "admin_account_profile.png",
    26: "admin_deduplication_page.png",
    27: "admin_documents_list.png",
    28: "admin_quick_dialer.png",
    29: "admin_leads_list.png",
    30: "admin_lead_convert_modal.png",
    31: "admin_lead_profile_overview.png",
    32: "admin_lead_add_form.png",
    33: "admin_dashboard_team.png",
    34: "admin_audit_logs.png",
    35: "admin_calls_list.png",
    36: "admin_document_preview.png",
    37: "admin_settings_pipeline.png",
    38: "admin_settings_email_templates.png",
    39: "admin_settings_app_integrations.png",
    40: "admin_settings_agent_management.png",
    41: "admin_settings_permission_editor.png",
    42: "admin_support_submit_ticket.png",
    43: "admin_conversations_whatsapp.png",
    44: "agent_calendar.png",
    45: "agent_change_password.png",
    46: "agent_contact_profile.png",
    47: "agent_dashboard_summary.png",
    48: "agent_deals_board.png",
    49: "agent_leads_list.png",
    50: "agent_profile_settings.png",
    51: "agent_quick_dialer.png",
    52: "agent_teammates_chat.png",
    53: "agent_whatsapp_chat.png"
}

with open(r"d:\Desktop\crm-ui\scratch\ocr_full_report.json", "r", encoding="utf-8") as f:
    ocr_data = json.load(f)

# Copy each file from its current name into staging with its TRUE name
if os.path.exists(staging_folder):
    shutil.rmtree(staging_folder)
os.makedirs(staging_folder)

for idx, item in enumerate(ocr_data):
    src_file = os.path.join(folder, item["current_filename"])
    dst_file = os.path.join(staging_folder, index_to_true_name[idx])
    shutil.copy2(src_file, dst_file)

# Overwrite files in main folder with correct staging files
for target_name in index_to_true_name.values():
    src_file = os.path.join(staging_folder, target_name)
    dst_file = os.path.join(folder, target_name)
    shutil.copy2(src_file, dst_file)

print("All 54 files successfully renamed to their TRUE features in the screenshots folder!")

# 2. Content dictionary for all 54 slides
content_map = {
    "admin_dashboard_summary.png": {
        "title": "Admin Dashboard - Summary",
        "use_case": "Provides an executive high-level overview of company-wide health, active deal counts, new contacts, won revenue, and stage funnel.",
        "how_to": "Navigate to 'Dashboard' in the sidebar. Use the Summary tab to monitor daily metrics, view the deal stage funnel, and inspect win-rate analytics."
    },
    "admin_dashboard_revenue.png": {
        "title": "Admin Dashboard - Revenue Analytics",
        "use_case": "Tracks total won revenue, lost revenue comparison, and quarterly revenue forecasting across your company.",
        "how_to": "Click the 'Revenue' tab on the Dashboard. Review the won vs lost revenue breakdown and quarterly projections to ensure targets are met."
    },
    "admin_dashboard_deals.png": {
        "title": "Admin Dashboard - Deals Analytics",
        "use_case": "Visualizes pipeline velocity, open deals by stage, and win rate percentages to identify high-value opportunities.",
        "how_to": "Click the 'Deals' tab on the Dashboard. Monitor average days to close and stage distribution to keep deals flowing smoothly."
    },
    "admin_dashboard_contacts.png": {
        "title": "Admin Dashboard - Contacts Analytics",
        "use_case": "Monitors total contact volume, growth rate for the month, and distribution of contacts across account owners.",
        "how_to": "Click the 'Contacts' tab on the Dashboard to inspect lead generation pace and ensure contacts are evenly distributed among agents."
    },
    "admin_dashboard_activities.png": {
        "title": "Admin Dashboard - Activities",
        "use_case": "Audits team-wide communication volume, including completed calls, emails sent, and scheduled client meetings.",
        "how_to": "Click the 'Activities' tab on the Dashboard. Review activity breakdowns by type and owner to ensure consistent customer engagement."
    },
    "admin_dashboard_bottlenecks.png": {
        "title": "Admin Dashboard - Bottlenecks",
        "use_case": "Highlights pipeline stages with highest stuck deal counts and longest average duration to eliminate sales friction.",
        "how_to": "Click the 'Bottlenecks' tab on the Dashboard. Identify stages where deals are idling and reassign resources to move them forward."
    },
    "admin_dashboard_team.png": {
        "title": "Admin Dashboard - Team Performance",
        "use_case": "Displays a performance leaderboard comparing each agent's active deals, won revenue, pipeline value, and completed activities.",
        "how_to": "Click the 'Team' tab on the Dashboard. Evaluate individual agent productivity and recognize top sales performers."
    },
    "admin_leads_list.png": {
        "title": "Leads Management - Main List",
        "use_case": "A central pipeline tracking all incoming unverified prospects categorized by status (New, Contacted, Qualified, Converted).",
        "how_to": "Click 'Leads' in the sidebar. Use the status filter tabs to inspect leads, search by name, or click on any lead to open its profile."
    },
    "admin_lead_add_form.png": {
        "title": "Leads Management - Add New Lead",
        "use_case": "Captures new prospects manually with source attribution, company details, and mandatory DPDP/GDPR consent confirmation.",
        "how_to": "Click '+ Add Lead' on the Leads page. Enter lead title, source, company, contact details, check the consent box, and click Save."
    },
    "admin_lead_profile_overview.png": {
        "title": "Lead Profile - Overview & Source Info",
        "use_case": "Displays comprehensive lead information, capturing portal-specific details (e.g. Sulekha/IndiaMart requirements and city).",
        "how_to": "Click on any lead in the table. Review the lead's service requirements, contact details, and update status directly from the header."
    },
    "admin_lead_convert_modal.png": {
        "title": "Leads Management - Convert Lead",
        "use_case": "Converts a qualified prospect into an active Account, linked Contact, and optional Deal simultaneously.",
        "how_to": "On the Lead Profile, click 'Convert to Deal'. Verify account details, select pipeline stage, and complete the conversion process."
    },
    "admin_lead_assign_modal.png": {
        "title": "Leads Management - Assign Lead to Agent",
        "use_case": "Distributes incoming leads to specific agents or administrators for immediate outreach and follow-up.",
        "how_to": "Select a lead and click 'Assign'. Search and select one or more team members from the modal, then confirm assignment."
    },
    "admin_contacts_list.png": {
        "title": "Contacts Management - Directory",
        "use_case": "Maintains a searchable database of all qualified client contacts, their designations, phone numbers, and company affiliations.",
        "how_to": "Click 'Contacts' in the sidebar. Search by name, designation, or company, or click any contact row to access their 360-degree profile."
    },
    "admin_contact_profile.png": {
        "title": "Contact Profile - 360 View",
        "use_case": "Consolidates all linked deals, call logs, past activities, and direct communication history for an individual.",
        "how_to": "Click on a contact to view their profile. Use the Quick Action buttons to initiate phone calls, send emails, or review open deals."
    },
    "admin_accounts_list.png": {
        "title": "Accounts Management - B2B Directory",
        "use_case": "Organizes all client companies, enterprise accounts, industries, and their total deal values in one central table.",
        "how_to": "Click 'Accounts' in the sidebar. View account summaries, filter by industry, or click '+ Add Account' to register a new client company."
    },
    "admin_account_profile.png": {
        "title": "Account Profile - Company Overview",
        "use_case": "Shows full corporate details, linked contacts, total deal value, recent activities, and audit history for a business account.",
        "how_to": "Click into an Account. Review corporate website, employee tier, associated executives, and click '+ Add Deal' to create a new opportunity."
    },
    "admin_deduplication_page.png": {
        "title": "Data Quality - De-Duplication Scanner",
        "use_case": "Scans your database for duplicate contacts and leads based on matching phone digits, emails, or company names.",
        "how_to": "Click 'De-Duplication' in the sidebar. View potential duplicate pairs, match confidence scores, and click 'Merge' to resolve them."
    },
    "admin_deduplication_page_merge_ui.png": {
        "title": "Data Quality - Merge & Compare UI",
        "use_case": "Side-by-side comparison allowing admins to select which primary fields survive and automatically transfer all deals and activities.",
        "how_to": "Click 'Merge' on a duplicate pair. Choose the primary surviving record, select specific field values to retain, and confirm merge."
    },
    "admin_deals_kanban_board.png": {
        "title": "Deals & Pipelines - Kanban Board",
        "use_case": "Visual drag-and-drop board displaying deals across custom pipeline stages (New Lead, Qualified, Proposal, Won, Lost).",
        "how_to": "Click 'Deals' in the sidebar. Drag deal cards between stages as negotiations advance, or click a card to open its detailed panel."
    },
    "admin_deal_add_form.png": {
        "title": "Deals Management - Add New Deal",
        "use_case": "Creates a new revenue opportunity tied to an existing Account and Contact with expected close date and pipeline stage.",
        "how_to": "Click '+ Add Deal' on the Deals board. Fill in Deal Title, Amount, select Pipeline, Stage, Account, and Contact, then click Save."
    },
    "admin_deal_lost_reason_modal.png": {
        "title": "Deals Management - Lost Deal Reason",
        "use_case": "Captures standard loss categories (Price too high, Chose competitor, Missing feature) and context notes for post-mortem analytics.",
        "how_to": "When moving a deal card to 'Closed Lost', select the loss reason from the dropdown, add optional context notes, and click 'Mark Lost'."
    },
    "admin_deal_profile_overview.png": {
        "title": "Deal Profile - Overview & Details",
        "use_case": "Displays key deal metrics: value, associated company, primary contact, current pipeline stage, and expected close date.",
        "how_to": "Click on any deal card. Use the Overview panel to update deal amounts, reassign owners, or advance stages with one click."
    },
    "admin_deal_profile_journey.png": {
        "title": "Deal Profile - Stage Journey Timeline",
        "use_case": "Tracks exact timestamps of when a deal entered and exited every stage, measuring total duration spent in each phase.",
        "how_to": "Click the 'Journey' tab inside a deal panel. Audit stage progression velocity to understand where sales cycles slow down."
    },
    "admin_deal_profile_activities.png": {
        "title": "Deal Profile - Activity Timeline",
        "use_case": "Logs and schedules calls, meetings, notes, and tasks directly attached to this deal opportunity.",
        "how_to": "Click the 'Activities' tab inside a deal. Schedule upcoming meetings, log completed call outcomes, and set reminder dates."
    },
    "admin_deal_profile_conversation.png": {
        "title": "Deal Profile - Conversation History",
        "use_case": "Consolidates all email threads and WhatsApp message exchanges linked to the deal's primary contact.",
        "how_to": "Click the 'Conversations' tab inside a deal. Read full email history and reply directly without switching contexts."
    },
    "admin_activities_list.png": {
        "title": "Activities Management - Task Center",
        "use_case": "Master activity dashboard grouping all overdue, today's, and upcoming tasks, calls, and meetings across the team.",
        "how_to": "Click 'Activities' in the sidebar. Filter by activity type or overdue status, and check off completed tasks as you work."
    },
    "admin_activity_profile.png": {
        "title": "Activity Details & Outcome Logging",
        "use_case": "Shows specific meeting/call details, scheduled times, linked accounts, and outcome status.",
        "how_to": "Click on any activity item. Edit time details, assign team members, and record outcome notes when completing the activity."
    },
    "admin_calendar_view.png": {
        "title": "Calendar - Schedule & Events Grid",
        "use_case": "Monthly and weekly calendar interface synchronizing team meetings, follow-ups, and scheduled deadlines with Google Calendar.",
        "how_to": "Click 'Calendar' in the sidebar. Click on any date cell or the '+ Create Event/Task' button to schedule new meetings."
    },
    "admin_conversations_whatsapp.png": {
        "title": "Omnichannel - WhatsApp Conversations",
        "use_case": "Direct, two-way WhatsApp business messaging with contacts, supporting instant chat bubbles and template sends.",
        "how_to": "Click 'Conversations' in the sidebar. Select a contact from the list to view chat history and type/send WhatsApp messages in real-time."
    },
    "admin_conversations_email.png": {
        "title": "Omnichannel - Gmail Integration & Email",
        "use_case": "Synchronizes your connected Gmail account to view inbox threads and send emails directly with template support.",
        "how_to": "Select 'Email (Gmail)' in Conversations or inside Contact Profiles to compose emails, insert templates, and track messages."
    },
    "admin_teammates_chat.png": {
        "title": "Internal Teammates Chat",
        "use_case": "Real-time internal instant messaging tool allowing agents and admins to collaborate, share deals, and exchange files.",
        "how_to": "Click 'Internal Chat' in the sidebar. Select a colleague to open a direct chat, view online status, and send instant messages."
    },
    "admin_calls_list.png": {
        "title": "Voice Calling - Call Logs & History",
        "use_case": "Logs all inbound and outbound browser calls with duration, timestamps, agent name, and recording URLs.",
        "how_to": "Click 'Calls' in the sidebar. Review call history, filter by answered/missed status, and inspect total talk time metrics."
    },
    "admin_quick_dialer.png": {
        "title": "Voice Calling - Quick Dialer Widget",
        "use_case": "Built-in softphone dialer powered by Twilio WebRTC for one-click calling from any CRM screen.",
        "how_to": "Click the phone icon anywhere in the CRM to open the Quick Dialer, input a phone number or click contact, and start the call."
    },
    "admin_documents_list.png": {
        "title": "Documents Management - Vault",
        "use_case": "Centralized file storage for contracts, proposals, invoices, and attachments linked to deals and accounts.",
        "how_to": "Click 'Documents' in the sidebar. Click 'Upload Document' to upload files, search by name, or view document size and date."
    },
    "admin_document_preview.png": {
        "title": "Documents - In-App Preview & Download",
        "use_case": "Allows quick in-browser inspection of uploaded documents and instant download functionality.",
        "how_to": "Click on any document in the list to trigger the preview modal, inspect file metadata, or download it to your device."
    },
    "admin_settings_agent_management.png": {
        "title": "Settings - Team & Agent Management",
        "use_case": "Admin center for inviting team members, assigning Agent/Admin roles, and managing active user accounts.",
        "how_to": "Navigate to 'Settings' -> 'Team Management'. Click '+ Add Team Member' to invite colleagues and assign their initial role."
    },
    "admin_settings_permission_editor.png": {
        "title": "Settings - Granular Permission Editor",
        "use_case": "Fine-grained security matrix allowing admins to grant/revoke View, Create, Edit, or Delete permissions per module for each agent.",
        "how_to": "In Team Management, click 'Permissions' next to an agent. Check/uncheck specific permissions (e.g. ACCOUNTS_CREATE) and click Save."
    },
    "admin_settings_pipeline.png": {
        "title": "Settings - Pipeline Stage Configuration",
        "use_case": "Customizes pipeline stages, display order, stage labels, and close probability percentages for your sales workflow.",
        "how_to": "Go to 'Settings' -> 'Pipeline Stages'. Add new custom stages, reorder existing columns, set win probabilities, and save config."
    },
    "admin_settings_app_integrations.png": {
        "title": "Settings - Account Limits & Profile",
        "use_case": "Displays subscription tier, storage allocation, user limits, contact capacities, and password management.",
        "how_to": "Go to 'Settings' -> 'General Settings' to check your enterprise resource consumption, storage limits, and update admin credentials."
    },
    "admin_settings_email_templates.png": {
        "title": "Settings - Email Templates Library",
        "use_case": "Pre-built, reusable HTML email templates supporting dynamic interpolation placeholders (e.g. {{contact_name}}).",
        "how_to": "Go to 'Settings' -> 'Email Templates'. Click 'Create Template', design your subject and body, and save for team use."
    },
    "admin_settings_automated_sequences.png": {
        "title": "Settings - Automated Sequence Rules",
        "use_case": "Workflow automation builder mapping trigger events (e.g. Deal Stage Changed) to automated actions (Create Task, Send Email).",
        "how_to": "Go to 'Settings' -> 'Automated Sequences'. Click 'Create Automation Rule', select the trigger, define the action, and activate."
    },
    "admin_audit_logs.png": {
        "title": "Security & Compliance - Audit Logs",
        "use_case": "Immutable, chronological ledger recording every action (Created, Updated, Deleted) performed across all entities and users.",
        "how_to": "Click 'Audit Log' in the sidebar. Filter by user or entity type to inspect historical timestamps and IP details for compliance."
    },
    "admin_privacy_compliance.png": {
        "title": "Privacy & GDPR/DPDP Compliance",
        "use_case": "Comprehensive consent tracking and compliance governance tools ensuring customer data protection.",
        "how_to": "Click 'Privacy & Compliance' in the sidebar. Audit consent timestamps, process data subject requests, and maintain compliance."
    },
    "admin_support_submit_ticket.png": {
        "title": "Help & Support - Submit Support Ticket",
        "use_case": "Direct support desk allowing tenant admins to submit issue tickets, request features, and track resolution status.",
        "how_to": "Click 'Support' in the sidebar. Open the 'Submit Ticket' tab, specify priority and category, describe your issue, and submit."
    },
    "agent_dashboard_summary.png": {
        "title": "Agent Manual - Personal Dashboard",
        "use_case": "Focused daily workspace showing an agent's assigned active deals, contacts, personal stage funnel, and upcoming tasks.",
        "how_to": "Agents log in to see their personal deal funnel, active customer count, and prioritized tasks scheduled for the day."
    },
    "agent_leads_list.png": {
        "title": "Agent Manual - Assigned Leads",
        "use_case": "Filtered leads view showing only the prospects assigned to the logged-in agent, preventing cross-team clutter.",
        "how_to": "Agents open 'Leads' to work through their assigned queue, update contact statuses, and advance prospects to deals."
    },
    "agent_deals_board.png": {
        "title": "Agent Manual - Assigned Deals Pipeline",
        "use_case": "Personalized Kanban board displaying only the deals owned by the agent to track quota progression.",
        "how_to": "Agents drag and drop their deals across stages as client negotiations progress from New Lead to Closed Won."
    },
    "agent_contact_profile.png": {
        "title": "Agent Manual - Contact Profile View",
        "use_case": "Enables agents to view contact details, open deals, and call history, and quickly trigger calls or emails.",
        "how_to": "Click on an assigned contact to view their details, click 'Call' to launch dialer, or check past activity history."
    },
    "agent_calendar.png": {
        "title": "Agent Manual - Personal Calendar",
        "use_case": "Personal scheduling hub displaying upcoming meetings, client demos, and task deadlines assigned to the agent.",
        "how_to": "Agents check 'Calendar' to plan their weekly outreach, create reminder tasks, and join scheduled client calls."
    },
    "agent_whatsapp_chat.png": {
        "title": "Agent Manual - WhatsApp Client Chat",
        "use_case": "Direct WhatsApp messaging interface for agents to communicate with their assigned leads and customer contacts.",
        "how_to": "Select a customer in 'Conversations' to send WhatsApp replies, share details, and maintain ongoing relationships."
    },
    "agent_teammates_chat.png": {
        "title": "Agent Manual - Teammates Chat",
        "use_case": "Internal team collaboration channel allowing agents to message managers or peer agents for fast help and deal support.",
        "how_to": "Click 'Internal Chat' to message admins or teammates, ask questions about deals, or request manager approval."
    },
    "agent_quick_dialer.png": {
        "title": "Agent Manual - In-Browser Quick Dialer",
        "use_case": "Instant phone dialer enabling agents to make high-volume calls directly from their browser with zero hardware required.",
        "how_to": "Click the dialer icon or click any contact phone number to automatically dial and conduct client phone calls."
    },
    "agent_profile_settings.png": {
        "title": "Agent Manual - Profile Settings",
        "use_case": "Self-service settings screen allowing agents to update their display name, email, and view their assigned permissions.",
        "how_to": "Navigate to 'Settings' to review your assigned agent role, verify active permissions, and manage profile information."
    },
    "agent_change_password.png": {
        "title": "Agent Manual - Change Password",
        "use_case": "Secure password management tool allowing agents to update their account credentials periodically.",
        "how_to": "In Settings, scroll to 'Change Password', enter your current password, type your new password, and click Save Changes."
    }
}

# 3. Build Presentation with Smart Bounding Box Aspect Ratio Scaling
prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)

def add_title_slide(title, subtitle):
    slide_layout = prs.slide_layouts[0]
    slide = prs.slides.add_slide(slide_layout)
    slide.shapes.title.text = title
    slide.placeholders[1].text = subtitle

def add_section_slide(title):
    slide_layout = prs.slide_layouts[2]
    slide = prs.slides.add_slide(slide_layout)
    slide.shapes.title.text = title

def add_content_slide(title, use_case, how_to, img_path):
    slide_layout = prs.slide_layouts[5] # Title Only
    slide = prs.slides.add_slide(slide_layout)
    
    # Title
    title_shape = slide.shapes.title
    title_shape.text = title
    title_shape.left = Inches(0.6)
    title_shape.top = Inches(0.3)
    title_shape.width = Inches(12.133)
    title_shape.height = Inches(0.8)
    
    # Left Text Box
    left = Inches(0.6)
    top = Inches(1.3)
    width = Inches(4.8)
    height = Inches(5.8)
    
    txBox = slide.shapes.add_textbox(left, top, width, height)
    tf = txBox.text_frame
    tf.word_wrap = True
    
    p1 = tf.paragraphs[0]
    p1.text = "What is it used for?"
    p1.font.bold = True
    p1.font.size = Pt(18)
    p1.font.color.rgb = RGBColor(30, 58, 138) # Navy Blue
    
    p2 = tf.add_paragraph()
    p2.text = use_case
    p2.font.size = Pt(14)
    p2.space_after = Pt(14)
    
    p3 = tf.add_paragraph()
    p3.text = "How to use it:"
    p3.font.bold = True
    p3.font.size = Pt(18)
    p3.font.color.rgb = RGBColor(30, 58, 138)
    
    p4 = tf.add_paragraph()
    p4.text = how_to
    p4.font.size = Pt(14)

    # Right Image Bounding Box: (left=5.6, top=1.3, max_width=7.2, max_height=5.8)
    if os.path.exists(img_path):
        box_left = Inches(5.6)
        box_top = Inches(1.3)
        box_w = Inches(7.2)
        box_h = Inches(5.8)
        
        # Read exact image dimensions
        img = Image.open(img_path)
        img_w, img_h = img.size
        img_aspect = img_w / img_h
        box_aspect = box_w / box_h
        
        if img_aspect > box_aspect:
            # Wider than bounding box -> clamp to box_w
            fit_w = box_w
            fit_h = box_w / img_aspect
        else:
            # Taller than bounding box -> clamp to box_h
            fit_h = box_h
            fit_w = box_h * img_aspect
            
        # Center horizontally and vertically inside the bounding box
        final_left = box_left + (box_w - fit_w) / 2
        final_top = box_top + (box_h - fit_h) / 2
        
        slide.shapes.add_picture(img_path, final_left, final_top, width=fit_w, height=fit_h)

add_title_slide("CRM Enterprise Application", "Complete Visual User Manual & Operations Guide")

# Section 1: Tenant Admin Manual
add_section_slide("Part 1: Tenant Admin Operations Manual")
admin_keys = [k for k in content_map.keys() if k.startswith("admin_")]
for fname in admin_keys:
    fpath = os.path.join(folder, fname)
    info = content_map[fname]
    add_content_slide(info["title"], info["use_case"], info["how_to"], fpath)

# Section 2: Agent Manual
add_section_slide("Part 2: Sales Agent Operations Manual")
agent_keys = [k for k in content_map.keys() if k.startswith("agent_")]
for fname in agent_keys:
    fpath = os.path.join(folder, fname)
    info = content_map[fname]
    add_content_slide(info["title"], info["use_case"], info["how_to"], fpath)

prs.save(output_file)
print(f"Final presentation generated and saved to {output_file}!")
