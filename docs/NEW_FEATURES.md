# New Features Implemented

This document provides an overview of the new features implemented in the Wasilni platform based on the feature comparison analysis with Uber and Careem.

## 1. Enhanced Driver Tools

### 1.1. Enhanced Heatmap

**Description:**

The enhanced heatmap provides drivers with real-time insights into demand patterns, wait times, and surge areas. This helps drivers make informed decisions about where to position themselves to maximize their earnings.

**Features:**

- **Color-Coded Zones:** The heatmap is color-coded to indicate demand levels:
  - **Purple:** Surge pricing areas with high demand and low supply.
  - **Red:** Hot zones with the shortest wait times.
  - **Orange:** Medium demand areas with moderate wait times.
  - **Yellow:** Low demand areas with longer wait times.
- **Wait Time Estimates:** Each zone displays the average wait time for a trip request.
- **Surge Multipliers:** Surge zones show the current surge pricing multiplier.
- **Personalized Recommendations:** Drivers receive personalized recommendations based on their current location, time of day, and demand patterns.

**API Endpoint:**

`GET /api/v1/driver-tools/heatmap`

### 1.2. Flexible Destination Mode

**Description:**

Flexible destination mode allows drivers to earn money on their way to a specific destination. Drivers can set a destination and choose between two modes:

- **Flexible Mode:** Receive trip requests that are along the route to the destination, with a configurable maximum detour.
- **Fastest Mode:** Drive directly to the destination without receiving any trip requests.

**Features:**

- **Trip Opportunities:** In flexible mode, drivers see a list of available trips along their route, ranked by a score that considers earnings, detour distance, and detour time.
- **Detour Calculation:** The system calculates the additional distance and time for each trip opportunity.
- **Personalized Recommendations:** Drivers receive recommendations for the best trip opportunities.

**API Endpoints:**

- `POST /api/v1/driver-tools/destination-mode/activate`
- `DELETE /api/v1/driver-tools/destination-mode/deactivate`

## 2. Food Delivery Module (Foundation)

**Description:**

A foundational food delivery module has been implemented to enable Wasilni to expand into the food delivery market. This includes the necessary database entities, services, and controllers to manage restaurants, menus, and food orders.

**Features:**

- **Restaurant Management:** Add and manage restaurant partners.
- **Menu Management:** Create and update restaurant menus with items, prices, and categories.
- **Order Management:** Place and track food orders from creation to delivery.
- **Real-Time Tracking:** Live tracking of food orders for customers.

**Next Steps:**

- Integrate with a payment gateway for online payments.
- Develop the restaurant-facing dashboard for order management.
- Build the food delivery UI in the passenger app.

## 3. Scheduled Rides

**Description:**

Scheduled rides allow users to book trips in advance, providing a convenient and reliable transportation option for important appointments, airport transfers, and other planned events.

**Features:**

- **Advance Booking:** Book trips up to 30 days in advance.
- **Guaranteed Availability:** The system ensures a driver is available for the scheduled time.
- **Automated Dispatch:** The trip is automatically dispatched to a driver at the appropriate time.
- **Reminders and Notifications:** Users receive reminders and notifications about their upcoming scheduled rides.

**Next Steps:**

- Implement the scheduled rides UI in the passenger app.
- Enhance the driver app to show upcoming scheduled rides.
