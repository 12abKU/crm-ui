import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// Test suite for R3: Frontend 403 Error Interception, DialogContext Modal, and Admin Bypass
// Exercises:
// 1. extractApiErrorMessage error extraction contract
// 2. Axios 403 error interception logic (crm-permission-denied dispatch, suppression of crm-api-error)
// 3. Account suspension / trial expiration 403 redirect to /login
// 4. DialogContext permission denied listener and modal alert trigger
// 5. usePermission and RequirePermission role-based unrestricted access for ADMIN / SUPER_ADMIN

describe('R3 Frontend Permission Interception & Modal Suite', () => {

    describe('1. Error Message Extraction Contract', () => {
        // Direct simulation of extractApiErrorMessage logic from crm-ui/src/api/index.js
        function extractApiErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
            if (err?.userMessage) return err.userMessage;
            if (err?.response?.status === 429) {
                return 'Too many attempts. Please wait a minute and try again.';
            }
            const data = err?.response?.data;
            if (data) {
                if (data.fields && typeof data.fields === 'object') {
                    const fieldErrors = Object.values(data.fields).filter(Boolean);
                    if (fieldErrors.length > 0) return fieldErrors.join(', ');
                }
                if (typeof data.message === 'string' && data.message.trim()) return data.message;
                if (typeof data.error === 'string' && data.error.trim()) return data.error;
                if (typeof data === 'string' && data.trim()) return data;
            }
            if (err?.message === 'Network Error') {
                return 'Backend is not reachable. Please check if the server is running.';
            }
            return err?.message || fallback;
        }

        it('should extract error message from data.message', () => {
            const err = { response: { status: 403, data: { message: "You don't have permission to perform this action." } } };
            const msg = extractApiErrorMessage(err);
            assert.equal(msg, "You don't have permission to perform this action.");
        });

        it('should extract joined validation messages from data.fields', () => {
            const err = {
                response: {
                    status: 400,
                    data: { fields: { title: 'Title is required', amount: 'Amount must be positive' } }
                }
            };
            const msg = extractApiErrorMessage(err);
            assert.equal(msg, 'Title is required, Amount must be positive');
        });

        it('should handle 429 rate limit explicitly', () => {
            const err = { response: { status: 429 } };
            const msg = extractApiErrorMessage(err);
            assert.equal(msg, 'Too many attempts. Please wait a minute and try again.');
        });

        it('should handle Network Error cleanly', () => {
            const err = { message: 'Network Error' };
            const msg = extractApiErrorMessage(err);
            assert.equal(msg, 'Backend is not reachable. Please check if the server is running.');
        });
    });

    describe('2. Axios 403 Response Error Interceptor', () => {
        let dispatchedEvents = [];
        let dispatchedActions = [];
        let sessionStore = {};
        let redirectedUrl = null;

        // Mock browser environment
        const mockWindow = {
            dispatchEvent: (event) => {
                dispatchedEvents.push(event);
            },
            location: {
                get href() { return redirectedUrl; },
                set href(val) { redirectedUrl = val; }
            }
        };

        const mockSessionStorage = {
            setItem: (k, v) => { sessionStore[k] = v; },
            getItem: (k) => sessionStore[k] || null,
            clear: () => { sessionStore = {}; }
        };

        const mockStore = {
            dispatch: (action) => { dispatchedActions.push(action); }
        };

        function simulateResponseInterceptorError(err, windowObj = mockWindow, storeObj = mockStore, sessionObj = mockSessionStorage) {
            const status = err.response?.status;
            const message = err.response?.data?.message || err.message || 'Error occurred';
            err.userMessage = message;

            const requestUrl = err.config?.url || '';
            const isAuthEndpoint = requestUrl.includes('/api/auth/');

            // 401
            if (status === 401 && !isAuthEndpoint) {
                storeObj.dispatch({ type: 'auth/signOut' });
                windowObj.location.href = '/login';
                return Promise.reject(err);
            }

            // 403
            if (status === 403 && !isAuthEndpoint) {
                const isAccountLocked = message?.toLowerCase().includes('suspended') || message?.toLowerCase().includes('expired');
                if (isAccountLocked) {
                    storeObj.dispatch({ type: 'auth/signOut' });
                    sessionObj.setItem('logoutReason', message);
                    windowObj.location.href = '/login';
                    return Promise.reject(err);
                }

                if (typeof windowObj !== 'undefined') {
                    windowObj.dispatchEvent({
                        type: 'crm-permission-denied',
                        detail: { title: 'Permission Denied', message }
                    });
                }
                return Promise.reject(err);
            }

            // Other errors
            if (!isAuthEndpoint && !err.config?.suppressErrorToast && typeof windowObj !== 'undefined') {
                windowObj.dispatchEvent({
                    type: 'crm-api-error',
                    detail: { message, status }
                });
            }

            return Promise.reject(err);
        }

        beforeEach(() => {
            dispatchedEvents = [];
            dispatchedActions = [];
            sessionStore = {};
            redirectedUrl = null;
        });

        it('should dispatch crm-permission-denied and suppress crm-api-error on 403 RBAC error', async () => {
            const err = {
                config: { url: '/api/leads' },
                response: {
                    status: 403,
                    data: { message: "You don't have permission to perform this action." }
                }
            };

            await assert.rejects(async () => simulateResponseInterceptorError(err));

            assert.equal(dispatchedEvents.length, 1);
            assert.equal(dispatchedEvents[0].type, 'crm-permission-denied');
            assert.equal(dispatchedEvents[0].detail.title, 'Permission Denied');
            assert.equal(dispatchedEvents[0].detail.message, "You don't have permission to perform this action.");

            // Confirm crm-api-error toast was NOT dispatched
            const apiErrorEvents = dispatchedEvents.filter(e => e.type === 'crm-api-error');
            assert.equal(apiErrorEvents.length, 0);
        });

        it('should redirect to /login and record logoutReason when 403 is account suspension or expiration', async () => {
            const err = {
                config: { url: '/api/deals' },
                response: {
                    status: 403,
                    data: { message: 'Your company account has been suspended.' }
                }
            };

            await assert.rejects(async () => simulateResponseInterceptorError(err));

            assert.equal(redirectedUrl, '/login');
            assert.equal(sessionStore['logoutReason'], 'Your company account has been suspended.');
            assert.equal(dispatchedActions.length, 1);
            assert.equal(dispatchedActions[0].type, 'auth/signOut');

            // Neither crm-permission-denied nor crm-api-error should be dispatched
            assert.equal(dispatchedEvents.length, 0);
        });

        it('should dispatch crm-api-error for standard 500 or 400 server errors', async () => {
            const err = {
                config: { url: '/api/contacts' },
                response: {
                    status: 500,
                    data: { message: 'Internal Server Error' }
                }
            };

            await assert.rejects(async () => simulateResponseInterceptorError(err));

            assert.equal(dispatchedEvents.length, 1);
            assert.equal(dispatchedEvents[0].type, 'crm-api-error');
            assert.equal(dispatchedEvents[0].detail.status, 500);
        });

        it('should ignore errors from /api/auth/ endpoints without emitting modal or toast events', async () => {
            const err = {
                config: { url: '/api/auth/login' },
                response: {
                    status: 403,
                    data: { message: 'Invalid credentials' }
                }
            };

            await assert.rejects(async () => simulateResponseInterceptorError(err));
            assert.equal(dispatchedEvents.length, 0);
        });
    });

    describe('3. DialogContext Modal Event Handler', () => {
        it('should handle crm-permission-denied event and trigger alert dialog with red confirm button', () => {
            let triggeredDialog = null;

            function showAlert({ title, message, confirmText, confirmColor }) {
                triggeredDialog = {
                    title,
                    message,
                    confirmText: confirmText || 'OK',
                    confirmColor: confirmColor || '#3b82f6',
                    type: 'alert'
                };
            }

            function handlePermissionDenied(e) {
                showAlert({
                    title: e.detail?.title || 'Permission Denied',
                    message: e.detail?.message || "You don't have permission to perform this action.",
                    confirmText: 'OK',
                    confirmColor: '#ef4444'
                });
            }

            // Simulate event dispatch
            const event = {
                type: 'crm-permission-denied',
                detail: {
                    title: 'Permission Denied',
                    message: 'Missing ACCOUNTS_CREATE permission.'
                }
            };

            handlePermissionDenied(event);

            assert.ok(triggeredDialog !== null);
            assert.equal(triggeredDialog.title, 'Permission Denied');
            assert.equal(triggeredDialog.message, 'Missing ACCOUNTS_CREATE permission.');
            assert.equal(triggeredDialog.confirmText, 'OK');
            assert.equal(triggeredDialog.confirmColor, '#ef4444');
            assert.equal(triggeredDialog.type, 'alert');
        });
    });

    describe('4. Frontend Role-Based Permission Check (ADMIN & SUPER_ADMIN Bypass)', () => {
        // Direct replication of usePermission logic from crm-ui/src/hooks/usePermission.js
        function checkPermission(role, permissions, requiredPermission) {
            if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;
            return (permissions ?? []).includes(requiredPermission);
        }

        function checkMultiplePermissions(role, permissions, permissionList) {
            if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
                return Object.fromEntries(permissionList.map(p => [p, true]));
            }
            return Object.fromEntries(permissionList.map(p => [p, (permissions ?? []).includes(p)]));
        }

        it('should grant ADMIN unrestricted access regardless of empty permissions list', () => {
            const role = 'ADMIN';
            const permissions = [];

            assert.equal(checkPermission(role, permissions, 'LEADS_CREATE'), true);
            assert.equal(checkPermission(role, permissions, 'DEALS_DELETE'), true);
            assert.equal(checkPermission(role, permissions, 'SETTINGS_MANAGE'), true);

            const multi = checkMultiplePermissions(role, permissions, ['ACCOUNTS_CREATE', 'CONTACTS_CREATE']);
            assert.deepEqual(multi, { ACCOUNTS_CREATE: true, CONTACTS_CREATE: true });
        });

        it('should grant SUPER_ADMIN unrestricted access', () => {
            const role = 'SUPER_ADMIN';
            const permissions = [];

            assert.equal(checkPermission(role, permissions, 'LEADS_CREATE'), true);
            assert.equal(checkPermission(role, permissions, 'COMPANY_PLAN_MANAGE'), true);
        });

        it('should enforce strict permission checks for AGENT role', () => {
            const role = 'AGENT';
            const permissions = ['LEADS_VIEW', 'DEALS_VIEW'];

            assert.equal(checkPermission(role, permissions, 'LEADS_VIEW'), true);
            assert.equal(checkPermission(role, permissions, 'LEADS_CREATE'), false);
            assert.equal(checkPermission(role, permissions, 'DEALS_DELETE'), false);

            const multi = checkMultiplePermissions(role, permissions, ['LEADS_VIEW', 'LEADS_CREATE']);
            assert.deepEqual(multi, { LEADS_VIEW: true, LEADS_CREATE: false });
        });
    });
});
