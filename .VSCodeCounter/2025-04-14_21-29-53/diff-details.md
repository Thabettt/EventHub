# Diff Details

Date : 2025-04-14 21:29:53

Directory c:\\Users\\Abdul\\OneDrive\\Documents\\Projects\\BSW copy\\frontend

Total : 87 files,  11254 codes, 35 comments, 341 blanks, all 11630 lines

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details

## Files
| filename | language | code | comment | blank | total |
| :--- | :--- | ---: | ---: | ---: | ---: |
| [backend/.env](/backend/.env) | Properties | -5 | 0 | 0 | -5 |
| [backend/config/db.js](/backend/config/db.js) | JavaScript | -16 | -1 | -2 | -19 |
| [backend/controllers/adminController.js](/backend/controllers/adminController.js) | JavaScript | -191 | -28 | -22 | -241 |
| [backend/controllers/authController.js](/backend/controllers/authController.js) | JavaScript | -209 | -32 | -41 | -282 |
| [backend/controllers/bookingController.js](/backend/controllers/bookingController.js) | JavaScript | -397 | -70 | -67 | -534 |
| [backend/controllers/eventController.js](/backend/controllers/eventController.js) | JavaScript | -441 | -71 | -77 | -589 |
| [backend/controllers/userController.js](/backend/controllers/userController.js) | JavaScript | -206 | -19 | -38 | -263 |
| [backend/middleware/auth.js](/backend/middleware/auth.js) | JavaScript | -56 | -7 | -10 | -73 |
| [backend/middleware/error.js](/backend/middleware/error.js) | JavaScript | 0 | 0 | -1 | -1 |
| [backend/middleware/upload.js](/backend/middleware/upload.js) | JavaScript | 0 | 0 | -1 | -1 |
| [backend/models/BlacklistedToken.js](/backend/models/BlacklistedToken.js) | JavaScript | -15 | 0 | -3 | -18 |
| [backend/models/Booking.js](/backend/models/Booking.js) | JavaScript | -32 | -2 | -3 | -37 |
| [backend/models/Event.js](/backend/models/Event.js) | JavaScript | -52 | -2 | -3 | -57 |
| [backend/models/User.js](/backend/models/User.js) | JavaScript | -38 | -2 | -3 | -43 |
| [backend/routes/admin.js](/backend/routes/admin.js) | JavaScript | -17 | -4 | -5 | -26 |
| [backend/routes/auth.js](/backend/routes/auth.js) | JavaScript | -39 | -6 | -10 | -55 |
| [backend/routes/bookings.js](/backend/routes/bookings.js) | JavaScript | -32 | -10 | -11 | -53 |
| [backend/routes/events.js](/backend/routes/events.js) | JavaScript | -48 | -41 | -16 | -105 |
| [backend/routes/users.js](/backend/routes/users.js) | JavaScript | -24 | -9 | -11 | -44 |
| [backend/server.js](/backend/server.js) | JavaScript | -45 | -3 | -11 | -59 |
| [backend/utils/emailService.js](/backend/utils/emailService.js) | JavaScript | -19 | -2 | -4 | -25 |
| [backend/utils/errorResponse.js](/backend/utils/errorResponse.js) | JavaScript | 0 | 0 | -1 | -1 |
| [frontend/.eslintrc.js](/frontend/.eslintrc.js) | JavaScript | 0 | 0 | 1 | 1 |
| [frontend/README.md](/frontend/README.md) | Markdown | 7 | 0 | 6 | 13 |
| [frontend/eslint.config.js](/frontend/eslint.config.js) | JavaScript | 32 | 0 | 2 | 34 |
| [frontend/index.html](/frontend/index.html) | HTML | 13 | 0 | 0 | 13 |
| [frontend/package-lock.json](/frontend/package-lock.json) | JSON | 4,619 | 0 | 1 | 4,620 |
| [frontend/package.json](/frontend/package.json) | JSON | 36 | 0 | 1 | 37 |
| [frontend/postcss.config.cjs](/frontend/postcss.config.cjs) | JavaScript | 6 | 1 | 1 | 8 |
| [frontend/public/vite.svg](/frontend/public/vite.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/src/App.jsx](/frontend/src/App.jsx) | JavaScript JSX | 162 | 13 | 18 | 193 |
| [frontend/src/assets/react.svg](/frontend/src/assets/react.svg) | XML | 1 | 0 | 0 | 1 |
| [frontend/src/components/bookings/BookingForm.jsx](/frontend/src/components/bookings/BookingForm.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/common/Button.jsx](/frontend/src/components/common/Button.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/common/Card.jsx](/frontend/src/components/common/Card.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/common/FormInput.jsx](/frontend/src/components/common/FormInput.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/common/Loader.jsx](/frontend/src/components/common/Loader.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/common/ProtectedRoute.jsx](/frontend/src/components/common/ProtectedRoute.jsx) | JavaScript JSX | 15 | 0 | 4 | 19 |
| [frontend/src/components/dashboards/ActionCenter.jsx](/frontend/src/components/dashboards/ActionCenter.jsx) | JavaScript JSX | 88 | 0 | 5 | 93 |
| [frontend/src/components/dashboards/EventList.jsx](/frontend/src/components/dashboards/EventList.jsx) | JavaScript JSX | 54 | 2 | 5 | 61 |
| [frontend/src/components/dashboards/RevenueChart.jsx](/frontend/src/components/dashboards/RevenueChart.jsx) | JavaScript JSX | 34 | 2 | 4 | 40 |
| [frontend/src/components/dashboards/StatCard.jsx](/frontend/src/components/dashboards/StatCard.jsx) | JavaScript JSX | 17 | 0 | 2 | 19 |
| [frontend/src/components/events/EventCard.jsx](/frontend/src/components/events/EventCard.jsx) | JavaScript JSX | 179 | 11 | 18 | 208 |
| [frontend/src/components/events/EventFilters.jsx](/frontend/src/components/events/EventFilters.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/events/EventList.jsx](/frontend/src/components/events/EventList.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/layout/Footer.jsx](/frontend/src/components/layout/Footer.jsx) | JavaScript JSX | 89 | 0 | 7 | 96 |
| [frontend/src/components/layout/Header.jsx](/frontend/src/components/layout/Header.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/layout/LoadingSpinner.jsx](/frontend/src/components/layout/LoadingSpinner.jsx) | JavaScript JSX | 47 | 6 | 9 | 62 |
| [frontend/src/components/layout/Navbar.jsx](/frontend/src/components/layout/Navbar.jsx) | JavaScript JSX | 246 | 10 | 18 | 274 |
| [frontend/src/components/layout/OrganizerSidebar.jsx](/frontend/src/components/layout/OrganizerSidebar.jsx) | JavaScript JSX | 253 | 19 | 21 | 293 |
| [frontend/src/components/layout/Sidebar.jsx](/frontend/src/components/layout/Sidebar.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/components/user/PasswordChangeModal.jsx](/frontend/src/components/user/PasswordChangeModal.jsx) | JavaScript JSX | 179 | 11 | 28 | 218 |
| [frontend/src/context/AuthContext.jsx](/frontend/src/context/AuthContext.jsx) | JavaScript JSX | 51 | 1 | 9 | 61 |
| [frontend/src/hooks/useApi.jsx](/frontend/src/hooks/useApi.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/hooks/useAuth.jsx](/frontend/src/hooks/useAuth.jsx) | JavaScript JSX | 19 | 0 | 4 | 23 |
| [frontend/src/index.css](/frontend/src/index.css) | CSS | 26 | 4 | 7 | 37 |
| [frontend/src/main.jsx](/frontend/src/main.jsx) | JavaScript JSX | 12 | 0 | 2 | 14 |
| [frontend/src/pages/HomePage.jsx](/frontend/src/pages/HomePage.jsx) | JavaScript JSX | 5 | 0 | 2 | 7 |
| [frontend/src/pages/LandingPage.jsx](/frontend/src/pages/LandingPage.jsx) | JavaScript JSX | 772 | 21 | 43 | 836 |
| [frontend/src/pages/admin/DashboardPage.jsx](/frontend/src/pages/admin/DashboardPage.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/pages/auth/LoginPage.jsx](/frontend/src/pages/auth/LoginPage.jsx) | JavaScript JSX | 435 | 8 | 26 | 469 |
| [frontend/src/pages/auth/RegisterPage.jsx](/frontend/src/pages/auth/RegisterPage.jsx) | JavaScript JSX | 219 | 13 | 24 | 256 |
| [frontend/src/pages/auth/ResetPasswordPage.jsx](/frontend/src/pages/auth/ResetPasswordPage.jsx) | JavaScript JSX | 130 | 3 | 13 | 146 |
| [frontend/src/pages/auth/UnauthorizedPage.jsx](/frontend/src/pages/auth/UnauthorizedPage.jsx) | JavaScript JSX | 22 | 0 | 2 | 24 |
| [frontend/src/pages/bookings/BookingsPage.jsx](/frontend/src/pages/bookings/BookingsPage.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/pages/events/CreateEventPage.jsx](/frontend/src/pages/events/CreateEventPage.jsx) | JavaScript JSX | 0 | 0 | 1 | 1 |
| [frontend/src/pages/events/EventDetailPage.jsx](/frontend/src/pages/events/EventDetailPage.jsx) | JavaScript JSX | 964 | 29 | 66 | 1,059 |
| [frontend/src/pages/events/EventsPage.jsx](/frontend/src/pages/events/EventsPage.jsx) | JavaScript JSX | 1,314 | 50 | 69 | 1,433 |
| [frontend/src/pages/organizer/AnalyticsPage.jsx](/frontend/src/pages/organizer/AnalyticsPage.jsx) | JavaScript JSX | 14 | 0 | 1 | 15 |
| [frontend/src/pages/organizer/AttendeesPage.jsx](/frontend/src/pages/organizer/AttendeesPage.jsx) | JavaScript JSX | 14 | 0 | 2 | 16 |
| [frontend/src/pages/organizer/CreateEventPage.jsx](/frontend/src/pages/organizer/CreateEventPage.jsx) | JavaScript JSX | 371 | 30 | 37 | 438 |
| [frontend/src/pages/organizer/DashboardPage.jsx](/frontend/src/pages/organizer/DashboardPage.jsx) | JavaScript JSX | 189 | 6 | 14 | 209 |
| [frontend/src/pages/organizer/EditEventPage.jsx](/frontend/src/pages/organizer/EditEventPage.jsx) | JavaScript JSX | 668 | 27 | 54 | 749 |
| [frontend/src/pages/organizer/EventDetailsPage.jsx](/frontend/src/pages/organizer/EventDetailsPage.jsx) | JavaScript JSX | 1,002 | 16 | 36 | 1,054 |
| [frontend/src/pages/organizer/EventsListPage.jsx](/frontend/src/pages/organizer/EventsListPage.jsx) | JavaScript JSX | 269 | 12 | 18 | 299 |
| [frontend/src/pages/organizer/OrganizerSettingsPage.jsx](/frontend/src/pages/organizer/OrganizerSettingsPage.jsx) | JavaScript JSX | 14 | 0 | 2 | 16 |
| [frontend/src/pages/user/ProfilePage.jsx](/frontend/src/pages/user/ProfilePage.jsx) | JavaScript JSX | 161 | 15 | 23 | 199 |
| [frontend/src/services/api.js](/frontend/src/services/api.js) | JavaScript | 0 | 0 | 1 | 1 |
| [frontend/src/services/authService.js](/frontend/src/services/authService.js) | JavaScript | 113 | 13 | 18 | 144 |
| [frontend/src/services/bookingService.js](/frontend/src/services/bookingService.js) | JavaScript | 0 | 0 | 1 | 1 |
| [frontend/src/services/eventService.js](/frontend/src/services/eventService.js) | JavaScript | 0 | 0 | 1 | 1 |
| [frontend/src/services/organizerService.js](/frontend/src/services/organizerService.js) | JavaScript | 178 | 16 | 29 | 223 |
| [frontend/src/services/userService.js](/frontend/src/services/userService.js) | JavaScript | 65 | 5 | 8 | 78 |
| [frontend/src/utils/formatDate.js](/frontend/src/utils/formatDate.js) | JavaScript | 0 | 0 | 1 | 1 |
| [frontend/src/utils/validation.js](/frontend/src/utils/validation.js) | JavaScript | 0 | 0 | 1 | 1 |
| [frontend/tailwind.config.cjs](/frontend/tailwind.config.cjs) | JavaScript | 22 | 0 | 1 | 23 |
| [frontend/vite.config.js](/frontend/vite.config.js) | JavaScript | 9 | 0 | 2 | 11 |

[Summary](results.md) / [Details](details.md) / [Diff Summary](diff.md) / Diff Details