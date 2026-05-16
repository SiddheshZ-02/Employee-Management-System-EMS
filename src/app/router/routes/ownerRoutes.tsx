import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { DashboardLayout } from "@/app/layouts/DashboardLayout";

const OwnerDashboard = lazy(() =>
  import("@/features/dashboard/pages/OwnerDashboard").then((m) => ({
    default: m.OwnerDashboard,
  }))
);
const CompanyList = lazy(() =>
  import("@/features/companies/pages/CompanyList").then((m) => ({
    default: m.CompanyList,
  }))
);
const CompanyDetails = lazy(() =>
  import("@/features/companies/pages/CompanyDetails").then((m) => ({
    default: m.CompanyDetails,
  }))
);
const CreateCompany = lazy(() =>
  import("@/features/companies/pages/CreateCompany").then((m) => ({
    default: m.CreateCompany,
  }))
);
const CompanyAdmins = lazy(() =>
  import("@/features/companies/pages/CompanyAdmins").then((m) => ({
    default: m.CompanyAdmins,
  }))
);
const BillingPage = lazy(() =>
  import("@/features/billing/pages/Billing").then((m) => ({
    default: m.BillingPage,
  }))
);
const PlansPage = lazy(() =>
  import("@/features/billing/pages/Plans").then((m) => ({
    default: m.PlansPage,
  }))
);
const SupportPage = lazy(() =>
  import("@/features/support/pages/Support").then((m) => ({
    default: m.SupportPage,
  }))
);
const SettingsPage = lazy(() =>
  import("@/features/settings/pages/Settings").then((m) => ({
    default: m.SettingsPage,
  }))
);
const InvoiceTemplateSettings = lazy(() =>
  import("@/features/billing/pages/InvoiceTemplateSettings").then((m) => ({
    default: m.InvoiceTemplateSettings,
  }))
);

export const ownerRoutes = (
  <Route
    path="/owner"
    element={
      <ProtectedRoute requiredRole="Owner">
        <DashboardLayout />
      </ProtectedRoute>
    }
  >
    <Route path="dashboard" element={<OwnerDashboard />} />
    <Route path="companies" element={<CompanyList />} />
    <Route path="companies/:id" element={<CompanyDetails />} />
    <Route path="companies/create" element={<CreateCompany />} />
    <Route path="companies/:id/admins" element={<CompanyAdmins />} />
    <Route path="billing" element={<BillingPage />} />
    <Route path="plans" element={<PlansPage />} />
    <Route path="support" element={<SupportPage />} />
    <Route path="settings" element={<SettingsPage />} />
    <Route
      path="settings/invoice-template"
      element={<InvoiceTemplateSettings />}
    />
  </Route>
);
