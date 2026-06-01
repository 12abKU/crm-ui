import { T } from '../constants/theme'
import CustomSelect from './ui/CustomSelect'

export const Field = ({ label, error, children }) => (
    <div className="flex flex-col gap-1.5">
        <label className="text-[11px] font-bold uppercase tracking-widest" style={{ color: T.textMuted }}>
            {label}
        </label>
        {children}
        {error && (
            <span className="text-[11px] font-semibold leading-snug" style={{ color: T.error }}>
                {error}
            </span>
        )}
    </div>
)

export const Input = ({ label, error, ...props }) => (
    <Field label={label} error={error}>
        <input 
            className="crm-input transition-all duration-150" 
            style={error ? { borderColor: T.error, boxShadow: `0 0 0 3px ${T.error}15` } : {}}
            {...props} 
        />
    </Field>
)

export const Select = ({ label, error, children, ...props }) => (
    <Field label={label} error={error}>
        <CustomSelect 
            className="crm-select transition-all duration-150" 
            style={error ? { borderColor: T.error, boxShadow: `0 0 0 3px ${T.error}15` } : {}}
            {...props}
        >
            {children}
        </CustomSelect>
    </Field>
)

export const Textarea = ({ label, error, ...props }) => (
    <Field label={label} error={error}>
        <textarea 
            className="crm-input min-h-24 resize-y transition-all duration-150" 
            style={error ? { borderColor: T.error, boxShadow: `0 0 0 3px ${T.error}15` } : {}}
            {...props} 
        />
    </Field>
)
