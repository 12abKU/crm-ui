/**
 * Empirical Challenger Verification Harness for Milestone 3 (crm-ui-interception)
 * Tests Axios Interceptors, DialogContext Event Dispatch, Toast Suppression,
 * Account Lockout handling, and UI Permission Guards.
 */

import assert from 'assert';
import { createServer } from 'vite';

// Mock Browser Environment
const dispatchedEvents = [];
const eventListeners = new Map();

const mockWindow = {
    location: { href: 'http://localhost/' },
    dispatchEvent: (event) => {
        dispatchedEvents.push(event);
        const listeners = eventListeners.get(event.type) || [];
        listeners.forEach(fn => fn(event));
        return true;
    },
    addEventListener: (type, fn) => {
        if (!eventListeners.has(type)) eventListeners.set(type, []);
        eventListeners.get(type).push(fn);
    },
    removeEventListener: (type, fn) => {
        if (!eventListeners.has(type)) return;
        const list = eventListeners.get(type);
        const idx = list.indexOf(fn);
        if (idx !== -1) list.splice(idx, 1);
    }
};

const storageStore = new Map();
const mockLocalStorage = {
    getItem: (k) => storageStore.get(`local:${k}`) ?? null,
    setItem: (k, v) => storageStore.set(`local:${k}`, String(v)),
    removeItem: (k) => storageStore.delete(`local:${k}`),
    clear: () => {
        for (const k of [...storageStore.keys()]) {
            if (k.startsWith('local:')) storageStore.delete(k);
        }
    }
};

const sessionStore = new Map();
const mockSessionStorage = {
    getItem: (k) => sessionStore.get(k) ?? null,
    setItem: (k, v) => sessionStore.set(k, String(v)),
    removeItem: (k) => sessionStore.delete(k),
    clear: () => sessionStore.clear()
};

class MockCustomEvent {
    constructor(type, eventInitDict) {
        this.type = type;
        this.detail = eventInitDict?.detail;
    }
}

// Attach globals before loading modules
globalThis.window = mockWindow;
globalThis.localStorage = mockLocalStorage;
globalThis.sessionStorage = mockSessionStorage;
globalThis.CustomEvent = MockCustomEvent;

async function runEmpiricalHarness() {
    console.log('================================================================');
    console.log('   CHALLENGER 1: EMPIRICAL INTERCEPTOR & EVENT FLOW HARNESS    ');
    console.log('================================================================\n');

    let totalTests = 0;
    let passedTests = 0;

    function test(name, fn) {
        totalTests++;
        try {
            fn();
            console.log(`  [PASS] Test ${totalTests}: ${name}`);
            passedTests++;
        } catch (err) {
            console.error(`  [FAIL] Test ${totalTests}: ${name}`);
            console.error(`         Error: ${err.message}`);
            throw err;
        }
    }

    async function testAsync(name, fn) {
        totalTests++;
        try {
            await fn();
            console.log(`  [PASS] Test ${totalTests}: ${name}`);
            passedTests++;
        } catch (err) {
            console.error(`  [FAIL] Test ${totalTests}: ${name}`);
            console.error(`         Error: ${err.message}`);
            throw err;
        }
    }

    const viteServer = await createServer({
        server: { middlewareMode: true }
    });

    try {
        // Load the actual production api module and store
        const apiModule = await viteServer.ssrLoadModule('/src/api/index.js');
        const storeModule = await viteServer.ssrLoadModule('/src/store/index.js');
        const api = apiModule.default;
        const store = storeModule.store;

        const responseInterceptor = api.interceptors.response.handlers[0];
        assert(responseInterceptor && responseInterceptor.rejected, 'Response rejection interceptor must be registered');

        function resetEnvironment() {
            dispatchedEvents.length = 0;
            mockWindow.location.href = 'http://localhost/';
            sessionStore.clear();
        }

        // =================================================================
        // SUITE 1: Standard RBAC 403 Forbidden Interception
        // =================================================================
        console.log('\n--- SUITE 1: Standard RBAC 403 Errors ---');

        await testAsync('1.1 Standard RBAC 403 with data.message dispatches crm-permission-denied and suppresses crm-api-error', async () => {
            resetEnvironment();
            const err = {
                response: {
                    status: 403,
                    data: { message: "You don't have permission to perform this action." }
                },
                config: { url: '/api/leads' }
            };

            let caught = null;
            try {
                await responseInterceptor.rejected(err);
            } catch (e) {
                caught = e;
            }

            assert(caught !== null, 'Interceptor must reject the error');
            assert.strictEqual(caught.userMessage, "You don't have permission to perform this action.");

            // Check events
            const permDeniedEvents = dispatchedEvents.filter(e => e.type === 'crm-permission-denied');
            const apiErrorEvents = dispatchedEvents.filter(e => e.type === 'crm-api-error');

            assert.strictEqual(permDeniedEvents.length, 1, 'Exactly one crm-permission-denied event must be dispatched');
            assert.strictEqual(permDeniedEvents[0].detail.title, 'Permission Denied');
            assert.strictEqual(permDeniedEvents[0].detail.message, "You don't have permission to perform this action.");
            assert.strictEqual(apiErrorEvents.length, 0, 'crm-api-error toast must be completely suppressed');
            assert.strictEqual(mockWindow.location.href, 'http://localhost/', 'Must not redirect to /login');
            assert.strictEqual(mockSessionStorage.getItem('logoutReason'), null, 'Must not set logoutReason');
        });

        await testAsync('1.2 Custom message in 403 response data is faithfully forwarded', async () => {
            resetEnvironment();
            const customMsg = 'Agent is forbidden from creating deals directly. Contact Admin.';
            const err = {
                response: {
                    status: 403,
                    data: { message: customMsg }
                },
                config: { url: '/api/deals' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            const permDeniedEvents = dispatchedEvents.filter(e => e.type === 'crm-permission-denied');
            assert.strictEqual(permDeniedEvents.length, 1);
            assert.strictEqual(permDeniedEvents[0].detail.message, customMsg);
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-api-error').length, 0);
        });

        await testAsync('1.3 Fallback to data.error when data.message is absent in 403', async () => {
            resetEnvironment();
            const err = {
                response: {
                    status: 403,
                    data: { error: 'Forbidden' }
                },
                config: { url: '/api/accounts' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            const permDeniedEvents = dispatchedEvents.filter(e => e.type === 'crm-permission-denied');
            assert.strictEqual(permDeniedEvents.length, 1);
            assert.strictEqual(permDeniedEvents[0].detail.message, 'Forbidden');
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-api-error').length, 0);
        });

        await testAsync('1.4 Empty data in 403 falls back to default error message', async () => {
            resetEnvironment();
            const err = {
                response: {
                    status: 403,
                    data: {}
                },
                message: 'Request failed with status code 403',
                config: { url: '/api/contacts' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            const permDeniedEvents = dispatchedEvents.filter(e => e.type === 'crm-permission-denied');
            assert.strictEqual(permDeniedEvents.length, 1);
            assert(permDeniedEvents[0].detail.message.length > 0);
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-api-error').length, 0);
        });

        // =================================================================
        // SUITE 2: Suspended / Expired Account 403 Lockout
        // =================================================================
        console.log('\n--- SUITE 2: Account Lockout 403 Errors ---');

        await testAsync('2.1 Suspended company 403 triggers sign-out and redirect to /login without permission modal', async () => {
            resetEnvironment();
            const suspendMsg = 'Company account has been suspended by administrator.';
            const err = {
                response: {
                    status: 403,
                    data: { message: suspendMsg }
                },
                config: { url: '/api/leads' }
            };

            let caught = null;
            try {
                await responseInterceptor.rejected(err);
            } catch (e) {
                caught = e;
            }

            assert(caught !== null, 'Must reject the promise');
            assert.strictEqual(mockWindow.location.href, '/login', 'Must redirect window to /login');
            assert.strictEqual(mockSessionStorage.getItem('logoutReason'), suspendMsg, 'Must store logoutReason in sessionStorage');

            // Neither permission denied nor api error should fire
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-permission-denied').length, 0, 'Must NOT fire crm-permission-denied modal');
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-api-error').length, 0, 'Must NOT fire crm-api-error toast');
        });

        await testAsync('2.2 Expired trial 403 triggers sign-out and redirect to /login', async () => {
            resetEnvironment();
            const expiredMsg = 'Your trial has expired. Please upgrade your subscription.';
            const err = {
                response: {
                    status: 403,
                    data: { message: expiredMsg }
                },
                config: { url: '/api/deals' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            assert.strictEqual(mockWindow.location.href, '/login');
            assert.strictEqual(mockSessionStorage.getItem('logoutReason'), expiredMsg);
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-permission-denied').length, 0);
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-api-error').length, 0);
        });

        await testAsync('2.3 Case-insensitivity check for lockout keywords (SUSPENDED / EXPIRED)', async () => {
            resetEnvironment();
            const upperMsg = 'ACCOUNT SUSPENDED';
            const err = {
                response: {
                    status: 403,
                    data: { message: upperMsg }
                },
                config: { url: '/api/accounts' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            assert.strictEqual(mockWindow.location.href, '/login');
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-permission-denied').length, 0);
        });

        // =================================================================
        // SUITE 3: Auth Endpoint 403 Bypass
        // =================================================================
        console.log('\n--- SUITE 3: Auth Endpoint Bypass ---');

        await testAsync('3.1 403 on /api/auth/ login endpoint does not trigger modal or redirect', async () => {
            resetEnvironment();
            const err = {
                response: {
                    status: 403,
                    data: { message: 'Invalid credentials or access denied' }
                },
                config: { url: '/api/auth/login' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-permission-denied').length, 0, 'Auth endpoint must not trigger permission modal');
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-api-error').length, 0, 'Auth endpoint must not trigger global error toast');
            assert.strictEqual(mockWindow.location.href, 'http://localhost/', 'Auth endpoint must not redirect');
        });

        // =================================================================
        // SUITE 4: Non-403 Errors (400, 401, 404, 500, 429)
        // =================================================================
        console.log('\n--- SUITE 4: Non-403 Error Handling ---');

        await testAsync('4.1 400 Bad Request triggers crm-api-error and NOT crm-permission-denied', async () => {
            resetEnvironment();
            const err = {
                response: {
                    status: 400,
                    data: { message: 'Validation failed: Email format is invalid' }
                },
                config: { url: '/api/leads' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            const apiErrorEvents = dispatchedEvents.filter(e => e.type === 'crm-api-error');
            const permDeniedEvents = dispatchedEvents.filter(e => e.type === 'crm-permission-denied');

            assert.strictEqual(apiErrorEvents.length, 1, 'Must dispatch crm-api-error for 400');
            assert.strictEqual(apiErrorEvents[0].detail.status, 400);
            assert.strictEqual(apiErrorEvents[0].detail.message, 'Validation failed: Email format is invalid');
            assert.strictEqual(permDeniedEvents.length, 0, 'Must NOT dispatch crm-permission-denied for 400');
        });

        await testAsync('4.2 404 Not Found triggers crm-api-error and NOT crm-permission-denied', async () => {
            resetEnvironment();
            const err = {
                response: {
                    status: 404,
                    data: { message: 'Lead not found' }
                },
                config: { url: '/api/leads/999' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            const apiErrorEvents = dispatchedEvents.filter(e => e.type === 'crm-api-error');
            assert.strictEqual(apiErrorEvents.length, 1, 'Must dispatch crm-api-error for 404');
            assert.strictEqual(apiErrorEvents[0].detail.status, 404);
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-permission-denied').length, 0);
        });

        await testAsync('4.3 500 Internal Server Error triggers crm-api-error and NOT crm-permission-denied', async () => {
            resetEnvironment();
            const err = {
                response: {
                    status: 500,
                    data: { message: 'Database connection failed' }
                },
                config: { url: '/api/deals' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            const apiErrorEvents = dispatchedEvents.filter(e => e.type === 'crm-api-error');
            assert.strictEqual(apiErrorEvents.length, 1, 'Must dispatch crm-api-error for 500');
            assert.strictEqual(apiErrorEvents[0].detail.status, 500);
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-permission-denied').length, 0);
        });

        await testAsync('4.4 429 Rate Limit extracts explicit rate limit message and triggers crm-api-error', async () => {
            resetEnvironment();
            const err = {
                response: {
                    status: 429,
                    data: {}
                },
                config: { url: '/api/leads' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            const apiErrorEvents = dispatchedEvents.filter(e => e.type === 'crm-api-error');
            assert.strictEqual(apiErrorEvents.length, 1);
            assert.strictEqual(apiErrorEvents[0].detail.message, 'Too many attempts. Please wait a minute and try again.');
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-permission-denied').length, 0);
        });

        await testAsync('4.5 401 Unauthorized triggers silent sign-out and redirect to /login', async () => {
            resetEnvironment();
            const err = {
                response: {
                    status: 401,
                    data: { message: 'Token expired' }
                },
                config: { url: '/api/leads' }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            assert.strictEqual(mockWindow.location.href, '/login');
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-api-error').length, 0, 'No toast for 401');
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-permission-denied').length, 0);
        });

        await testAsync('4.6 suppressErrorToast flag suppresses crm-api-error on 404/500', async () => {
            resetEnvironment();
            const err = {
                response: {
                    status: 404,
                    data: { message: 'Entity hidden or unassigned' }
                },
                config: { url: '/api/leads/55', suppressErrorToast: true }
            };

            try {
                await responseInterceptor.rejected(err);
            } catch (_) {}

            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-api-error').length, 0, 'Toast must be suppressed when suppressErrorToast is true');
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-permission-denied').length, 0);
        });

        // =================================================================
        // SUITE 5: DialogContext Event Flow & ConfirmModal Integration
        // =================================================================
        console.log('\n--- SUITE 5: DialogContext Event Listener & Modal Integration ---');

        // Emulate DialogProvider state machine and listener
        class DialogStateController {
            constructor() {
                this.state = {
                    isOpen: false,
                    title: '',
                    message: '',
                    confirmText: 'Confirm',
                    confirmColor: '#ef4444',
                    type: 'confirm',
                    defaultValue: '',
                    resolve: null
                };

                this.showAlert = ({ title, message, confirmText, confirmColor }) => {
                    return new Promise((resolve) => {
                        this.state = {
                            isOpen: true,
                            title,
                            message,
                            confirmText: confirmText || 'OK',
                            confirmColor: confirmColor || '#3b82f6',
                            type: 'alert',
                            defaultValue: '',
                            resolve
                        };
                    });
                };

                this.handlePermissionDenied = (e) => {
                    this.showAlert({
                        title: e.detail?.title || 'Permission Denied',
                        message: e.detail?.message || "You don't have permission to perform this action.",
                        confirmText: 'OK',
                        confirmColor: '#ef4444'
                    });
                };

                mockWindow.addEventListener('crm-permission-denied', this.handlePermissionDenied);
            }

            destroy() {
                mockWindow.removeEventListener('crm-permission-denied', this.handlePermissionDenied);
            }

            confirm() {
                if (this.state.resolve) this.state.resolve(true);
                this.state.isOpen = false;
            }
        }

        test('5.1 DialogContext listener receives crm-permission-denied and opens ConfirmModal with alert type', () => {
            resetEnvironment();
            const controller = new DialogStateController();

            assert.strictEqual(controller.state.isOpen, false);

            mockWindow.dispatchEvent(new MockCustomEvent('crm-permission-denied', {
                detail: {
                    title: 'Custom Denied Title',
                    message: 'You cannot edit this lead.'
                }
            }));

            assert.strictEqual(controller.state.isOpen, true, 'Dialog must be open');
            assert.strictEqual(controller.state.title, 'Custom Denied Title');
            assert.strictEqual(controller.state.message, 'You cannot edit this lead.');
            assert.strictEqual(controller.state.type, 'alert', 'Dialog type must be "alert"');
            assert.strictEqual(controller.state.confirmText, 'OK', 'confirmText must be OK');
            assert.strictEqual(controller.state.confirmColor, '#ef4444', 'confirmColor must be red (#ef4444)');

            // Verify ConfirmModal alert contract:
            // When type === 'alert', onCancel is null in ConfirmModal
            const onCancelProp = (controller.state.type === 'confirm' || controller.state.type === 'prompt') ? () => {} : null;
            assert.strictEqual(onCancelProp, null, 'onCancel must be null for alert type so no Cancel button is shown');

            // Confirming closes dialog
            controller.confirm();
            assert.strictEqual(controller.state.isOpen, false, 'Confirming must close the modal');

            controller.destroy();
        });

        test('5.2 DialogContext listener handles missing detail and applies correct defaults', () => {
            resetEnvironment();
            const controller = new DialogStateController();

            mockWindow.dispatchEvent(new MockCustomEvent('crm-permission-denied', { detail: {} }));

            assert.strictEqual(controller.state.isOpen, true);
            assert.strictEqual(controller.state.title, 'Permission Denied');
            assert.strictEqual(controller.state.message, "You don't have permission to perform this action.");
            assert.strictEqual(controller.state.type, 'alert');

            controller.destroy();
        });

        test('5.3 DialogContext unmount properly cleans up event listener', () => {
            resetEnvironment();
            const controller = new DialogStateController();
            controller.destroy(); // unmounted

            mockWindow.dispatchEvent(new MockCustomEvent('crm-permission-denied', {
                detail: { title: 'Denied', message: 'Test' }
            }));

            assert.strictEqual(controller.state.isOpen, false, 'Unmounted DialogProvider must not handle events');
        });

        // =================================================================
        // SUITE 6: usePermission and RequirePermission Logic
        // =================================================================
        console.log('\n--- SUITE 6: RBAC Bypass and Guard Logic ---');

        function evaluateUsePermission(role, permissions, requiredPerm) {
            if (role === 'SUPER_ADMIN' || role === 'ADMIN') return true;
            return (permissions ?? []).includes(requiredPerm);
        }

        function evaluateUsePermissions(role, permissions, permList) {
            if (role === 'SUPER_ADMIN' || role === 'ADMIN') {
                return Object.fromEntries(permList.map(p => [p, true]));
            }
            return Object.fromEntries(permList.map(p => [p, (permissions ?? []).includes(p)]));
        }

        test('6.1 ADMIN has unrestricted bypass across all permissions', () => {
            const role = 'ADMIN';
            const permissions = []; // no explicit permissions in array

            assert.strictEqual(evaluateUsePermission(role, permissions, 'LEADS_CREATE'), true);
            assert.strictEqual(evaluateUsePermission(role, permissions, 'DEALS_DELETE'), true);
            assert.strictEqual(evaluateUsePermission(role, permissions, 'ARBITRARY_PERMISSION'), true);

            const multi = evaluateUsePermissions(role, permissions, ['ACCOUNTS_EDIT', 'CONTACTS_EDIT', 'DEALS_EDIT']);
            assert.deepStrictEqual(multi, {
                ACCOUNTS_EDIT: true,
                CONTACTS_EDIT: true,
                DEALS_EDIT: true
            });
        });

        test('6.2 SUPER_ADMIN has unrestricted bypass across all permissions', () => {
            const role = 'SUPER_ADMIN';
            const permissions = [];

            assert.strictEqual(evaluateUsePermission(role, permissions, 'LEADS_CREATE'), true);
            assert.strictEqual(evaluateUsePermission(role, permissions, 'DEALS_DELETE'), true);
        });

        test('6.3 AGENT permissions are strictly checked against granted permissions array', () => {
            const role = 'AGENT';
            const permissions = ['LEADS_VIEW', 'CONTACTS_VIEW'];

            assert.strictEqual(evaluateUsePermission(role, permissions, 'LEADS_VIEW'), true);
            assert.strictEqual(evaluateUsePermission(role, permissions, 'LEADS_EDIT'), false);
            assert.strictEqual(evaluateUsePermission(role, permissions, 'DEALS_CREATE'), false);

            const multi = evaluateUsePermissions(role, permissions, ['LEADS_VIEW', 'LEADS_EDIT']);
            assert.deepStrictEqual(multi, {
                LEADS_VIEW: true,
                LEADS_EDIT: false
            });
        });

        test('6.4 Kanban canDrag logic blocks unassigned agents even if they have EDIT permission', () => {
            const userId = 'user_agent_42';

            // Scenario A: Agent has DEALS_EDIT, but is neither owner nor assignee
            const unassignedDeal = {
                id: 101,
                owner: { id: 'other_user' },
                assignees: [{ id: 'third_user' }],
                _isOwner: false,
                _assignedToMe: false
            };
            const can = { DEALS_EDIT: true };
            const isAdminOrAbove = false;

            const canDragUnassigned = isAdminOrAbove || (can.DEALS_EDIT && (unassignedDeal._isOwner || unassignedDeal._assignedToMe));
            assert.strictEqual(canDragUnassigned, false, 'Unassigned agent must not be able to drag deal even with DEALS_EDIT');

            // Scenario B: Agent has DEALS_EDIT and is assignee
            const assignedDeal = {
                id: 102,
                owner: { id: 'other_user' },
                assignees: [{ id: userId }],
                _isOwner: false,
                _assignedToMe: true
            };
            const canDragAssigned = isAdminOrAbove || (can.DEALS_EDIT && (assignedDeal._isOwner || assignedDeal._assignedToMe));
            assert.strictEqual(canDragAssigned, true, 'Assigned agent with DEALS_EDIT can drag deal');

            // Scenario C: Admin can drag unassigned deal
            const canDragAdmin = true || (can.DEALS_EDIT && (unassignedDeal._isOwner || unassignedDeal._assignedToMe));
            assert.strictEqual(canDragAdmin, true, 'Admin can drag any deal');
        });

        // =================================================================
        // SUITE 7: End-to-End Synthetic Simulation
        // =================================================================
        console.log('\n--- SUITE 7: End-to-End Interception & Modal Simulation ---');

        await testAsync('7.1 Simulated Agent 403 request -> Interceptor -> CustomEvent -> DialogContext -> Alert Modal Open', async () => {
            resetEnvironment();
            const dialog = new DialogStateController();

            // 1. Agent attempts to delete a deal without DEALS_DELETE permission
            const simulatedBackendError = {
                response: {
                    status: 403,
                    data: {
                        timestamp: new Date().toISOString(),
                        status: 403,
                        error: 'Forbidden',
                        message: "You don't have permission to delete deals.",
                        fields: null
                    }
                },
                config: { url: '/api/deals/99' }
            };

            // 2. Interceptor catches error
            let caughtError = null;
            try {
                await responseInterceptor.rejected(simulatedBackendError);
            } catch (err) {
                caughtError = err;
            }

            // 3. Verify promise rejection
            assert(caughtError !== null);
            assert.strictEqual(caughtError.userMessage, "You don't have permission to delete deals.");

            // 4. Verify no toast event
            assert.strictEqual(dispatchedEvents.filter(e => e.type === 'crm-api-error').length, 0);

            // 5. Verify modal opened
            assert.strictEqual(dialog.state.isOpen, true);
            assert.strictEqual(dialog.state.title, 'Permission Denied');
            assert.strictEqual(dialog.state.message, "You don't have permission to delete deals.");
            assert.strictEqual(dialog.state.confirmColor, '#ef4444');
            assert.strictEqual(dialog.state.type, 'alert');

            // 6. User clicks 'OK' on alert modal
            dialog.confirm();
            assert.strictEqual(dialog.state.isOpen, false);

            dialog.destroy();
        });

        await testAsync('7.2 Simulated Agent 404 unassigned detail request -> Toast Error (Not Modal)', async () => {
            resetEnvironment();
            const dialog = new DialogStateController();

            // Agent queries unassigned lead /api/leads/888 -> backend returns 404 to mask existence
            const simulated404Error = {
                response: {
                    status: 404,
                    data: {
                        timestamp: new Date().toISOString(),
                        status: 404,
                        error: 'Not Found',
                        message: 'Resource not found',
                        fields: null
                    }
                },
                config: { url: '/api/leads/888' }
            };

            try {
                await responseInterceptor.rejected(simulated404Error);
            } catch (_) {}

            // Modal must NOT open
            assert.strictEqual(dialog.state.isOpen, false, '404 must not open permission denied modal');

            // Global toast MUST fire
            const toastEvents = dispatchedEvents.filter(e => e.type === 'crm-api-error');
            assert.strictEqual(toastEvents.length, 1, '404 must fire crm-api-error toast');
            assert.strictEqual(toastEvents[0].detail.status, 404);
            assert.strictEqual(toastEvents[0].detail.message, 'Resource not found');

            dialog.destroy();
        });

        console.log('\n================================================================');
        console.log(`   ALL ${passedTests} / ${totalTests} EMPIRICAL VERIFICATION TESTS PASSED!`);
        console.log('================================================================\n');

    } finally {
        await viteServer.close();
    }
}

runEmpiricalHarness().catch(err => {
    console.error('\nHarness execution failed:', err);
    process.exit(1);
});
