import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import TopBar from '../components/TopBar'
import api from '../api'
import { EMPTY_FORM } from '../components/support/supportConstants'
import SupportHeader from '../components/support/SupportHeader'
import SupportTabs from '../components/support/SupportTabs'
import FaqTab from '../components/support/FaqTab'
import SubmitTicketTab from '../components/support/SubmitTicketTab'
import TicketList from '../components/support/TicketList'
import ContactTab from '../components/support/ContactTab'

export default function Support() {
    const role = useSelector(s => s.auth.role)
    const name = useSelector(s => s.auth.name)
    const email = useSelector(s => s.auth.email)
    const companyName = useSelector(s => s.auth.companyName)
    const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'

    const [tab, setTab] = useState('faq')
    const [faq, setFaq] = useState([])
    const [faqSearch, setFaqSearch] = useState('')
    const [openFaq, setOpenFaq] = useState(null)
    const [myTickets, setMyTickets] = useState([])
    const [companyTickets, setCompanyTickets] = useState([])
    const [ticketsLoading, setTicketsLoading] = useState(false)
    const [badge, setBadge] = useState({})
    const [form, setForm] = useState(EMPTY_FORM)
    const [submitting, setSubmitting] = useState(false)
    const [submitSuccess, setSubmitSuccess] = useState(false)
    const [submitError, setSubmitError] = useState('')
    const [statusUpdating, setStatusUpdating] = useState(null)

    useEffect(() => {
        api.get('/api/support/faq').then(r => setFaq(r.data)).catch(() => { })
        api.get('/api/support/badge').then(r => setBadge(r.data)).catch(() => { })
    }, [])

    useEffect(() => {
        if (tab === 'tickets' || tab === 'team_tickets') loadTickets()
    }, [tab])

    const loadTickets = async () => {
        setTicketsLoading(true)
        try {
            const mine = await api.get('/api/support/tickets/mine')
            setMyTickets(mine.data)
            if (isAdmin) {
                const comp = await api.get('/api/support/tickets/company')
                setCompanyTickets(comp.data)
            }
        } catch { }
        finally { setTicketsLoading(false) }
    }

    const submitTicket = async (e) => {
        e.preventDefault()
        if (!form.subject || !form.description || !form.category) {
            setSubmitError('Please fill in all required fields.')
            return
        }
        setSubmitting(true)
        setSubmitError('')
        try {
            await api.post('/api/support/tickets', {
                subject: form.subject, description: form.description,
                category: form.category, priority: form.priority,
            })
            setSubmitSuccess(true)
            setForm(EMPTY_FORM)
            api.get('/api/support/badge').then(r => setBadge(r.data)).catch(() => { })
        } catch (err) {
            setSubmitError(err?.userMessage || 'Failed to submit ticket. Please try again.')
        } finally { setSubmitting(false) }
    }

    const updateTicketStatus = async (ticketId, status) => {
        setStatusUpdating(ticketId)
        try {
            await api.patch(`/api/support/tickets/${ticketId}/status`, { status })
            loadTickets()
            api.get('/api/support/badge').then(r => setBadge(r.data)).catch(() => { })
        } catch { }
        finally { setStatusUpdating(null) }
    }

    const goToSubmit = (subject = '') => {
        setTab('submit')
        if (subject) setForm(f => ({ ...f, subject }))
    }

    return (
        <div>
            <TopBar />
            <main className="p-8 max-w-360 mx-auto">
                <SupportHeader isAdmin={isAdmin} companyName={companyName} badge={badge} />
                <SupportTabs tab={tab} setTab={setTab} badge={badge} isAdmin={isAdmin} />

                {tab === 'faq' && (
                    <FaqTab
                        faq={faq} faqSearch={faqSearch} setFaqSearch={setFaqSearch}
                        openFaq={openFaq} setOpenFaq={setOpenFaq}
                        onSubmitTicket={goToSubmit}
                    />
                )}

                {tab === 'submit' && (
                    <SubmitTicketTab
                        form={form} setForm={setForm}
                        submitting={submitting} submitSuccess={submitSuccess} submitError={submitError}
                        onSubmit={submitTicket}
                        onViewTickets={() => setTab('tickets')}
                        onSubmitAnother={() => setSubmitSuccess(false)}
                        name={name} email={email} companyName={companyName}
                    />
                )}

                {tab === 'tickets' && (
                    <TicketList
                        tickets={myTickets} loading={ticketsLoading}
                        title="My Tickets" emptyMsg="You haven't submitted any tickets yet."
                        isAdmin={false} onStatusChange={null}
                        statusUpdating={statusUpdating} onSubmit={() => goToSubmit()}
                    />
                )}

                {tab === 'team_tickets' && isAdmin && (
                    <TicketList
                        tickets={companyTickets} loading={ticketsLoading}
                        title={`All Company Tickets · ${badge.companyOpenTickets ?? 0} open`}
                        emptyMsg="No tickets submitted by your team yet."
                        isAdmin={true} onStatusChange={role === 'SUPER_ADMIN' ? updateTicketStatus : null}
                        statusUpdating={statusUpdating} onSubmit={() => goToSubmit()}
                    />
                )}

                {tab === 'contact' && <ContactTab />}
            </main>
        </div>
    )
}