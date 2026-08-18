import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor

def create_presentation(image_dir, output_file):
    prs = Presentation()
    
    # 16:9 Aspect Ratio
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    def add_title_slide(title, subtitle):
        slide_layout = prs.slide_layouts[0]
        slide = prs.slides.add_slide(slide_layout)
        slide.shapes.title.text = title
        slide.placeholders[1].text = subtitle

    def add_section_slide(title):
        slide_layout = prs.slide_layouts[2] # Section Header
        slide = prs.slides.add_slide(slide_layout)
        slide.shapes.title.text = title

    def add_content_slide(title, use_case, how_to, img_path):
        slide_layout = prs.slide_layouts[5] # Title Only
        slide = prs.slides.add_slide(slide_layout)
        
        # Title
        title_shape = slide.shapes.title
        title_shape.text = title
        title_shape.left = Inches(0.5)
        title_shape.top = Inches(0.2)
        title_shape.width = Inches(12.333)
        title_shape.height = Inches(1.0)
        
        # Text Box (Left Side)
        left = Inches(0.5)
        top = Inches(1.5)
        width = Inches(5.0)
        height = Inches(5.5)
        
        txBox = slide.shapes.add_textbox(left, top, width, height)
        tf = txBox.text_frame
        tf.word_wrap = True
        
        # Use Case
        p1 = tf.paragraphs[0]
        p1.text = "What is it used for?"
        p1.font.bold = True
        p1.font.size = Pt(20)
        p1.font.color.rgb = RGBColor(30, 58, 138) # Blue
        
        p2 = tf.add_paragraph()
        p2.text = use_case
        p2.font.size = Pt(16)
        
        p_space = tf.add_paragraph()
        p_space.text = ""
        
        # How to use
        p3 = tf.add_paragraph()
        p3.text = "How to use it:"
        p3.font.bold = True
        p3.font.size = Pt(20)
        p3.font.color.rgb = RGBColor(30, 58, 138)
        
        p4 = tf.add_paragraph()
        p4.text = how_to
        p4.font.size = Pt(16)

        # Image (Right Side)
        if os.path.exists(img_path):
            img_left = Inches(5.8)
            img_top = Inches(1.5)
            # Max width and height for image
            max_width = Inches(7.0)
            max_height = Inches(5.5)
            
            # Add picture and let pptx automatically scale it if we only provide one dimension
            # We'll provide width and let height auto-adjust, but if it overflows, we can bound it.
            # A safer way in python-pptx to fit within bounds is just to specify height or width.
            slide.shapes.add_picture(img_path, img_left, img_top, width=max_width)

    # Content Mapping
    content_map = {
        "admin_dashboard_summary.png": {
            "title": "Admin Dashboard - Summary",
            "use_case": "Provides a bird's-eye view of your entire CRM's health, including total revenue, active deals, and upcoming tasks.",
            "how_to": "Navigate to 'Dashboard' from the sidebar. Use the Summary tab to quickly check your daily metrics and prioritize your tasks for the day."
        },
        "admin_dashboard_revenue.png": {
            "title": "Admin Dashboard - Revenue",
            "use_case": "Tracks financial performance, closed won deals, and revenue pipelines across your team.",
            "how_to": "Click the 'Revenue' tab on the Dashboard. Review the charts to see revenue trends over time and compare against your company goals."
        },
        "admin_dashboard_deals.png": {
            "title": "Admin Dashboard - Deals Analytics",
            "use_case": "Breaks down active deals by stage, value, and probability of closing.",
            "how_to": "Click the 'Deals' tab on the Dashboard. Use this to identify which deals need immediate attention to prevent them from going stale."
        },
        "admin_dashboard_contacts.png": {
            "title": "Admin Dashboard - Contacts Analytics",
            "use_case": "Visualizes the growth of your contact database and engagement levels.",
            "how_to": "Click the 'Contacts' tab. This helps in understanding lead generation velocity and contact acquisition rates."
        },
        "admin_dashboard_activities.png": {
            "title": "Admin Dashboard - Activities",
            "use_case": "Monitors the volume of calls, emails, and meetings executed by your team.",
            "how_to": "Click the 'Activities' tab to review whether your agents are hitting their daily outreach targets."
        },
        "admin_dashboard_bottlenecks.png": {
            "title": "Admin Dashboard - Bottlenecks",
            "use_case": "Identifies where deals are getting stuck in your sales pipeline.",
            "how_to": "Click the 'Bottlenecks' tab. Look for stages with high drop-off rates or slow progression to optimize your sales process."
        },
        "admin_dashboard_team.png": {
            "title": "Admin Dashboard - Team Performance",
            "use_case": "Compares individual agent performance, activities logged, and deals closed.",
            "how_to": "Click the 'Team' tab to see a leaderboard of your top-performing agents and identify who might need additional coaching."
        },
        "admin_leads_list.png": {
            "title": "Leads Management - List View",
            "use_case": "The central repository for all unqualified prospects and newly acquired leads.",
            "how_to": "Navigate to 'Leads' in the sidebar. Use the search bar to find specific leads, or click a lead's name to open their profile."
        },
        "admin_lead_add_form.png": {
            "title": "Leads Management - Add New Lead",
            "use_case": "Allows you to manually enter new prospects into the CRM.",
            "how_to": "Click the 'Add Lead' button on the Leads page. Fill in the required contact information and source, then click Save."
        },
        "admin_lead_profile_overview.png": {
            "title": "Lead Profile - Overview",
            "use_case": "Displays all known information about a specific lead, including contact details and status.",
            "how_to": "Click on any lead from the list. Here you can edit details, add notes, or change the lead's status."
        },
        "admin_lead_convert_modal.png": {
            "title": "Leads Management - Convert Lead",
            "use_case": "Transforms a qualified lead into a Contact and an Account, moving them into the sales pipeline.",
            "how_to": "Open a Lead profile and click 'Convert'. Verify the new Account and Contact details, and optionally create a Deal simultaneously."
        },
        "admin_lead_assign_modal.png": {
            "title": "Leads Management - Assign Lead",
            "use_case": "Delegates a lead to a specific sales agent for follow-up.",
            "how_to": "Select a lead and click 'Assign'. Choose an agent from the dropdown list to transfer ownership."
        },
        "admin_contacts_list.png": {
            "title": "Contacts Management",
            "use_case": "Maintains a directory of all qualified individuals you do business with.",
            "how_to": "Navigate to 'Contacts'. You can filter, search, and click into profiles to view communication history."
        },
        "admin_contact_profile.png": {
            "title": "Contact Profile",
            "use_case": "A 360-degree view of a person, showing linked deals, activities, and communication history.",
            "how_to": "Use this page before calling a contact to get full context on previous interactions and pending deals."
        },
        "admin_accounts_list.png": {
            "title": "Accounts (Companies) Management",
            "use_case": "Manages the organizations and businesses you sell to (B2B).",
            "how_to": "Navigate to 'Accounts'. View all companies, their total value, and click to view all contacts associated with that company."
        },
        "admin_account_profile.png": {
            "title": "Account Profile",
            "use_case": "Consolidates all contacts, deals, and notes related to a single company.",
            "how_to": "Use this view when executing Account-Based Marketing (ABM) or preparing for a major corporate pitch."
        },
        "admin_deduplication_page.png": {
            "title": "Data Quality - De-Duplication",
            "use_case": "Scans your CRM for duplicate contacts and leads to keep your data clean.",
            "how_to": "Navigate to '/de-duplication'. Review the AI-suggested duplicates and decide whether to merge them."
        },
        "admin_deduplication_page_merge_ui.png": {
            "title": "Data Quality - Merge UI",
            "use_case": "Allows you to manually combine two duplicate records, choosing which data to keep.",
            "how_to": "Click 'Merge' on a duplicate pair. Select the winning fields (e.g., the most recent phone number) and confirm the merge."
        },
        "admin_deals_kanban_board.png": {
            "title": "Deals & Pipelines - Kanban Board",
            "use_case": "Provides a visual representation of your sales process and where every deal currently stands.",
            "how_to": "Navigate to 'Deals'. Drag and drop deal cards from one stage to the next as the sale progresses."
        },
        "admin_deal_add_form.png": {
            "title": "Deals - Add New Deal",
            "use_case": "Creates a new sales opportunity linked to a Contact or Account.",
            "how_to": "Click 'Add Deal'. Specify the deal value, expected close date, and the starting pipeline stage."
        },
        "admin_deal_lost_reason_modal.png": {
            "title": "Deals - Lost Reason tracking",
            "use_case": "Captures why a deal fell through so you can improve your sales strategy.",
            "how_to": "When moving a deal to the 'Lost' stage, you will be prompted to select a reason (e.g., 'Price too high') and add notes."
        },
        "admin_deal_profile_overview.png": {
            "title": "Deal Profile - Overview",
            "use_case": "Shows the core details of a specific deal, its value, and the key decision-makers.",
            "how_to": "Click on any deal card. Use this page to update the deal amount or expected close date."
        },
        "admin_deal_profile_journey.png": {
            "title": "Deal Profile - Journey & Timeline",
            "use_case": "Tracks exactly how long a deal has spent in each pipeline stage.",
            "how_to": "Click the 'Journey' tab inside a deal. Use this to identify if a deal is stalling in a specific phase."
        },
        "admin_deal_profile_activities.png": {
            "title": "Deal Profile - Activities",
            "use_case": "Lists all calls, meetings, and tasks specifically related to closing this deal.",
            "how_to": "Click the 'Activities' tab to log a new call or schedule a follow-up meeting for this specific deal."
        },
        "admin_deal_profile_conversation.png": {
            "title": "Deal Profile - Conversations",
            "use_case": "Consolidates all emails and WhatsApp messages exchanged regarding this deal.",
            "how_to": "Use this tab to quickly reply to a prospect without losing the context of the deal."
        },
        "admin_activities_list.png": {
            "title": "Activities Management",
            "use_case": "A master list of all tasks, calls, and meetings across the entire CRM.",
            "how_to": "Navigate to 'Activities'. Filter by overdue tasks to ensure nothing slips through the cracks."
        },
        "admin_activity_profile.png": {
            "title": "Activity Details",
            "use_case": "Shows the specifics of a single task or meeting, including outcomes.",
            "how_to": "Click on a task. Once you complete the task, mark it as 'Done' and add your outcome notes."
        },
        "admin_calendar_view.png": {
            "title": "Calendar View",
            "use_case": "Visualizes all your upcoming meetings and deadlines in a monthly or weekly layout.",
            "how_to": "Navigate to 'Calendar'. Click on any day to instantly schedule a new meeting or task."
        },
        "admin_conversations_whatsapp.png": {
            "title": "Omnichannel - WhatsApp Conversations",
            "use_case": "Allows you to chat with clients over WhatsApp directly from the CRM.",
            "how_to": "Navigate to 'Conversations'. Select a chat thread to send messages, templates, and media."
        },
        "admin_conversations_email.png": {
            "title": "Omnichannel - Email",
            "use_case": "Manage inbound and outbound emails without leaving the CRM.",
            "how_to": "Use the Conversations or Contact profile to draft emails, apply templates, and track opens."
        },
        "admin_teammates_chat.png": {
            "title": "Internal Teammates Chat",
            "use_case": "Facilitates instant messaging between you and your colleagues.",
            "how_to": "Navigate to 'Internal Chat'. Select an agent to ask for help on a deal or share updates privately."
        },
        "admin_calls_list.png": {
            "title": "Voice Calling - Call Logs",
            "use_case": "Maintains a historical record of all inbound and outbound phone calls.",
            "how_to": "Navigate to 'Calls'. Review call durations, recordings (if enabled), and agent performance."
        },
        "admin_quick_dialer.png": {
            "title": "Voice Calling - Quick Dialer",
            "use_case": "A built-in softphone to make calls directly through your browser via Twilio.",
            "how_to": "Click the phone icon anywhere in the CRM to open the dialer and initiate a call instantly."
        },
        "admin_documents_list.png": {
            "title": "Document Management",
            "use_case": "A central repository for all proposals, contracts, and marketing materials.",
            "how_to": "Navigate to 'Documents'. Upload files here and attach them to specific Deals or Contacts."
        },
        "admin_document_preview.png": {
            "title": "Document Preview",
            "use_case": "Allows you to read documents (like PDFs) directly in the browser without downloading them.",
            "how_to": "Click on a document name to open the preview modal before sending it to a client."
        },
        "admin_settings_agent_management.png": {
            "title": "Settings - Agent Management",
            "use_case": "Controls who has access to your CRM and their basic roles.",
            "how_to": "Navigate to 'Settings' -> 'Agent Management'. Invite new users via email or disable former employees."
        },
        "admin_settings_permission_editor.png": {
            "title": "Settings - Permission Editor",
            "use_case": "Granularly defines exactly what each user role can see and do.",
            "how_to": "Use this to prevent Agents from exporting data or deleting records, ensuring data security."
        },
        "admin_settings_pipeline.png": {
            "title": "Settings - Pipeline Configuration",
            "use_case": "Customizes the stages of your sales pipeline to match your actual sales process.",
            "how_to": "Navigate to 'Settings' -> 'Pipelines'. Add, remove, or rename stages (e.g., 'Negotiation', 'Contract Sent')."
        },
        "admin_settings_app_integrations.png": {
            "title": "Settings - App Integrations",
            "use_case": "Connects your CRM to external tools like Gmail, Google Calendar, and Twilio.",
            "how_to": "Navigate to 'Settings' -> 'Integrations'. Click 'Connect' and follow the OAuth prompts to link your accounts."
        },
        "admin_settings_email_templates.png": {
            "title": "Settings - Email Templates",
            "use_case": "Saves pre-written emails so your team can send consistent messages rapidly.",
            "how_to": "Navigate to 'Settings' -> 'Email Templates'. Create templates for common scenarios like 'Welcome' or 'Follow-up'."
        },
        "admin_settings_automated_sequences.png": {
            "title": "Settings - Automated Sequences",
            "use_case": "Creates rule-based workflows (e.g., 'If Deal is Won, send Welcome Email').",
            "how_to": "Navigate to 'Settings' -> 'Automated Sequences'. Define triggers, conditions, and actions to automate busywork."
        },
        "admin_audit_logs.png": {
            "title": "Compliance - Audit Logs",
            "use_case": "A tamper-proof record of every action taken by every user in the system.",
            "how_to": "Navigate to 'Audit Logs' to investigate who deleted a record or when a critical setting was changed."
        },
        "admin_privacy_compliance.png": {
            "title": "Privacy & Compliance",
            "use_case": "Manages GDPR/CCPA data requests, consent tracking, and breach notifications.",
            "how_to": "Navigate to 'Privacy'. Use this to export a contact's data upon request or register a privacy incident."
        },
        "admin_support_submit_ticket.png": {
            "title": "Help & Support",
            "use_case": "Allows you to get technical assistance from the CRM platform administrators.",
            "how_to": "Navigate to 'Support'. Fill out the form with your issue details and attach screenshots if necessary."
        },
        "agent_dashboard_summary.png": {
            "title": "Agent Dashboard",
            "use_case": "A focused view for sales representatives showing ONLY their assigned work and targets.",
            "how_to": "Agents log in and immediately see their tasks for the day and their progress towards their quota."
        },
        "agent_leads_list.png": {
            "title": "Agent View - Leads",
            "use_case": "Restricts visibility so agents only see leads they are responsible for.",
            "how_to": "Agents use this list to systematically call and qualify their assigned prospects."
        },
        "agent_deals_board.png": {
            "title": "Agent View - Deals Board",
            "use_case": "Allows agents to manage their own sales pipeline without clutter from other agents' deals.",
            "how_to": "Agents drag and drop their assigned deals to keep their pipeline up to date."
        },
        "agent_contact_profile.png": {
            "title": "Agent View - Contact Profile",
            "use_case": "Provides the agent with the necessary context to communicate effectively with a contact.",
            "how_to": "Agents review past notes and add new ones after every interaction."
        },
        "agent_calendar.png": {
            "title": "Agent View - Calendar",
            "use_case": "Helps agents organize their personal schedule and upcoming client meetings.",
            "how_to": "Agents sync their personal Google Calendar to ensure they never miss a meeting."
        },
        "agent_whatsapp_chat.png": {
            "title": "Agent View - WhatsApp",
            "use_case": "Allows agents to chat directly with their leads via WhatsApp.",
            "how_to": "Agents open the conversation thread and reply to inbound client questions instantly."
        },
        "agent_teammates_chat.png": {
            "title": "Agent View - Teammates Chat",
            "use_case": "Enables agents to ask managers for approval or help on a deal.",
            "how_to": "Agents use the internal chat to collaborate without leaving the CRM environment."
        },
        "agent_quick_dialer.png": {
            "title": "Agent View - Quick Dialer",
            "use_case": "Allows agents to power through a list of calls efficiently.",
            "how_to": "Agents click the phone icon to call contacts directly from their browser."
        },
        "agent_profile_settings.png": {
            "title": "Agent Profile Settings",
            "use_case": "Allows agents to update their personal information and display picture.",
            "how_to": "Agents navigate to 'Settings' to update their name, email, and preferences."
        },
        "agent_change_password.png": {
            "title": "Agent Change Password",
            "use_case": "Ensures account security by allowing agents to manage their credentials.",
            "how_to": "Agents navigate to 'Settings', enter their old password, and securely set a new one."
        }
    }

    add_title_slide("CRM Application", "Comprehensive User Manual")
    
    # Process Admin Slides First
    add_section_slide("Part 1: Tenant Admin Manual")
    admin_files = [f for f in content_map.keys() if f.startswith("admin_")]
    for filename in admin_files:
        img_path = os.path.join(image_dir, filename)
        info = content_map[filename]
        add_content_slide(info["title"], info["use_case"], info["how_to"], img_path)

    # Process Agent Slides Next
    add_section_slide("Part 2: Agent Manual")
    agent_files = [f for f in content_map.keys() if f.startswith("agent_")]
    for filename in agent_files:
        img_path = os.path.join(image_dir, filename)
        info = content_map[filename]
        add_content_slide(info["title"], info["use_case"], info["how_to"], img_path)

    prs.save(output_file)
    print(f"Presentation saved successfully to {output_file}")

if __name__ == "__main__":
    image_dir = r"d:\Desktop\crm-screenshots"
    output_file = r"d:\Desktop\crm-screenshots\Final_CRM_User_Manual.pptx"
    create_presentation(image_dir, output_file)
