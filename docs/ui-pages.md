# UI Pages

## Public Pages

### Tenant Login Page
Path: `/login`

The primary public entry. Used by tenants.

Main elements:
- email input
- password input
- login button

### Owner Login Page
Path: `/owner/login`

Used by owner/admin.

Main elements:
- email input
- password input
- login button
- register link (→ `/owner/register`)

### Owner Register Page
Path: `/owner/register`

Main elements:
- business name
- owner full name
- email
- phone number
- password
- sign-in link (→ `/owner/login`)

## Owner App Pages

### Dashboard
Path: `/dashboard`

Cards:
- total rooms
- available rooms
- occupied rooms
- active tenants
- unpaid bills
- overdue bills
- gateway pending bills
- collected amount this month

Lists:
- unpaid bills
- overdue bills
- recent successful payments

### Rooms List
Path: `/rooms`

Features:
- list rooms
- search room
- filter by status
- add room button

### Room Create/Edit
Path: `/rooms/new`, `/rooms/:id/edit`

Fields:
- room number
- room name
- monthly rent
- status
- notes

### Room Detail
Path: `/rooms/:id`

Shows:
- room information
- current tenant/assignment
- bill history related to room

### Tenants List
Path: `/tenants`

Features:
- list tenants
- search tenant
- filter by status
- add tenant button

### Tenant Create/Edit
Path: `/tenants/new`, `/tenants/:id/edit`

Fields:
- full name
- phone number
- email
- identity number
- emergency contact

### Tenant Detail
Path: `/tenants/:id`

Shows:
- tenant information
- current room
- onboarding status
- bill history
- payment history

### Tenant Onboarding Page
Path: `/onboarding/new`

Purpose:
Assign tenant to room and create first rent bill.

Fields:
- tenant
- room
- start date
- monthly rent
- payment due day

After submit:
- room becomes reserved
- tenant becomes pending payment
- first bill is created

### Bills List
Path: `/bills`

Features:
- filter by status
- filter by billing month
- filter by tenant
- filter by room
- open bill detail

Statuses:
- unpaid
- gateway_pending
- paid
- overdue
- cancelled

### Bill Detail
Path: `/bills/:id`

Shows:
- tenant
- room
- billing month
- amount
- due date
- bill status
- payment status
- gateway transaction attempts

Actions:
- create payment link
- copy payment link
- record manual payment
- cancel bill if allowed

### Payments List
Path: `/payments`

Features:
- list successful payments
- filter by month
- filter by tenant
- filter by source: manual/gateway

### Payment Detail
Path: `/payments/:id`

Shows:
- bill
- tenant
- room
- amount
- payment method
- payment source
- gateway transaction if any

## Tenant Portal Pages

### Tenant Dashboard
Path: `/tenant/dashboard`

Shows:
- assigned room
- current unpaid bill
- overdue warning
- payment history summary

### Tenant Bills
Path: `/tenant/bills`

Features:
- list bills
- filter status
- open bill detail

### Tenant Bill Detail
Path: `/tenant/bills/:id`

Shows:
- billing month
- amount
- due date
- status

Actions:
- Pay Now
- open checkout link

### Tenant Payment Result Page
Path: `/tenant/payment-result`

Used after gateway redirects tenant back.

Shows:
- payment processing message
- success message if already confirmed
- pending message if webhook has not arrived yet
- link back to bill detail

### Tenant Payment History
Path: `/tenant/payments`

Shows:
- successful payments
- payment source
- payment method
- amount
- date
