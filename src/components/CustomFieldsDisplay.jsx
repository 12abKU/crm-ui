import React, { useEffect, useState } from 'react';
import api from '../api';
import { T } from '../constants/theme';

export default function CustomFieldsDisplay({ entityType, values = {}, renderWrapper, FieldComponent }) {
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

    if (loading || fields.length === 0) return null;

    const children = fields.map(field => {
        const val = values[field.fieldKey];
        return (
            <FieldComponent key={field.id} label={field.fieldLabel} value={String(val || 'No value')} />
        );
    });

    if (renderWrapper) {
        return renderWrapper(children);
    }

    return (
        <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: T.textMuted }}>
                Custom Fields
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {children}
            </div>
        </div>
    );
}
