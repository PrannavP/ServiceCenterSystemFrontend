import AuthLayout from "../layouts/AuthLayout";
import BaseLayout from "../layouts/BaseLayout";

import ProtectedRoute from "../guards/ProtectedRoute";
import PublicRoute from "../guards/PublicRoutes";

import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import Landing from "../pages/Landing";
import Dashboard from "../pages/dashboard/Dashboard";

import NotFound from "../pages/NotFound";
import JobCardList from "../pages/app/jobcard/JobcardListPage";
import JobcardManagePage from "../pages/app/jobcard/JobcardManagePage";
import PartListPage from "../pages/app/part/PartListPage";
import PartManagePage from "../pages/app/part/PartManagePage";
import ReceiptListPage from "../pages/app/receipt/ReceiptListPage";
import ReceiptManagePage from "../pages/app/receipt/ReceiptManagePage";
import BillListPage from "../pages/app/billing/BillingListPage";

export const routes = [
    {
        element: (
            <PublicRoute>
                <AuthLayout />
            </PublicRoute>
        ),
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/forgot-password",
                element: <ForgotPassword />,
            },
        ],
    },

    {
        element: (
            <ProtectedRoute>
                <BaseLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                path: "/dashboard",
                element: <Dashboard />,
            },
            {
                path:'/app/jobcard',
                element: <JobCardList />
            },
            {
                path:'/app/jobcard/manage',
                element: <JobcardManagePage isEdit={false} /> // create jobcard page
            },
            {
                path:'/app/jobcard/manage/:id',
                element: <JobcardManagePage isEdit={true} /> // update jobcard page
            },
            {
                path:'/inv/part',
                element: <PartListPage />
            },
            {
                path:'/inv/part/manage',
                element: <PartManagePage isEdit={false} />
            },
            {
                path:'/inv/part/manage/:id',
                element: <PartManagePage isEdit={true} />
            },
            {
                path:'/inv/receipt',
                element: <ReceiptListPage />
            },
            {
                path:'/inv/receipt/manage',
                element: <ReceiptManagePage isEdit={false} />
            },
            {
                path:'/inv/receipt/manage/:id',
                element: <ReceiptManagePage isEdit={true} />
            },
            {
                path: '/app/billing',
                element: <BillListPage />
            }
        ],
    },

    {
        path: "/",
        element: (
            <PublicRoute>
                <Landing />
            </PublicRoute>
        ),
    },
    {
        path: "*",
        element: <NotFound />,
    },
];
