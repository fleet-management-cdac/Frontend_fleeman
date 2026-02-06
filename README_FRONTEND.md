# Frontend Documentation - Fleeman

This document provides a technical overview of the **Fleeman Frontend**, built with **Next.js 14 (App Router)**. It covers core architectural decisions, routing strategies, authentication, and state management.

## 📂 Project Structure & Routing

This project uses the **Next.js App Router** where the directory structure defines the routing.

### **Directory Structure (`/app`)**

| Path | Route | Description |
|------|-------|-------------|
| `app/page.jsx` | `/` | Landing page (Public) |
| `app/login/page.jsx` | `/login` | User authentication page |
| `app/register/page.jsx` | `/register` | User registration page |
| `app/admin/staff/page.jsx` | `/admin/staff` | **Protected**: Admin-only staff management |
| `app/staff/dashboard/page.jsx` | `/staff/dashboard` | **Protected**: Staff dashboard |
| `app/booking/page.jsx` | `/booking` | Vehicle booking flow |
| `app/my-bookings/page.jsx` | `/my-bookings` | Customer's booking history |
| `app/complete-profile/page.jsx` | `/complete-profile` | Mandatory profile completion step |

---

## 🔒 Protected Routes

Route protection in this project is implemented via **Client-Side Layout Checks** and **Context-based Redirection**, rather than middleware.

### **How it works:**
1.  **AuthContext (`context/AuthContext.jsx`)**:
    *   Loads the JWT token from `localStorage` on mount.
    *   Decodes the token to get user role and details.
    *   Provides `user`, `loading`, `isStaff`, and `isCustomer` states to the app.
    *   **Automatic Redirect**: If a user's profile is incomplete, a `useEffect` inside `AuthProvider` forces them to `/complete-profile`.

2.  **Layout Protection (e.g., `app/admin/layout.jsx`)**:
    *   The `AdminLayout` wraps all admin pages.
    *   It checks authentication status in a `useEffect`.
    *   If `!user` or `user.role !== 'admin'`, it redirects to `/login` using `router.replace()`.

**Code Example (`app/admin/layout.jsx`):**
```javascript
useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
        router.replace('/login');
    }
}, [user, loading, router]);
```

### **Interview Questions: Protected Routes**
*   **Q: Why might we choose layout-based protection over Middleware?**
    *   *A: Middleware runs on the edge/server and is great for redirecting before the page loads. Layout checks happen on the client. We might use layout checks if authentication relies on complex client-side state (like decoding a JWT locally) or if we want to show a specific loading state while checking permissions.*
*   **Q: What is the difference between `router.push` and `router.replace`?**
    *   *A: `push` adds a new entry to the history stack (user can click back). `replace` replaces the current entry, preventing the user from navigating back to the protected route after redirection.*

---

## ⚠️ Error Handling

Error handling is distributed across the **Service Layer** and **UI Components**.

### **1. Service Layer (`services/bookingService.js`)**
API calls are wrapped in `fetch` functions that manually throw errors for non-2xx responses.
```javascript
if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Booking failed' }));
    throw new Error(error.message || 'Booking failed');
}
```

### **2. UI Feedback (`react-toastify`)**
Errors caught in components are displayed to the user using toast notifications.
*   **Location**: `app/layout.jsx` includes `<ToastContainer />`.
*   **Usage**: `toast.error(error.message)` in components.

### **Interview Questions: Error Handling**
*   **Q: How does Next.js 14 handle errors in the App Router?**
    *   *A: Next.js provides special `error.js` files that act as React Error Boundaries. They wrap the page/segment and catch runtime errors, allowing you to display a fallback UI without crashing the entire app.*
*   **Q: Why do we need to throw an error manually when using `fetch`?**
    *   *A: Unlike libraries like Axios, the native `fetch` API does not throw an exception for HTTP error statuses (like 404 or 500). It only throws on network failure. We must check `response.ok` manually.*

---

## 🪝 Hooks Usage

The project uses a mix of React built-in hooks and custom hooks.

### **1. Custom Hook: `useAuth`**
*   **Location**: `context/AuthContext.jsx`
*   **Purpose**: Provides easy access to the AuthContext values (`user`, `login`, `logout`).
*   **Implementation**:
    ```javascript
    export const useAuth = () => {
        const context = useContext(AuthContext);
        if (!context) throw new Error('useAuth must be used within AuthProvider');
        return context;
    };
    ```

### **2. Built-in React Hooks**
*   **`useState`**: Used for local component state (e.g., form inputs, loading flags).
*   **`useEffect`**: Used for side effects like data fetching on mount or redirecting users.
*   **`useCallback`**: Used in `AuthContext` to memoize functions like `login` and `checkAuth` to prevent unnecessary re-renders when passed down via context.
*   **`useContext`**: Used to consume global state (Auth, I18n).

### **3. Next.js Hooks**
*   **`useRouter`**: Used for programmatic navigation (`router.push`, `router.replace`).
*   **`usePathname`**: Used to highlight active links in the navigation bar (`app/admin/layout.jsx`).
*   **`useParams`**: (Likely used in dynamic routes like `/staff/bookings/[id]`) to access route parameters.

### **Interview Questions: Hooks**
*   **Q: Why wrap `login` in `useCallback` inside the Context?**
    *   *A: Because it is passed down in the `value` object. If not memoized, it would be recreated on every render of the Provider, causing all consumer components to re-render unnecessarily.*
*   **Q: Can you use `useRouter` in a Server Component?**
    *   *A: No, `useRouter` is a client-side hook. For server-side redirection, you would use the `redirect` function from `next/navigation`.*

---

## 🛣️ Routing Details (App Router)

The App Router works on a directory-based system, where every folder represents a route segment.

*   **Dynamic Routes**: Folders with square brackets (e.g., `app/staff/bookings/[id]/page.jsx`) create dynamic routes where `id` can be any value.
*   **Layouts**: `layout.jsx` files share UI between multiple pages.
    *   `app/layout.jsx`: Top-level layout (Auth Provider, Toast Container).
    *   `app/admin/layout.jsx`: Specific layout for Admin pages (Sidebar/Header).
*   **Page**: `page.jsx` is the unique UI for a route.

### **Interview Questions: Routing**
*   **Q: What is the difference between `layout.js` and `template.js` in Next.js?**
    *   *A: A Layout persists across navigation (state is preserved). A Template re-mounts on every navigation (state is reset, effects re-run).*
*   **Q: How do you make a route "Private" in Next.js without a custom server?**
    *   *A: You can use Middleware to intercept requests and redirect unauthenticated users, or checks within HOCs/Layouts (as done in this project).*
