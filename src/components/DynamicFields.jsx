import React, { useEffect, useState } from 'react';
import api from '../api';
import { Input, Select } from './FormField';

export default function DynamicFields({ entityType, values = {}, onChange }) {
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        api.get(`/api/crm-fields?entityType=${entityType}`)
            .then(res => {
                if (isMounted) {
                    setFields(res.data);
                    setLoading(false);
                }
            })
            .catch(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, [entityType]);

    if (loading) return <div className="text-sm text-t-secondary animate-pulse">Loading custom fields...</div>;
    if (fields.length === 0) return null;

    return (
        <div className="space-y-4">
            <h4 className="font-medium text-t-primary border-b border-t-divider pb-2 mb-4">Custom Fields</h4>
            {fields.map(field => {
                const value = values[field.fieldKey] || '';
                const handleChange = (e) => {
                    onChange(field.fieldKey, e.target.value);
                };

                if (field.fieldType === 'NUMBER') {
                    return (
                        <Input
                            key={field.id}
                            type="number"
                            label={field.fieldLabel}
                            value={value}
                            onChange={handleChange}
                            required={field.required}
                        />
                    );
                }
                
                if (field.fieldType === 'DROPDOWN') {
                    const options = Array.isArray(field.options?.choices) 
                        ? field.options.choices 
                        : [];
                    return (
                        <Select
                            key={field.id}
                            label={field.fieldLabel}
                            value={value}
                            onChange={handleChange}
                            required={field.required}
                        >
                            <option value="">Select {field.fieldLabel}</option>
                            {options.map((opt, i) => (
                                <option key={i} value={opt}>{opt}</option>
                            ))}
                        </Select>
                    );
                }

                if (field.fieldType === 'DATE') {
                    return (
                        <Input
                            key={field.id}
                            type="date"
                            label={field.fieldLabel}
                            value={value}
                            onChange={handleChange}
                            required={field.required}
                        />
                    );
                }

                return (
                    <Input
                        key={field.id}
                        type="text"
                        label={field.fieldLabel}
                        value={value}
                        onChange={handleChange}
                        required={field.required}
                    />
                );
            })}
        </div>
    );
}
