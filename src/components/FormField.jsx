import { T } from '../constants/theme'
import CustomSelect from './ui/CustomSelect'

export const Field = ({ label, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
            {label}
        </label>
        {children}
    </div>
)

export const Input = ({ label, ...props }) => (
    <Field label={label}>
        <input className="crm-input" {...props} />
    </Field>
)

export const Select = ({ label, children, ...props }) => (
    <Field label={label}>
        <CustomSelect className="crm-select" {...props}>{children}</CustomSelect>
    </Field>
)

export const Textarea = ({ label, ...props }) => (
    <Field label={label}>
        <textarea className="crm-input min-h-24 resize-y" {...props} />
    </Field>
)
